
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};
console.log(apiKey);
  const firebaseApp = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const firestore = firebase.firestore();
  
  // DOM elements
  const signupBtn = document.getElementById("signupBtn");
  
  // Handle registration
  signupBtn.addEventListener("click", async () => {
    const name = document.getElementById("name").value;
    const level = document.getElementById("level").value;
    const matric = document.getElementById("matric").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
  
    if (!name || !level || !matric || !email || !password) {
      alert("All fields are required!");
      return;
    }
  
    try {
      // Check if matric number is unique in Firestore
      const existingUserSnapshot = await firestore
        .collection("users")
        .where("matric", "==", matric)
        .get();
  
      if (!existingUserSnapshot.empty) {
        alert("This matric number has already been registered.");
        return;
      }
  
      // Create user in Firebase Authentication
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      const uid = user.uid;
  
      // Send email verification
      await user.sendEmailVerification();
      alert("Verification email sent. Please check your inbox and verify your email before signing in.");
  
      // Save user data in Firestore
      await firestore.collection("users").doc(user.uid).set({
        uid: uid,
        name: name,
        level: level,
        matric: matric,
        email: email,
        hasVoted: false,
      });
  
      // Redirect to success page
      window.location.href = "success.html";
    } catch (error) {
      alert("Error during registration: " + error.message);
    }
  });
  