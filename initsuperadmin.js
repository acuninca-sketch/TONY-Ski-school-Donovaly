const admin = require("firebase-admin");

// Inicializácia Firebase Admin SDK
admin.initializeApp();

// Tu vlož svoj e-mail, ktorý používaš vo Firebase Auth
const userEmail = "a.cuninca@gmail.com"; // <-- zmeň na svoj email

async function setSuperAdmin() {
  try {
    // Získanie používateľa podľa e-mailu
    const userRecord = await admin.auth().getUserByEmail(userEmail);
    const uid = userRecord.uid;

    // Nastavenie superadmin claim
    await admin.auth().setCustomUserClaims(uid, { superadmin: true });

    console.log(`✅ Superadmin claim nastavený pre: ${userEmail}`);
    console.log("Počkajte 1-2 minúty, kým sa zmeny prejavia.");
  } catch (error) {
    console.error("❌ Chyba pri nastavovaní superadmin claimu:", error);
  }
}
