const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * Funkcia: pridanie admina
 * Spustí iba SUPERADMIN
 */
exports.addAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Musíš byť prihlásený.");
  }

  const callerRoleDoc = await db.collection("roles").doc(context.auth.uid).get();
  if (!callerRoleDoc.exists || callerRoleDoc.data().role !== "superadmin") {
    throw new functions.https.HttpsError("permission-denied", "Len superadmin môže pridávať adminov.");
  }

  const { uid } = data;
  if (!uid) {
    throw new functions.https.HttpsError("invalid-argument", "Chýba UID používateľa.");
  }

  await db.collection("roles").doc(uid).set({ role: "admin" });
  return { message: `Používateľ ${uid} bol pridaný ako ADMIN.` };
});

/**
 * Funkcia: odobratie admina
 * Spustí iba SUPERADMIN
 */
exports.removeAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Musíš byť prihlásený.");
  }

  const callerRoleDoc = await db.collection("roles").doc(context.auth.uid).get();
  if (!callerRoleDoc.exists || callerRoleDoc.data().role !== "superadmin") {
    throw new functions.https.HttpsError("permission-denied", "Len superadmin môže odobrať adminov.");
  }

  const { uid } = data;
  if (!uid) {
    throw new functions.https.HttpsError("invalid-argument", "Chýba UID používateľa.");
  }

  await db.collection("roles").doc(uid).delete();
  return { message: `Používateľ ${uid} už nie je ADMIN.` };
});
