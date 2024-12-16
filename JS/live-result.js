
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
