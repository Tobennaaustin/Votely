
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

// Function to load live results
function loadLiveResults() {
  const positionsContainer = document.getElementById("positionsContainer");

  // Listen to changes in the positions collection
  firestore.collection("positions").onSnapshot((snapshot) => {
    positionsContainer.innerHTML = ""; // Clear the container
    snapshot.forEach((doc) => {
      const position = doc.data();
      const positionDiv = document.createElement("div");
      positionDiv.className = "position-section";
      positionDiv.innerHTML = `
        <h2>${position.name}</h2>
        <table class="results-table">
          <thead>
            <tr>
              <th>Contestant</th>
              <th>Votes</th>
            </tr>
          </thead>
          <tbody id="contestants-${doc.id}"></tbody>
        </table>
        <h3 id="winner-${doc.id}" class="winner-section"></h3>
      `;

      const contestantsTable = positionDiv.querySelector(`#contestants-${doc.id}`);
      let maxVotes = -1;
      let winner = null;

      position.contestants.forEach((contestant) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${contestant.name}</td>
          <td>${contestant.votes}</td>
        `;
        contestantsTable.appendChild(row);

        // Determine the winner
        if (contestant.votes > maxVotes) {
          maxVotes = contestant.votes;
          winner = contestant.name;
        }
      });

      // Display the winner
      positionDiv.querySelector(`#winner-${doc.id}`).textContent = `Winner: ${winner}`;

      positionsContainer.appendChild(positionDiv);
    });
  });
}

// Load live results on page load
window.onload = loadLiveResults;
