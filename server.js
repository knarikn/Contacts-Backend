const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

app.use(express.json());

// --- In-memory storage ---
const users = [];      // stores users {id, name, email, passwordHash}
const contacts = [];   // stores contacts {id, userId, name, email, phone}
let userIdCounter = 1;
let contactIdCounter = 1;

const JWT_SECRET = "mydummysecret";

// --- Middleware to check auth ---
function auth(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
}

// --- Routes ---

// Test root
app.get("/", (req, res) => {
  res.send("Node.js dummy Contacts API is working!");
});

// Register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ msg: "Missing fields" });

  if (users.find(u => u.email === email)) return res.status(400).json({ msg: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = { id: userIdCounter++, name, email, passwordHash };
  users.push(newUser);

  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ msg: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Get contacts for logged-in user
app.get("/api/contacts", auth, (req, res) => {
  const userContacts = contacts.filter(c => c.userId === req.userId);
  res.json(userContacts);
});

// Create new contact
app.post("/api/contacts", auth, (req, res) => {
  const { name, email, phone } = req.body;
  if (!name) return res.status(400).json({ msg: "Name is required" });

  const newContact = { id: contactIdCounter++, userId: req.userId, name, email, phone };
  contacts.push(newContact);
  res.json(newContact);
});

// Edit a contact
app.put("/api/contacts/:id", auth, (req, res) => {
  const contact = contacts.find(c => c.id === parseInt(req.params.id));
  if (!contact) return res.status(404).json({ msg: "Contact not found" });
  if (contact.userId !== req.userId) return res.status(401).json({ msg: "Not authorized" });

  const { name, email, phone } = req.body;
  contact.name = name || contact.name;
  contact.email = email || contact.email;
  contact.phone = phone || contact.phone;

  res.json(contact);
});

// --- Start server ---
const PORT = 5000;
const HOST = "127.0.0.1";

app.listen(PORT, HOST, () => {
  console.log(`Dummy Contacts API running at http://${HOST}:${PORT}`);
});
