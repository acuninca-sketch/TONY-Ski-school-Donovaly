// Firebase config (rovnaký ako v admin verzii)
const firebaseConfig = {
  apiKey: "AIzaSyCf1STUPCcqzuTefIgo2Rca49vpNJY4",
  authDomain: "lyziarska-skola.firebaseapp.com",
  projectId: "lyziarska-skola",
  storageBucket: "lyziarska-skola.appspot.com",
  messagingSenderId: "59575233692",
  appId: "1:59575233692:web:c84584d064fc8a79db59",
  measurementId: "G-KRT4ECRERK"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Funkcia na uloženie rezervácie
async function saveReservation(data) {
  try {
    await db.collection("rezervacie").add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp() // 🔥 čas vytvorenia
    });
    alert("✅ Rezervácia bola úspešne uložená!");
  } catch (error) {
    console.error("Chyba pri ukladaní rezervácie:", error);
    alert("❌ Nepodarilo sa uložiť rezerváciu.");
  }
}

// Príklad prepojenia na formulár (ak máš tlačidlo submit)
document.getElementById("reservationForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const reservationData = {
    date: document.getElementById("date").value,
    sport: document.getElementById("sport").value,
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    slots: Array.from(document.querySelectorAll("input[name='slots']:checked")).map(el => el.value),
    note: document.getElementById("note")?.value || ""
  };

  await saveReservation(reservationData);
});
