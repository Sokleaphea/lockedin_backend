import admin from "firebase-admin";

const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountEnv) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set!");
}

const serviceAccount = JSON.parse(serviceAccountEnv);

if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

export const firebaseMessaging = admin.messaging();