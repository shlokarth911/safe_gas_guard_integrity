const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const http = require("http");
const GasData = require("./models/GasData.mongodb.js"); // Import the GasData model

const app = express();
const port = 3000;

// Set EJS as the view engine
app.set("view engine", "ejs");

// Serve static files from the 'public' directory
app.use(express.static("public"));
app.use(express.json()); // Middleware to parse JSON bodies

// Create an HTTP server
const server = http.createServer(app);

// Initialize socket.io
const io = new Server(server);

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/GasData");

// Check MongoDB connection
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

app.post("/new-data", async (req, res) => {
  try {
    console.log("Received POST request with data:", req.body);

    // Delete all previous records
    await GasData.deleteMany({});

    // Insert new data
    const newData = new GasData({
      connection: req.body.connection,
      gasLevel: req.body.gasLevel,
      powerStatus: req.body.powerStatus,
    });

    await newData.save();
    console.log("Data saved:", newData);

    // Emit the new data to all connected clients
    io.emit("dataUpdate", newData);
    console.log("Data emitted to clients");

    // Check gas level and emit notification if exceeded
    if (newData.gasLevel > 300) {
      io.emit("notification", "Gas level exceeded above the safe limit!");
      console.log("Notification sent: Gas level exceeded");
    }

    res.status(201).send("Data saved and previous data deleted");
  } catch (error) {
    console.error("Error inserting new data:", error.message); // Log error message to console
    res.status(500).send(`Internal Server Error: ${error.message}`); // Send detailed error response
  }
});

// Define route for the homepage
app.get("/", async (req, res) => {
  try {
    const latestReading = await GasData.findOne()
      .sort({ createdAt: -1 })
      .exec();
    res.render("index", { data: latestReading });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Listen for socket connections
io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
