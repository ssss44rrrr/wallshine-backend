const express = require("express");
const cors = require("cors");

require("./db"); // MongoDB connection

const Quote = require("./models/Quote"); // (new model bana sakte ho)
const Review = require("./models/Review");

const Admin = require("./models/Admin");
const Contact = require("./models/Contact");

const app = express();
app.use(cors({
  origin: true
}));
app.use(express.json());

/* =========================
   GET REVIEWS (SORT + PAGINATION)
========================= */
app.get("/reviews", async (req, res) => {
  try {
    const sort = req.query.sort || "latest";

    let sortQuery = {};

    if (sort === "oldest") sortQuery = { date: 1 };
    else if (sort === "high") sortQuery = { rating: -1 };
    else if (sort === "low") sortQuery = { rating: 1 };
    else sortQuery = { date: -1 };

    const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;

const search = req.query.search || "";

const filter = {
  $or: [
    { name: { $regex: search, $options: "i" } },
    { comment: { $regex: search, $options: "i" } }
  ]
};

const reviews = await Review.find(filter)
  .sort(sortQuery)
  .skip((page - 1) * limit)
  .limit(limit);

const total = await Review.countDocuments(filter);
    res.json({
      total,
      data: reviews
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


/* =========================
   POST REVIEW
========================= */

app.post("/reviews", async (req, res) => {
  try {
    const { name, rating, comment } = req.body;

    const newReview = new Review({
      name,
      rating,
      comment
    });

    await newReview.save();

    res.json({ message: "saved" });

  } catch (err) {
    res.status(500).json({ message: "error" });
  }
});


/* =========================
   DISLIKE REVIEW
========================= */
app.post("/reviews/:id/dislike", async (req, res) => {
  try {
    await Review.findByIdAndUpdate(
  req.params.id,
  req.body,
  { new: true }
);

    res.json({ message: "disliked" });

  } catch (err) {
    res.status(500).json({ message: "error" });
  }
});


/* =========================
   DELETE REVIEW (FIXED)
========================= */
app.delete("/reviews/:id", async (req, res) => {
  try {
    console.log("DELETE ID:", req.params.id);
    const deleted = await Review.findByIdAndDelete(req.params.id);
    
    // Agar data delete ho chuka hai toh clear response bhejein
    res.json({
      success: true,
      message: "Deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete error" });
  }
});

/* =========================
   UPDATE REVIEW (FIXED)
========================= */
app.put("/reviews/:id", async (req, res) => {
  try {

    const updated = await Review.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          comment: req.body.comment
        }
      },
      {
        new: true
      }
    );

    res.json({
      success: true,
      review: updated
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Update error"
    });

  }
});




app.get("/quotes", async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const search = req.query.search || "";

    let query = {};

    if(search){
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { service: { $regex: search, $options: "i" } },
          { message: { $regex: search, $options: "i" } }
        ]
      };
    }

    const data = await Quote.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Quote.countDocuments(query);

    res.json({
      total,
      data
    });

  } catch (err) {
    res.status(500).json({ message: "error" });
  }
});


app.post("/submit-form", async (req, res) => {
  try {

    const quote = new Quote({
      name: req.body.name,
      phone: req.body.phone,
      location: req.body.location,
      service: req.body.service,
      message: req.body.message
    });

    await quote.save();

    res.json({
      success: true,
      message: "Quote submitted successfully ✅"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Error saving quote"
    });

  }
});


app.post("/admin-login", async (req, res) => {
  try {
    const Admin = require("./models/Admin");

    const { username, password } = req.body;

    const user = await Admin.findOne({ username, password });

    if (!user) {
      return res.json({ success: false });
    }

    // expiry time = 2 hours
    const expiry = Date.now() + 2 * 60 * 60 * 1000;

    res.json({
      success: true,
      token: user._id,
      expiry
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});



app.post("/admin-register", async (req, res) => {
  try {
    const Admin = require("./models/Admin");

    const { username, password } = req.body;

    const exists = await Admin.findOne({ username });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    await Admin.create({ username, password });

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


app.get("/create-admin", async (req, res) => {
  const Admin = require("./models/Admin");

  await Admin.create({
    username: "admin123",
    password: "admin"
  });

  res.send("Admin created");
});


app.post("/contact", async (req, res) => {

  try {

    console.log("NEW CONTACT:", req.body);

    const contact = new Contact(req.body);

    await contact.save();

    console.log("Saved to MongoDB ✅");

    res.json({
      success: true
    });

  } catch(err){

    console.log("CONTACT ERROR:", err);

    res.status(500).json({
      success: false
    });

  }

});





// GET CONTACTS
// GET CONTACTS
app.get("/contact", async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const search = req.query.search || "";

    let query = {};

    if(search){
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { message: { $regex: search, $options: "i" } }
        ]
      };
    }

    const skip = (page - 1) * limit;

    const total = await Contact.countDocuments(query);

    const data = await Contact.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data,
      total
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});