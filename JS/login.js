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


const loginBtn = document.getElementById("loginbtn");

loginBtn.addEventListener("click", async () => {
  const identifier = document.getElementById("identifier").value.trim(); 
  const password = document.getElementById("password").value; 

  if (!identifier || !password) {
    alert("Both fields are required.");
    return;
  }

  try {
    let email = identifier;

    // Check if the identifier is a matric number (doesn't contain '@')
    if (!identifier.includes("@")) {
      const userSnapshot = await firestore
        .collection("users")
        .where("matric", "==", identifier)
        .get();

      if (userSnapshot.empty) {
        alert("Matric number not found.");
        return;
      }

      // Retrieve the email associated with the matric number
      email = userSnapshot.docs[0].data().email;
    }

    // Firebase authentication with email and password
    auth
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Ensure the email is verified before allowing login
        if (user.emailVerified) {
          console.log("User is signed in with a verified email.");
          // Redirect to the voting page upon successful login
          location.href = "voting.html";
        } else {
          alert("Please verify your email before signing in.");
        }
      })
      .catch((error) => {
        alert("Error signing in: " + error.message);
        console.log("Error signing in: " + error.message);
      });
  } catch (error) {
    alert("Error during login process: " + error.message);
    console.log("Error during login process: " + error.message);
  }
});
