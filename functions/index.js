const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// UID superadmina (ten čo má plnú kontrolu)
const SUPERADMIN_UID = "qVb759slUae8j0rAsnqGxd2SZG72";

/**
 * Inicializácia superadmina pri deployi
 */
exports.initSuperAdmin = functions.runWith({ memory: "128MB", timeoutSeconds: 60 }).https.onRequest(async (req, res) => {
  try {
    // Nastavenie custom claim
    await admin.auth().setCustomUserClaims(SUPERADMIN_UID, { superadmin: true });

    // Zápis do kolekcie roles
    await db.collection("roles").doc(SUPERADMIN_UID).set({
      role: "superadmin",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.send("Superadmin úspešne inicializovaný 🚀");
  } catch (err) {
    console.error(err);
    res.status(500).send("Chyba pri inicializácii superadmina");
  }
});

/**
 * Pridanie admina – môže volať len superadmin
 */
exports.addAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Musíš byť prihlásený.");

  const uid = context.auth.uid;
  const roleDoc = await db.collection("roles").doc(uid).get();
  if (!roleDoc.exists || roleDoc.data().role !== "superadmin") {
    throw new functions.https.HttpsError("permission-denied", "Len superadmin môže spravovať adminov.");
  }

  const { adminUid } = data;
  if (!adminUid) throw new functions.https.HttpsError("invalid-argument", "Chýba UID admina.");

  await admin.auth().setCustomUserClaims(adminUid, { admin: true });
  await db.collection("roles").doc(adminUid).set({
    role: "admin",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { message: `Používateľ ${adminUid} bol pridaný ako admin.` };
});

/**
 * Odobratie admina – môže volať len superadmin
 */
exports.removeAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Musíš byť prihlásený.");

  const uid = context.auth.uid;
  const roleDoc = await db.collection("roles").doc(uid).get();
  if (!roleDoc.exists || roleDoc.data().role !== "superadmin") {
    throw new functions.https.HttpsError("permission-denied", "Len superadmin môže spravovať adminov.");
  }

  const { adminUid } = data;
  if (!adminUid) throw new functions.https.HttpsError("invalid-argument", "Chýba UID admina.");

  await admin.auth().setCustomUserClaims(adminUid, { admin: false });
  await db.collection("roles").doc(adminUid).delete();

  return { message: `Používateľ ${adminUid} už nie je admin.` };
});
