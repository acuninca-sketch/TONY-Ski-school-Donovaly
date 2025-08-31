const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const auth = admin.auth();

// ========== ADMIN MANAGEMENT ==========

// Callable Function – pridať admina
exports.setAdmin = functions.https.onCall(async (data, context) => {
  // Kontrola, či volajúci má superadmin claim
  if (!context.auth || !context.auth.token.superadmin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Nemáš oprávnenie vykonať túto akciu."
    );
  }

  const email = data.email;
  if (!email) {
    throw new functions.https.HttpsError("invalid-argument", "Email je povinný.");
  }

  try {
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, { admin: true });
    return { message: `Používateľ ${email} bol nastavený ako ADMIN.` };
  } catch (error) {
    throw new functions.https.HttpsError("not-found", error.message);
  }
});

// Callable Function – odobrať admina
exports.removeAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.superadmin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Nemáš oprávnenie vykonať túto akciu."
    );
  }

  const email = data.email;
  if (!email) {
    throw new functions.https.HttpsError("invalid-argument", "Email je povinný.");
  }

  try {
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, { admin: false });
    return { message: `Používateľ ${email} už nie je ADMIN.` };
  } catch (error) {
    throw new functions.https.HttpsError("not-found", error.message);
  }
});

// ========== SPORT MODE MANAGEMENT ==========

// Callable Function – nastaviť športový režim
exports.setSportMode = functions.https.onCall(async (data, context) => {
  // kontrola, či je prihlásený admin
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Nemáš oprávnenie meniť športový režim."
    );
  }

  const mode = data.mode;
  if (!["dual", "lyze", "snb"].includes(mode)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Neplatný režim. Povolené hodnoty: dual, lyze, snb."
    );
  }

  try {
    await admin.firestore().collection("settings").doc("sportAvailability").set({
      mode: mode,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { message: `Režim nastavený na ${mode}` };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

});
