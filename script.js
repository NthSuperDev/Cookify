// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";

import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";


// Firebase-konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyBuaxqVA7ILD6F8XjElRQuesILfV8Yz0gg",
  authDomain: "cookify-599da.firebaseapp.com",
  projectId: "cookify-599da",
  storageBucket: "cookify-599da.firebasestorage.app",
  messagingSenderId: "972844638311",
  appId: "1:972844638311:web:55932e147dfeafb862f4c2",
  measurementId: "G-ZGYT0E0YZM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 🔐 Registrera användare
function register(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      showMessage("Du har registrerat dig som: " + user.email);
      window.location.href = 'SignIn.html'; // Gå till inloggningssidan efter registrering
    })
    .catch((error) => {
      const errorMessage = convertErrorMessage(error.code);
      showMessage("Fel vid registrering: " + errorMessage);
    });
}

// 🔓 Logga in användare
function login(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      showMessage("Inloggningen lyckades", "success"); // Använd "success" för grönt meddelande

      // Fördröj omdirigeringen med setTimeout (3 sekunder här)
      setTimeout(() => {
        window.location.href = 'index.html'; // Omdirigera efter 3 sekunder
      }, 3000); // 3000ms = 3 sekunder
    })
    .catch((error) => {
      const errorMessage = convertErrorMessage(error.code);
      showMessage("Fel vid inloggning: " + errorMessage, "error"); // Använd "error" för röd meddelande
    });
}



// 👀 Kolla om någon är inloggad
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Inloggad som:", user.email);
  } else {
    console.log("Ingen användare är inloggad.");
  }
});


// Hantera registreringsformulär
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    register(email, password);
  });
}

// Hantera inloggningsformulär
const signinForm = document.getElementById('signin-form');
if (signinForm) {
  signinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    login(email, password);
  });
}

// Hantera Google-inloggning
const googleSignInBtn = document.getElementById("googleSignInBtn");
if (googleSignInBtn) {
  googleSignInBtn.addEventListener("click", () => {
console.log("Google-inloggningsknapp klickad."); // Debug-logg
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        console.log("Google-inloggning lyckades. Användare:", user); // Debug-logg
        alert(`Välkommen, ${user.displayName}!`);
        window.location.href = "index.html"; // Redirect to homepage
      })
      .catch((error) => {
        console.error("Fel vid Google-inloggning:", error); // Debug-logg
        if (error.code === "auth/popup-blocked") {
          alert("Popup-blockering förhindrade inloggning. Tillåt popup-fönster och försök igen.");
        } else {
        alert(`Fel vid Google-inloggning: ${error.message}`);
}
      });
  });
}
function showMessage(message, type = "error") {
  const messageBox = document.getElementById('message-box');
  if (messageBox) {
    messageBox.innerHTML = message; // Visa meddelandet
    // Ta bort tidigare klass
    messageBox.classList.remove('success', 'error');
    // Lägg till rätt klass baserat på meddelandetypen
    if (type === "success") {
      messageBox.classList.add('success');
    } else {
      messageBox.classList.add('error');
    }
  }
}


// Funktion för att konvertera Firebase felmeddelanden till användarvänliga meddelanden
function convertErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'E-postadressen är redan registrerad. Försök med en annan e-post.';
    case 'auth/invalid-email':
      return 'Ogiltig e-postadress. Vänligen kontrollera din e-post.';
    case 'auth/weak-password':
      return 'Lösenordet är för svagt. Vänligen välj ett starkare lösenord.';
    case 'auth/wrong-password':
      return 'Fel lösenord. Kontrollera och försök igen.';
    case 'auth/user-not-found':
      return 'Användaren kunde inte hittas. Kontrollera e-postadressen.';
    case 'auth/popup-blocked':
      return 'Popup-blockering förhindrade inloggning. Tillåt popup-fönster och försök igen.';
    case 'auth/popup-closed-by-user':
      return 'Popupen stängdes av användaren. Försök igen.';
    default:
      return 'Ett okänt fel uppstod. Försök igen senare.';
  }
}








