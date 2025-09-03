const admin = require("firebase-admin");

admin.initializeApp();

const SUPERADMIN_UID = "qVb759slUae8j0rAsnqGxd2SZG72";

async function initSuperAdmin() {
  try {
    await admin.auth().setCustomUserClaims(SUPERADMIN_UID, { superadmin: true, admin: true });
    const db = admin.firestore();
    await db.collection("roles").doc(SUPERADMIN_UID).set({
      role: "superadmin",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log("Superadmin úspešne inicializovaný 🚀");
  } catch (err) {
    console.error("Chyba pri inicializácii superadmina:", err);
  }
}

initSuperAdmin();
