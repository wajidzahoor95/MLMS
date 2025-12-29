const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // 1️⃣ Load .env file

const app = express();

app.use(cors()); // 2️⃣ Allow frontend requests
app.use(express.json()); // 3️⃣ Read JSON data

mongoose
  .connect(process.env.MONGO_URI) // 4️⃣ Connect Atlas
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => console.log("Mongo Error: ", err));

app.use("/api/admin", require("./routes/admin")); // 5️⃣ Admin APIs
app.use("/api/shops", require("./routes/shops")); // 6️⃣ Shop APIs

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
