const router = require("express").Router();
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register new admin
router.post("/register", async (req, res) => {
  try {
    const { username, password, marketName, totalShops } = req.body;
    const existing = await Admin.findOne({ username });
    if (existing) return res.status(400).json({ message: "Admin exists" });
    const admin = new Admin({ username, password, marketName, totalShops });
    await admin.save();
    res.json({ message: "Admin created" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      "secretkey123",
      { expiresIn: "12h" }
    );
    res.json({
      token,
      marketName: admin.marketName,
      username: admin.username,
      totalShops: admin.totalShops,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
