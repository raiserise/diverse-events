// const admin = require("firebase-admin");
// require("dotenv").config();

// console.log("CRED_FIREBASE_TYPE:", process.env.CRED_FIREBASE_TYPE);
// console.log("CRED_FIREBASE_PROJECT_ID:", process.env.CRED_FIREBASE_PROJECT_ID);
// console.log(
//   "CRED_FIREBASE_PRIVATE_KEY_ID:",
//   process.env.CRED_FIREBASE_PRIVATE_KEY_ID
// );
// console.log(
//   "CRED_FIREBASE_PRIVATE_KEY:",
//   process.env.CRED_FIREBASE_PRIVATE_KEY ? "Exists" : "Not Set"
// );
// console.log(
//   "CRED_FIREBASE_CLIENT_EMAIL:",
//   process.env.CRED_FIREBASE_CLIENT_EMAIL
// );
// console.log("CRED_FIREBASE_CLIENT_ID:", process.env.CRED_FIREBASE_CLIENT_ID);
// console.log("CRED_FIREBASE_AUTH_URI:", process.env.CRED_FIREBASE_AUTH_URI);
// console.log("CRED_FIREBASE_TOKEN_URI:", process.env.CRED_FIREBASE_TOKEN_URI);
// console.log(
//   "CRED_FIREBASE_AUTH_PROVIDER_CERT_URL:",
//   process.env.CRED_FIREBASE_AUTH_PROVIDER_CERT_URL
// );
// console.log(
//   "CRED_FIREBASE_CLIENT_CERT_URL:",
//   process.env.CRED_FIREBASE_CLIENT_CERT_URL
// );
// console.log(
//   "CRED_FIREBASE_UNIVERSE_DOMAIN:",
//   process.env.CRED_FIREBASE_UNIVERSE_DOMAIN
// );

// admin.initializeApp({
//   credential: admin.credential.cert({
//     type: process.env.CRED_FIREBASE_TYPE,
//     project_id: process.env.CRED_FIREBASE_PROJECT_ID,
//     private_key_id: process.env.CRED_FIREBASE_PRIVATE_KEY_ID,
//     private_key: process.env.CRED_FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//     client_email: process.env.CRED_FIREBASE_CLIENT_EMAIL,
//     client_id: process.env.CRED_FIREBASE_CLIENT_ID,
//     auth_uri: process.env.CRED_FIREBASE_AUTH_URI,
//     token_uri: process.env.CRED_FIREBASE_TOKEN_URI,
//     auth_provider_x509_cert_url:
//       process.env.CRED_FIREBASE_AUTH_PROVIDER_CERT_URL,
//     client_x509_cert_url: process.env.CRED_FIREBASE_CLIENT_CERT_URL,
//     universe_domain: process.env.CRED_FIREBASE_UNIVERSE_DOMAIN,
//   }),
// });

// const db = admin.firestore();

// module.exports = { db };

const admin = require("firebase-admin");
const serviceAccount = require("../config/firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { db };
