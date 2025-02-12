const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const express = require("express");
// const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
// dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import and use your existing routes
const userRoutes = require("./routes/userRoutes");
app.use("/", userRoutes);

// // Local development: Run Express normally if not in Firebase Functions
// if (process.env.NODE_ENV !== "prod") {
// const port = process.env.SERVER_PORT || 8080;
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
// }

// Firebase Function (V2) - Expose Express API
exports.api = onRequest(app);

// Example Firebase Function (Standalone)
exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
