// server.js

// --- Core Imports ---
const express = require("express");
const dotenv = require("dotenv");
const path = require("path"); // ⬅️ CRITICAL: Must be imported to use path.join

// --- Security & Logging Imports ---
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

// --- Config & Middleware Imports ---
// ✅ FIX: Using path.join(__dirname, ...) for absolute path reliability
const connectDB = require(path.join(__dirname, "src/config", "db.js"));
const { notFound, errorHandler } = require(path.join(
  __dirname,
  "src/middleware",
  "errorMiddleware.js"
));

// --- Route Imports ---
// ✅ FIX: Using path.join(__dirname, ...) for absolute path reliability
const userRoutes = require(path.join(__dirname, "src/routes", "userRoutes.js"));
const drugRoutes = require(path.join(__dirname, "src/routes", "drugRoutes.js"));
const prescriptionRoutes = require(path.join(
  __dirname,
  "src/routes",
  "prescriptionRoutes.js"
));

// Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Connect MongoDB
connectDB();

// Initialize Express
const app = express();

// --- 1. SECURITY & LOGGING MIDDLEWARE ---
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://yourproductionfrontend.com"
        : "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// --- 2. BODY PARSERS ---
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- 3. CORE ROUTES ---
app.get("/", (req, res) => {
  res.json({
    message: "🚀 MediScanQR API is running...",
    status: "Online",
    environment: process.env.NODE_ENV,
    version: "v1",
  });
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/drugs", drugRoutes);
app.use("/api/v1/prescriptions", prescriptionRoutes);

// --- 4. ERROR HANDLING MIDDLEWARE (MUST BE LAST) ---
app.use(notFound);
app.use(errorHandler);

// --- 5. START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `✅ Server Running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});
