const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const multer = require("multer");
const Item = require("../models/Item");
const supabase = require("../config/supabaseClient");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", requireAuth, upload.single("photo"), async (req, res) => {
  try {
    const {
      itemName,
      category,
      subCategory,
      color,
      description,
      status,
      city,
      lat,
      lng,
      reporterName,
      contactInfo,
    } = req.body;

    let photoUrl = "";

    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("photos").getPublicUrl(fileName);
      photoUrl = data.publicUrl;
    }

    const newItem = new Item({
      itemName,
      category,
      subCategory,
      color,
      description,
      status,
      city,
      location: { lat: lat || null, lng: lng || null },
      photoUrl,
      reporterName,
      contactInfo,
      postedBy: req.user.id,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { city, category, status } = req.query;
    const filter = { isResolved: false };
    if (city) filter.city = new RegExp(city, "i");
    if (category) filter.category = new RegExp(category, "i");
    if (status) filter.status = status;

    const items = await Item.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// single item detail (needed for a "view report" page)
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng, radiusKm } = req.query;
    const radius = parseFloat(radiusKm) || 10;
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    const latDelta = radius / 111;
    const lngDelta = radius / (111 * Math.cos((latNum * Math.PI) / 180));

    const items = await Item.find({
      isResolved: false,
      "location.lat": { $gte: latNum - latDelta, $lte: latNum + latDelta },
      "location.lng": { $gte: lngNum - lngDelta, $lte: lngNum + lngDelta },
    }).sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/resolve", requireAuth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    if (item.postedBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not allowed to modify this item." });
    }

    item.isResolved = true;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// general edit (fix a typo, update description, etc.)
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    if (item.postedBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not allowed to modify this item." });
    }

    const allowedFields = [
      "itemName",
      "category",
      "subCategory",
      "color",
      "description",
      "status",
      "city",
      "contactInfo",
      "reporterName",
    ];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) item[field] = req.body[field];
    }

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delete a posting
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    if (item.postedBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not allowed to delete this item." });
    }

    if (item.photoUrl) {
      const fileName = item.photoUrl.split("/").pop();
      await supabase.storage.from("photos").remove([fileName]);
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
