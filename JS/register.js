// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCeKQOD-GrJOIos8m-J-mrXHqwg1WyPT-g",
  authDomain: "cru-nacos-vote.firebaseapp.com",
  databaseURL: "https://cru-nacos-vote-default-rtdb.firebaseio.com",
  projectId: "cru-nacos-vote",
  storageBucket: "cru-nacos-vote.appspot.com",
  messagingSenderId: "771005751339",
  appId: "1:771005751339:web:dcb783f1e35f7d65b8ca6e",
  measurementId: "G-MXTZ1LFZ1T"
};
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
  