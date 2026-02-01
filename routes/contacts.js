const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Contact = require("../models/Contact");

// Get all contacts of logged-in user
router.get("/", auth, async (req, res) => {
  const contacts = await Contact.find({ user: req.user.id });
  res.json(contacts);
});

// Create a new contact
router.post("/", auth, async (req, res) => {
  const { name, email, phone } = req.body;
  const contact = new Contact({ user: req.user.id, name, email, phone });
  await contact.save();
  res.json(contact);
});

// Edit a contact
router.put("/:id", auth, async (req, res) => {
  const { name, email, phone } = req.body;
  let contact = await Contact.findById(req.params.id);
  if (!contact) return res.status(404).json({ msg: "Contact not found" });
  if (contact.user.toString() !== req.user.id)
    return res.status(401).json({ msg: "Not authorized" });

  contact.name = name || contact.name;
  contact.email = email || contact.email;
  contact.phone = phone || contact.phone;
  await contact.save();
  res.json(contact);
});

module.exports = router;
