// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";

import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendEmailVerification  // Importera sendEmailVerification här
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBuaxqVA7ILD6F8XjElRQuesILfV8Yz0gg",
  authDomain: "cookify-599da.firebaseapp.com",
  projectId: "cookify-599da",
  storageBucket: "cookify-599da.appspot.com",
  messagingSenderId: "972844638311",
  appId: "1:972844638311:web:55932e147dfeafb862f4c2",
  measurementId: "G-ZGYT0E0YZM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 💡 Simple validation for email and password
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

// 🔐 Register user
function register(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // Skicka verifieringsmail med den nya metoden
      sendEmailVerification(user)
        .then(() => {
          showMessage(`Confirmation email sent to your inbox.`, "success");

          // 🕒 Vänta några sekunder och omdirigera till inloggning
          setTimeout(() => {
            window.location.href = 'SignIn.html';
          }, 5000);
        })
        .catch((error) => {
          const errorMessage = convertErrorMessage(error.code);
          showMessage("Failed to send verification email: " + errorMessage, "error");
        });
    })
    .catch((error) => {
      const errorMessage = convertErrorMessage(error.code);
      showMessage("Registration error: " + errorMessage, "error");
    });
}

function login(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      if (!user.emailVerified) {
        showMessage("Please verify your email before logging in. A verification link was sent to your inbox.", "error");
        auth.signOut(); // Logga ut direkt om de inte är verifierade
        return;
      }

      showMessage("Login successful", "success");
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 3000);
    })
    .catch((error) => {
      const errorMessage = convertErrorMessage(error.code);
      showMessage(errorMessage, "error", error.code);
    });
}

// Handle registration form submission
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

// Handle login form submission
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

// Handle Google login button
const googleSignInBtn = document.getElementById("googleSignInBtn");
if (googleSignInBtn) {
  googleSignInBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        alert(`Welcome, ${user.displayName}!`);
        window.location.href = "index.html";
      })
      .catch((error) => {
        if (error.code === "auth/popup-blocked") {
          alert("Popup blocker prevented sign-in. Please allow popups and try again.");
        } else {
          alert(`Google sign-in error: ${error.message}`);
        }
      });
  });
}

// Show message in message box
// Accepts an optional errorCode to add special UI, e.g. forgot password link on wrong password
function showMessage(message, type = "error", errorCode = null) {
  const messageBox = document.getElementById('message-box');
  if (!messageBox) return;

  // Clear existing content
  messageBox.innerHTML = "";
  messageBox.classList.remove('success', 'error');

  if (type === "success") {
    messageBox.classList.add('success');
    messageBox.textContent = message;
  } else {
    messageBox.classList.add('error');
    if (errorCode === 'auth/wrong-password') {
      // Append "Forgot password?" link after the error message
      messageBox.innerHTML = `${message} <br> <a href="forgot-password.html" style="color:#00f; text-decoration:underline;">Forgot password?</a>`;
    } else {
      messageBox.innerHTML = message;
    }
  }
}

// Convert Firebase error codes to user-friendly messages
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
      return 'The verification ID is not valid.';
    case 'auth/missing-verification-code':
      return 'You didn’t provide a verification code.';
    case 'auth/missing-verification-id':
      return 'You didn’t provide a verification ID.';
    case 'auth/requires-recent-login':
      return 'You need to log in again to do this.';
    case 'auth/operation-not-supported-in-this-environment':
      return 'This action can’t be done here.';
    default:
      return 'An unknown error happened. Please try again later.';
  }
}








