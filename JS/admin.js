// Import ApexCharts
import ApexCharts from "apexcharts";

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

const tabContents = document.querySelectorAll(".tab");
const dashboardTab = document.getElementById("dashboard-tab");
const resultsTab = document.getElementById("results-tab");
const positionsTab = document.getElementById("positions-tab");
const contestantsTab = document.getElementById("contestants-tab");

// Side nav links
const tab1 = document.getElementById("tab1");
const tab2 = document.getElementById("tab2");
const tab3 = document.getElementById("tab3");
const tab4 = document.getElementById("tab4");

// Tab functionality
tab1.addEventListener("click", () => {
  dashboardTab.classList.add("active");
  resultsTab.classList.remove("active");
  positionsTab.classList.remove("active");
  contestantsTab.classList.remove("active");
});
tab2.addEventListener("click", () => {
  dashboardTab.classList.remove("active");
  resultsTab.classList.add("active");
  positionsTab.classList.remove("active");
  contestantsTab.classList.remove("active");
});
tab3.addEventListener("click", () => {
  dashboardTab.classList.remove("active");
  resultsTab.classList.remove("active");
  positionsTab.classList.add("active");
  contestantsTab.classList.remove("active");
});
tab4.addEventListener("click", () => {
  dashboardTab.classList.remove("active");
  resultsTab.classList.remove("active");
  positionsTab.classList.remove("active");
  contestantsTab.classList.add("active");
});

// Load and render charts for each position
async function loadDashboardCharts() {
  const dashboardContainer = document.getElementById("dashboardContainer");
  dashboardContainer.innerHTML = ""; // Clear previous charts

  const positionsSnapshot = await firestore.collection("positions").get();

  positionsSnapshot.forEach((doc) => {
    const position = doc.data();

    // Create a section for each position
    const section = document.createElement("div");
    section.className = "chart-section";
    section.innerHTML = `<h3>${position.name}</h3><div id="chart-${doc.id}" class="chart"></div>`;
    dashboardContainer.appendChild(section);

    // Prepare data for the chart
    const labels = position.contestants.map((contestant) => contestant.name);
    const votes = position.contestants.map((contestant) => contestant.votes);

    // Render the chart using ApexCharts
    const options = {
      chart: {
        type: "area",
        height: 300,
        zoom: {
          enabled: true
        }
      },
      series: [
        {
          name: "Votes",
          data: votes,
        },
      ],
      xaxis: {
        categories: labels,
      },
      colors: ["#40916c"],
      title: {
        text: `${position.name} Votes Overview`,
        align: "center",
      },
    };

    const chart = new ApexCharts(document.querySelector(`#chart-${doc.id}`), options);
    chart.render();
  });
}

// Load Voting Results
async function loadResults() {
  const tableBody = document.querySelector("#resultsTable tbody");
  tableBody.innerHTML = "";
  const positionsSnapshot = await firestore.collection("positions").get();

  positionsSnapshot.forEach((doc) => {
    const position = doc.data();
    position.contestants.forEach((contestant) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${position.name}</td>
        <td>${contestant.name}</td>
        <td>${contestant.votes}</td>
      `;
      tableBody.appendChild(row);
    });
  });
}

// Load Positions with Delete Functionality
async function loadPositions() {
  const positionsList = document.getElementById("positionsList");
  const positionSelect = document.getElementById("positionSelect");
  positionsList.innerHTML = "";
  positionSelect.innerHTML = "<option value=''>Select Position</option>";

  const positionsSnapshot = await firestore.collection("positions").get();

  positionsSnapshot.forEach((doc) => {
    const position = doc.data();
    const li = document.createElement("li");
    li.innerHTML = `
      ${position.name}
      <button class="delete-position delete" data-id="${doc.id}"><i class='bx bx-trash'></i></button>
      <ol id="contestants-${doc.id}">
        ${position.contestants
          .map(
            (contestant, index) =>
              `<li>
                ${contestant.name}
                <button class="delete-contestant delete" data-id="${doc.id}" data-index="${index}"><i class='bx bx-trash'></i></button>
              </li>`
          )
          .join("")}
      </ol>
    `;
    positionsList.appendChild(li);

    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = position.name;
    positionSelect.appendChild(option);
  });

  attachDeleteListeners(); // Attach delete listeners
}

// Add Delete Listeners
function attachDeleteListeners() {
  document.querySelectorAll(".delete-position").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const positionId = btn.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this position?")) {
        await firestore.collection("positions").doc(positionId).delete();
        alert("Position deleted successfully.");
        loadPositions();
      }
    });
  });

  document.querySelectorAll(".delete-contestant").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const positionId = btn.getAttribute("data-id");
      const contestantIndex = parseInt(btn.getAttribute("data-index"));
      if (confirm("Are you sure you want to delete this contestant?")) {
        const positionRef = firestore.collection("positions").doc(positionId);
        const positionDoc = await positionRef.get();
        const positionData = positionDoc.data();
        positionData.contestants.splice(contestantIndex, 1); // Remove contestant
        await positionRef.update(positionData);
        alert("Contestant deleted successfully.");
        loadPositions();
      }
    });
  });
}

// Add Event Listeners
document.getElementById("addPositionForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const positionName = document.getElementById("positionName").value.trim();
  if (positionName) {
    await firestore.collection("positions").add({ name: positionName, contestants: [] });
    loadPositions();
  }
});

document.getElementById("addContestantForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const positionId = document.getElementById("positionSelect").value;
  const contestantName = document.getElementById("contestantName").value.trim();
  if (positionId && contestantName) {
    const positionRef = firestore.collection("positions").doc(positionId);
    const positionDoc = await positionRef.get();
    const positionData = positionDoc.data();
    positionData.contestants.push({ name: contestantName, votes: 0 });
    await positionRef.update(positionData);
    loadPositions();
  }
});
// Load Data on Page Load
window.onload = () => {
  loadDashboardCharts()
  loadResults();
  loadPositions();
};

// Add this code to your existing admin.js file

// Function to show the password prompt
function showPasswordPrompt() {
  const passwordPrompt = document.getElementById("passwordPrompt");
  passwordPrompt.style.display = "block"; // Show the password prompt
}

// Function to check the password
async function checkPassword() {
  const enteredPassword = document.getElementById("adminPassword").value;
  const correctPassword = 2005

  if (enteredPassword === correctPassword) {
    document.getElementById("passwordPrompt").style.display = "none"; // Hide the password prompt
    // Load the admin content
    loadDashboardCharts();
    loadResults();
    loadPositions();
  } else {
    document.getElementById("errorMessage").style.display = "block"; // Show error message
  }
}

// Add event listener to the submit button
document.getElementById("submitPassword").addEventListener("click", checkPassword);

// Show the password prompt on page load
window.onload = () => {
  showPasswordPrompt();
};