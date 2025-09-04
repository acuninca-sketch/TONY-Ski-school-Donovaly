const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const SUPERADMIN_UID = "qVb759slUae8j0rAsnqGxd2SZG72";

async function initSuperAdmin() {
  try {
    const docRef = db.collection("roles").doc(SUPERADMIN_UID);
    const doc = await docRef.get();

    if (doc.exists) {
      console.log("Superadmin už existuje, nič sa nemení ✅");
      return;
    }

    await admin.auth().setCustomUserClaims(SUPERADMIN_UID, { superadmin: true, admin: true });

    await docRef.set({
      role: "superadmin",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log("Superadmin úspešne inicializovaný 🚀");
  } catch (err) {
    console.error("Chyba pri inicializácii superadmina:", err);
    process.exit(1);
  }
}

initSuperAdmin();
