const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");

// Import routes
const userRoutes = require("./src/routes/userRoutes");
const drugRoutes = require("./src/routes/drugRoutes");
const prescriptionRoutes = require("./src/routes/prescriptionRoutes");

dotenv.config();

// Connect MongoDB
connectDB();

// Initialize Express
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("🚀 MediScanQR API is running...");
});

app.use("/api/users", userRoutes);
app.use("/api/drugs", drugRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});

