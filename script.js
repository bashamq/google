const firebaseConfig = {
  apiKey: "dq08PQL2JHCpD13e9295WjatZXFnQOZLCH7Ez4aO",
  authDomain: "esp-983b0.firebaseapp.com",
  databaseURL: "https://esp-983b0-default-rtdb.firebaseio.com/",
  projectId: "esp-983b0",
  storageBucket: "esp-983b0.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_ID"
};

const allowedPassword = "espadmin"; // Change this to your desired password

function checkPassword() {
  const input = document.getElementById("passwordInput").value;
  if (input === allowedPassword) {
    document.getElementById("passwordOverlay").style.display = "none";
  } else {
    alert("❌ Wrong password");
  }
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const allPaths = [
  "3PhaseData", "3PhaseData1", "3PhaseData5", "Home1", "Home10",
  "Home2", "Home3", "Home33", "Home4", "Home5", "Home6", "Home7", "Home8", "Home9",
  "ModbusData", "adnan", "compressor", "energyLogs", "energy_data",
  "productivityLogs", "smart_home", "smart_home1", "smart_home2", "smart_home3",
  "testData"
];

// Create checkboxes
const pathSelector = document.getElementById("pathSelector");
allPaths.forEach(path => {
  const box = document.createElement("input");
  box.type = "checkbox";
  box.value = path;
  box.checked = false;
  box.onchange = updateChartData;
  pathSelector.appendChild(box);
  pathSelector.appendChild(document.createTextNode(" " + path));
  pathSelector.appendChild(document.createElement("br"));
});

// Chart setup
const ctx = document.getElementById("myChart").getContext("2d");
let chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: []
  },
  options: {
    responsive: true,
    plugins: {
      subtitle: {
        display: true,
        text: 'Live Firebase Data',
        font: { size: 14 },
        color: 'gray'
      },
      legend: { position: 'bottom' }
    },
    scales: {
      x: { title: { display: true, text: 'Timestamp' } },
      y: { title: { display: true, text: 'Values' } }
    }
  }
});

// Fetch and plot
function updateChartData() {
  const selectedPaths = Array.from(document.querySelectorAll("#pathSelector input:checked"))
    .map(i => i.value);

  chart.data.labels = [];
  chart.data.datasets = [];
  let labelSet = new Set();

  selectedPaths.forEach(path => {
    db.ref(path).limitToLast(20).on("value", snapshot => {
      const data = snapshot.val();
      if (!data) return;

      const keys = Object.keys(data);
      const tempDatasets = {};

      keys.forEach(key => {
        const entry = data[key];
        if (!entry.Timestamp) return;

        if (!labelSet.has(entry.Timestamp)) {
          chart.data.labels.push(new Date(entry.Timestamp * 1000).toLocaleTimeString());
          labelSet.add(entry.Timestamp);
        }

        Object.keys(entry).forEach(field => {
          if (field === "Timestamp") return;
          const datasetId = `${path}_${field}`;
          if (!tempDatasets[datasetId]) {
            tempDatasets[datasetId] = {
              label: `${path}/${field}`,
              data: [],
              borderWidth: 1,
              fill: false,
              borderColor: getRandomColor()
            };
          }
          tempDatasets[datasetId].data.push(entry[field]);
        });
      });

      Object.values(tempDatasets).forEach(ds => chart.data.datasets.push(ds));
      chart.update();
    });
  });
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

function getRandomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
}
