const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// UID superadmina (ten, čo má plnú kontrolu)
const SUPERADMIN_UID = "qVb759slUae8j0rAsnqGxd2SZG72";

/**
 * Inicializácia superadmina – môže byť volaná len pri deployi alebo lokálne
 */
exports.initSuperAdmin = functions.https.onCall(async (data, context) => {
  try {
    const docRef = db.collection("roles").doc(SUPERADMIN_UID);
    const doc = await docRef.get();

    if (doc.exists) {
      return { message: "Superadmin už existuje, nič sa nemení ✅" };
    }

    // Nastavenie custom claims
    await admin.auth().setCustomUserClaims(SUPERADMIN_UID, { superadmin: true, admin: true });

    // Uloženie role do Firestore
    await docRef.set({
      role: "superadmin",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { message: "Superadmin úspešne inicializovaný 🚀" };
  } catch (err) {
    console.error("Chyba pri inicializácii superadmina:", err);
    throw new functions.https.HttpsError("internal", "Chyba pri inicializácii superadmina");
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
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
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

/**
 * Nastavenie športového režimu – môže volať len admin
 */
exports.setSportMode = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "Len admin môže meniť športový režim.");
  }

  await db.collection("settings").doc("sportAvailability").set({
    mode: data.mode,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { message: "Režim nastavený na: " + data.mode };
});

