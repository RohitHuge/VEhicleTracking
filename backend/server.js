require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`\x1b[36m[INCOMING]\x1b[0m ${req.method} ${req.originalUrl}`);
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
        console.log(`${statusColor}[FINISHED]\x1b[0m ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    });
    next();
});


// Routes
app.use("/auth", require("./routes/auth"));
app.use("/vehicles", require("./routes/vehicles"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));