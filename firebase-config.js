const admin = require('firebase-admin');
const serviceAccount = require('./ludoconto-service-account.json');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };