const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const auth = admin.auth();

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
    return { message: `Používateľ ${email} už NIE JE admin.` };
  } catch (error) {
    throw new functions.https.HttpsError("not-found", error.message);
  }
});

// Callable Function – nastaviť superadmina (použi raz manuálne)
exports.setSuperadmin = functions.https.onCall(async (data, context) => {
  // Sem daj podmienku, aby to mohol spraviť iba ty, napr. podľa UID alebo e-mailu
  if (!context.auth || context.auth.token.email !== "tvoj@superadmin.sk") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Len zakladateľ môže nastaviť superadmina."
    );
  }

  const email = data.email;
  if (!email) {
    throw new functions.https.HttpsError("invalid-argument", "Email je povinný.");
  }

  try {
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, { superadmin: true, admin: true });
    return { message: `Používateľ ${email} bol nastavený ako SUPERADMIN.` };
  } catch (error) {
    throw new functions.https.HttpsError("not-found", error.message);
  }
});
