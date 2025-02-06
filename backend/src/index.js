const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const functions = require("firebase-functions");

dotenv.config();

app.use(express.json());
app.use(cors());
app.use("/", userRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

exports.api = functions.https.onRequest(app);
