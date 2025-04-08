const admin = require("firebase-admin");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split("Bearer ")[1];

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      user_id: decoded.user_id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    res.status(401).json({error: "Unauthorized"});
  }
};

module.exports = {
  auth,
};
