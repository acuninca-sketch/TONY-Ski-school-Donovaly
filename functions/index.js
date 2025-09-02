<<<<<<< HEAD
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
=======
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// UID superadmina (ten čo má plnú kontrolu)
const SUPERADMIN_UID = "qVb759slUae8j0rAsnqGxd2SZG72";

/**
 * Inicializácia superadmina pri deployi
 */
exports.initSuperAdmin = functions.https.onCall(async (data, context) => {
  try {
    // Nastavenie custom claim
    await admin.auth().setCustomUserClaims(SUPERADMIN_UID, { superadmin: true, admin: true });

    // Zápis do kolekcie roles
    await db.collection("roles").doc(SUPERADMIN_UID).set({
      role: "superadmin",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { message: "Superadmin úspešne inicializovaný 🚀" };
  } catch (err) {
    console.error(err);
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

/**
 * Nastavenie športového režimu – môže volať len admin
 */
exports.setSportMode = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "Len admin môže meniť športový režim.");
  }

  await db.collection("settings").doc("sportAvailability").set({
    mode: data.mode,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { message: "Režim nastavený na: " + data.mode };
});
>>>>>>> 262a2a841992b252496e8001713400646be61e06
