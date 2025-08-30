const admin = require("firebase-admin");
admin.initializeApp();

async function makeSuperAdmin() {
  const email = "a.cuninca@gmail.com";
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { superadmin: true });
  console.log("✅ Superadmin nastavený");
}
makeSuperAdmin();
