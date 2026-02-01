const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
});

module.exports = mongoose.model("Contact", ContactSchema);
