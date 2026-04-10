const router = require("express").Router();
const db = require("../db");
const fs = require("fs");
const path = require("path");

const LIVE_DATA_PATH = path.join(__dirname, "../vehicles_live.json");

// Helper to get live data
const getLiveData = () => {
  try {
    if (!fs.existsSync(LIVE_DATA_PATH)) return {};
    return JSON.parse(fs.readFileSync(LIVE_DATA_PATH, "utf8"));
  } catch (err) {
    return {};
  }
};

// Helper to save live data
const saveLiveData = (data) => {
  fs.writeFileSync(LIVE_DATA_PATH, JSON.stringify(data, null, 2));
};

// Add vehicle
router.post("/", async (req, res) => {
  const { user_id, vehicle_name } = req.body;

  try {
    const result = await db.query(
      "INSERT INTO vehicles (user_id, vehicle_name, lat, lng, speed, status) VALUES ($1,$2,18.52,73.85,0,'stopped') RETURNING id",
      [user_id, vehicle_name]
    );

    // Also init in live data
    const live = getLiveData();
    live[result.rows[0].id] = {
      id: result.rows[0].id,
      user_id,
      vehicle_name,
      lat: 18.52,
      lng: 73.85,
      speed: 0,
      status: 'stopped',
      driver_name: 'Driver' // Placeholder until first update
    };
    saveLiveData(live);

    res.json({ message: "Vehicle added", id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all vehicles (Admin only) - NOW FROM JSON
router.get("/all", async (req, res) => {
  try {
    const live = getLiveData();
    res.json(Object.values(live));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get vehicles for specific driver
router.get("/:user_id", async (req, res) => {
  try {
    const data = await db.query(
      "SELECT * FROM vehicles WHERE user_id=$1",
      [req.params.user_id]
    );
    res.json(data.rows);
  } catch (err) {
    console.error("Fetch User Vehicles Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// Update vehicle location (NOW TO JSON FOR SPEED)
router.post("/update/:id", async (req, res) => {
  const { lat, lng, speed, status, driver_name } = req.body;
  const id = req.params.id;

  try {
    // 1. Update JSON for Live Tracking (SPEED)
    const live = getLiveData();
    live[id] = {
      ...live[id],
      id: parseInt(id),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      speed: parseFloat(speed),
      status,
      driver_name: driver_name || (live[id] ? live[id].driver_name : 'Driver'),
      last_updated: new Date()
    };
    saveLiveData(live);

    // 2. Update DB in background (ignore latency here)
    db.query(
      `UPDATE vehicles 
       SET lat = $1, lng = $2, speed = $3, status = $4
       WHERE id = $5`,
      [lat, lng, speed || 0, status || 'moving', id]
    ).catch(e => console.error("Background DB Sync Error:", e.message));

    res.json({ message: "Updated" });
  } catch (err) {
    console.error("Update Vehicle Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;