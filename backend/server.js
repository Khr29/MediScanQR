const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const prescriptionRoutes = require("./src/routes/prescriptionRoutes");
const { errorHandler } = require("./src/middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();
app.use(express.json()); // parse JSON

// Routes
app.use("/api/prescriptions", prescriptionRoutes);

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
