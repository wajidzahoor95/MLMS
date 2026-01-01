const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

const app = express();

/* ---------- Middlewares ---------- */
app.use(cors());
app.use(express.json());

/* ---------- MongoDB Connection ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // stop app if DB fails
  });

/* ---------- Routes ---------- */
app.use("/api/admin", require("./routes/admin"));
app.use("/api/shops", require("./routes/shops"));

/* ---------- Health Check ---------- */
app.get("/", (req, res) => {
  res.send("Backend is running");
});

/* ---------- Server ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
