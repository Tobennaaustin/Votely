
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

function secureAndCheckVoting() {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      if (user.emailVerified) {
        console.log("User is authenticated and verified.");

        // Check if the user has already voted
        const userDoc = await firestore.collection("users").doc(user.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData.hasVoted) {
            alert("You have already voted. Thank you!");
            window.location.href = "index.html"; // Redirect to another page
          }
        } else {
          alert("User data not found. Please contact the administrator.");
          auth.signOut();
          window.location.href = "login.html"; // Redirect to login
        }
      } else {
        alert("Please verify your email to access the voting page.");
        window.location.href = "login.html"; // Redirect to login
      }
    } else {
      alert("Please log in to access the voting page.");
      window.location.href = "login.html"; // Redirect to login
    }
  });
}

// Secure the page on load
secureAndCheckVoting();

const positionsContainer = document.getElementById("positionsContainer");

// Load positions and contestants from Firebase
async function loadPositions() {
  const positionsSnapshot = await firestore.collection("positions").get();
  positionsSnapshot.forEach((doc) => {
    const position = doc.data();
    renderPosition(doc.id, position);
  });
}

// Render each position with contestants as radio buttons
function renderPosition(positionId, position) {
  const positionDiv = document.createElement("div");
  positionDiv.className = "position-section";
  positionDiv.innerHTML = `<h3>${position.name}</h3>`;

  position.contestants.forEach((contestant, index) => {
    const contestantDiv = document.createElement("div");
    contestantDiv.className = "contestant-option";

    contestantDiv.innerHTML = `
      <label>
        <input type="radio" name="${positionId}" value="${index}">
        ${contestant.name}
      </label>
    `;
    positionDiv.appendChild(contestantDiv);
  });

  positionsContainer.appendChild(positionDiv);
}

// Handle vote submission
async function submitVotes(event) {
  event.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to vote.");
    return;
  }

  const userDoc = await firestore.collection("users").doc(user.uid).get();
  if (!userDoc.exists) {
    alert("User data not found. Please contact the administrator.");
    return;
  }

  const userData = userDoc.data();
  if (userData.hasVoted) {
    alert("You have already voted. Thank you!");
    window.location.href = "index.html";
    return;
  }

  const formData = new FormData(document.getElementById("votingForm"));
  const votePromises = [];

  // Loop through each position and get the selected contestant index
  for (const [positionId, selectedIndex] of formData.entries()) {
    const positionRef = firestore.collection("positions").doc(positionId);
    const positionSnapshot = await positionRef.get();
    const positionData = positionSnapshot.data();

    // Increase the vote count for the selected contestant
    positionData.contestants[selectedIndex].votes += 1;

    // Update the position document in Firebase
    votePromises.push(positionRef.update({ contestants: positionData.contestants }));
  }

  // Wait for all updates to complete
  await Promise.all(votePromises);

  // Mark the user as having voted
  await firestore.collection("users").doc(user.uid).update({
    hasVoted: true,
  });

  alert("Thank you for voting!");
  document.getElementById("votingForm").reset();
  window.location.href = "liveResults.html"; // Redirect after voting
}

document.getElementById("votingForm").addEventListener("submit", (event) => {
  submitVotes(event);
});

// Load positions and contestants when the page loads
window.onload = loadPositions;
