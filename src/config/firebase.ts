import admin from "firebase-admin";
import fs from "fs";
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
const serviceAccount = JSON.parse(fs.readFileSync("./lockedin-firebase-admin.json", "utf-8"))

if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

export const firebaseMessaging = admin.messaging();