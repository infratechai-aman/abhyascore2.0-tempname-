import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const uid = "QeoCZphRjMWJf1tS5OEFjWeQxd63";

admin.auth().setCustomUserClaims(uid, { admin: true })
    .then(() => {
        console.log("✅ Admin role added successfully for UID:", uid);
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Error:", err.message);
        process.exit(1);
    });
