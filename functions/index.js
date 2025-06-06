const {onRequest} = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import and use your existing routes
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const rsvpRoutes = require("./routes/rsvpRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/", userRoutes);
app.use("/", eventRoutes);
app.use("/", rsvpRoutes);
app.use("/", notificationRoutes);

// // Local development: Run Express normally if not in Firebase Functions
// if (process.env.NODE_ENV !== "prod") {
const port = process.env.SERVER_PORT || 8080;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
// }

// Firebase Function (V2) - Expose Express API
exports.api = onRequest(app);

// // Example Firebase Function (Standalone)
// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", { structuredData: true });
//   response.send("Hello from Firebase!");
// });
