const router = require("express").Router();
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const Shop = require("../models/Shop");

// Helper validation
function validateShopPayload(body) {
  const errors = [];
  if (!body.name || typeof body.name !== "string" || !body.name.trim())
    errors.push("Invalid or missing name");
  if (!body.keeper || typeof body.keeper !== "string" || !body.keeper.trim())
    errors.push("Invalid or missing keeper");
  if (
    body.base === undefined ||
    isNaN(Number(body.base)) ||
    Number(body.base) < 0
  )
    errors.push("Invalid or missing base");
  if (
    body.advance === undefined ||
    isNaN(Number(body.advance)) ||
    Number(body.advance) < 0
  )
    errors.push("Invalid or missing advance");
  if (!body.start || isNaN(Date.parse(body.start)))
    errors.push("Invalid or missing start (YYYY-MM-DD)");

  if (body.rents) {
    if (!Array.isArray(body.rents)) {
      errors.push("Rents must be an array");
    } else {
      body.rents.forEach((r, idx) => {
        if (!r || !r.month || typeof r.month !== "string")
          errors.push(`Rents[${idx}].month invalid`);
        if (
          r.amount === undefined ||
          isNaN(Number(r.amount)) ||
          Number(r.amount) < 0
        )
          errors.push(`Rents[${idx}].amount invalid`);
      });
    }
  }

  return errors;
}

// Get all shops
router.get("/", auth, async (req, res) => {
  try {
    const shops = await Shop.find({ admin: req.admin.id });
    return res.json(shops);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while fetching shops" });
  }
});

// Add shop
router.post("/", auth, async (req, res) => {
  try {
    const errors = validateShopPayload(req.body);
    if (errors.length)
      return res.status(400).json({ message: errors.join("; ") });

    // Check duplicate name under same admin
    const existing = await Shop.findOne({
      name: req.body.name.trim(),
      admin: req.admin.id,
    });
    if (existing)
      return res.status(400).json({
        message: "Shop with this name already exists under this admin",
      });

    const payload = {
      name: req.body.name.trim(),
      keeper: req.body.keeper.trim(),
      base: Number(req.body.base),
      advance: Number(req.body.advance),
      start: new Date(req.body.start),
      admin: req.admin.id,
      rents: req.body.rents || [],
    };

    const shop = new Shop(payload);
    await shop.save();
    return res.status(201).json(shop);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while creating shop" });
  }
});

// Edit shop
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid shop id" });

    const existingShop = await Shop.findById(id);
    if (!existingShop || existingShop.admin.toString() !== req.admin.id)
      return res.status(403).json({ message: "Unauthorized" });

    const errors = validateShopPayload(req.body);
    if (errors.length)
      return res.status(400).json({ message: errors.join("; ") });

    // ✅ FIXED NAME CHECK (admin-specific)
    const other = await Shop.findOne({
      name: req.body.name.trim(),
      admin: req.admin.id,
      _id: { $ne: id },
    });

    if (other)
      return res
        .status(400)
        .json({ message: "Another shop with this name exists" });

    const payload = {
      name: req.body.name.trim(),
      keeper: req.body.keeper.trim(),
      base: Number(req.body.base),
      advance: Number(req.body.advance),
      start: new Date(req.body.start),
      rents: req.body.rents || [],
    };

    const shop = await Shop.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!shop) return res.status(404).json({ message: "Shop not found" });

    return res.json(shop);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while updating shop" });
  }
});

// Delete shop
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid shop id" });

    // Check ownership
    const existingShop = await Shop.findById(id);
    if (!existingShop || existingShop.admin.toString() !== req.admin.id)
      return res.status(403).json({ message: "Unauthorized" });

    const deleted = await Shop.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Shop not found" });
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while deleting shop" });
  }
});

module.exports = router;
