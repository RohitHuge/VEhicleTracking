const router = require("express").Router();
const db = require("../db");

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    await db.query(
      "INSERT INTO userss (name, email, password, role) VALUES ($1,$2,$3, 'driver')",
      [name, email, password]
    );
    res.json({ message: "User created" });
  } catch (err) {
    console.error("Registration Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.query(
      "SELECT * FROM userss WHERE email=$1 AND password=$2",
      [email, password]
    );

    if (user.rows.length === 0)
      return res.status(400).json({ message: "Invalid credentials" });

    res.json(user.rows[0]);
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;