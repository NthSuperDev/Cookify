// Importera Firebase-moduler
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendEmailVerification,
  signOut, 
  deleteUser
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Firebase-konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyBuaxqVA7ILD6F8XjElRQuesILfV8Yz0gg",
  authDomain: "cookify-599da.firebaseapp.com",
  projectId: "cookify-599da",
  storageBucket: "cookify-599da.appspot.com",
  messagingSenderId: "972844638311",
  appId: "1:972844638311:web:55932e147dfeafb862f4c2",
  measurementId: "G-ZGYT0E0YZM"
};

// Initiera Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore();
const provider = new GoogleAuthProvider();

// Validera email och lösenord
function validateForm(email, password) {
  const errors = [];

  if (!email || !email.includes('@') || !email.includes('.')) {
    errors.push("Invalid email address. Please check it.");
  }

  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters long.");
  }

  return errors;
}

// Registrera användare med email och lösenord
async function register(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Lägg till användare i Firestore med rollen "Member"
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: "Member",
      createdAt: new Date()
    });

    // Skicka verifieringsmail
    await sendEmailVerification(user);
    showMessage(`Confirmation email sent to your inbox.`, "success");

    setTimeout(() => {
      window.location.href = 'SignIn.html';
    }, 5000);

  } catch (error) {
    const errorMessage = convertErrorMessage(error.code);
    showMessage("Registration error: " + errorMessage, "error");
  }
}

// Logga in användare med email och lösenord
async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      showMessage("Please verify your email before logging in. A verification link was sent to your inbox.", "error");
      await signOut(auth); // Logga ut om ej verifierad
      return;
    }

    showMessage("Login successful", "success");
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 3000);

  } catch (error) {
    const errorMessage = convertErrorMessage(error.code);
    showMessage(errorMessage, "error", error.code);
  }
}

// Logga in med Google och lägg till i Firestore om ny användare
async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Kolla om användaren finns i Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      // Lägg till användaren i Firestore med "Member"-rollen
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "Member",
        createdAt: new Date()
      });
    }

    alert(`Welcome, ${user.displayName}!`);
    window.location.href = "index.html";

  } catch (error) {
    if (error.code === "auth/popup-blocked") {
      alert("Popup blocker prevented sign-in. Please allow popups and try again.");
    } else {
      alert(`Google sign-in error: ${error.message}`);
    }
  }
}

// Funktion för att radera användarens konto OCH Firestore-data
async function deleteAccountAndData(user) {
  try {
    if (!confirm("Are you sure you want to permanently delete your account and all data? This action cannot be undone.")) {
      return;
    }

    if (!user || !user.uid) {
      showMessage("User is not valid or not logged in.", "error");
      return;
    }

    // Ta bort användarens dokument i Firestore
    await deleteDoc(doc(db, "users", user.uid));

    // Ta bort användarkontot i Firebase Authentication
    await deleteUser(user);

    showMessage("Your account and data have been deleted.", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 3000);

  } catch (error) {
    console.error("Error deleting account:", error);
    showMessage("Failed to delete account: " + convertErrorMessage(error.code || ""), "error");
  }
}

// Event listeners för formulär
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    const errors = validateForm(email, password);
    if (errors.length > 0) {
      showMessage(errors.join('<br>'), "error");
    } else {
      register(email, password);
    }
  });
}

const signinForm = document.getElementById('signin-form');
if (signinForm) {
  signinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;

    const errors = validateForm(email, password);
    if (errors.length > 0) {
      showMessage(errors.join('<br>'), "error");
    } else {
      login(email, password);
    }
  });
}

const googleSignInBtn = document.getElementById("googleSignInBtn");
if (googleSignInBtn) {
  googleSignInBtn.addEventListener("click", loginWithGoogle);
}

// Lägg till eventlistener för "Radera konto"-knappen
const deleteAccountBtn = document.getElementById("deleteAccountBtn");
if (deleteAccountBtn) {
  deleteAccountBtn.addEventListener("click", () => {
    const user = auth.currentUser;
    if (user) {
      deleteAccountAndData(user);
    } else {
      showMessage("No user is currently logged in.", "error");
    }
  });
}

// Visa meddelanden i UI
function showMessage(message, type = "error", errorCode = null) {
  const messageBox = document.getElementById('message-box');
  if (!messageBox) return;

  messageBox.innerHTML = "";
  messageBox.classList.remove('success', 'error');

  if (type === "success") {
    messageBox.classList.add('success');
    messageBox.textContent = message;
  } else {
    messageBox.classList.add('error');
    if (errorCode === 'auth/wrong-password') {
      messageBox.innerHTML = `${message} <br> <a href="forgot-password.html" style="color:#00f; text-decoration:underline;">Forgot password?</a>`;
    } else {
      messageBox.innerHTML = message;
    }
  }
}

// Översätt Firebase-felmeddelanden till användarvänliga meddelanden
function convertErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please use a different email.';
    case 'auth/invalid-email':
      return 'The email address you entered is not valid. Please check and try again.';
    case 'auth/weak-password':
      return 'Your password is too weak. Please choose a stronger password.';
    case 'auth/wrong-password':
      return 'The password you entered is wrong. Please try again.';
    case 'auth/user-not-found':
      return 'No account found with that email. Please check your email or sign up first.';
    case 'auth/popup-blocked':
      return 'A popup was blocked. Please allow popups in your browser and try again.';
    case 'auth/popup-closed-by-user':
      return 'You closed the popup before signing in. Please try again.';
    case 'auth/network-request-failed':
      return 'There was a network problem. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'You have tried too many times. Please wait a bit and try again.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not allowed. Please contact support.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/invalid-api-key':
      return 'The API key is not valid. Please check your app settings.';
    case 'auth/argument-error':
      return 'There was an error with the information you provided. Please check and try again.';
    case 'auth/app-not-authorized':
      return 'This app is not allowed to use this sign-in method. Please check your settings.';
    case 'auth/credential-already-in-use':
      return 'This login info is already used by another account.';
    case 'auth/account-exists-with-different-credential':
      return 'An account with this email exists but uses a different sign-in method.';
    case 'auth/invalid-credential':
      return 'The login info you gave is invalid or expired. Please try again.';
    case 'auth/invalid-verification-code':
      return 'The verification code you entered is not correct.';
    case 'auth/invalid-verification-id':
      return 'The verification ID is invalid. Please try again.';
    default:
      return 'An unknown error occurred. Please try again later.';
  }
}

// On auth state change (optional: kan användas för att uppdatera UI eller redirect)
onAuthStateChanged(auth, user => {
  if (user) {
    console.log("User signed in:", user.email);
  } else {
    console.log("No user signed in.");
  }
});
