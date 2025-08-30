const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Funkcia na nastavenie admin práv
exports.setAdmin = functions.https.onCall(async (data, context) => {
  // overíme, že volajúci je superadmin
  if (!context.auth || context.auth.token.superadmin !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Nemáš oprávnenie spustiť túto funkciu"
    );
  }

  const email = data.email;
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    return { message: `✅ Admin práva nastavené pre ${email}` };
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
});

// Funkcia na zrušenie admin práv
exports.removeAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.superadmin !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Nemáš oprávnenie spustiť túto funkciu"
    );
  }

  const email = data.email;
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, {});
    return { message: `❌ Admin práva zrušené pre ${email}` };
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
});
