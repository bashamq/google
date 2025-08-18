// --- Modal Controls ---
function openHistoryModal() {
  document.getElementById("historyModal").classList.remove("hidden");
}
function closeHistoryModal() {
  document.getElementById("historyModal").classList.add("hidden");
}

// --- History Chart ---
let historyChart;
async function loadHistoryData() {
  const sheetId = "1ploDMTUoV9bxDKVuGtlA4ARlUxgyglO1FHrT8G26hWI"; // Google Sheet ID
  const sheetName = document.getElementById("currentPath").textContent; // use selected path
  const startDate = new Date(document.getElementById("startDate").value);
  const endDate = new Date(document.getElementById("endDate").value);

  if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate)) {
    alert("⚠ Please select valid start and end dates");
    return;
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
  const response = await fetch(url);
  const csvText = await response.text();

  const rows = csvText.split("\n").map(r => r.split(","));
  const dataRows = rows.slice(1);

  let labels = [], voltages = [], currents = [], powers = [];

  dataRows.forEach(row => {
    const dateStr = row[0]; 
    if (!dateStr) return;
    const rowDate = new Date(dateStr);

    if (rowDate >= startDate && rowDate <= endDate) {
      labels.push(dateStr);
      voltages.push(parseFloat(row[1]) || 0);
      currents.push(parseFloat(row[9]) || 0);
      powers.push(parseFloat(row[13]) || 0);
    }
  });

  if (historyChart) historyChart.destroy();

  const ctx = document.getElementById("historyChart").getContext("2d");
  historyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "AVG Phase Voltage", data: voltages, borderColor: "blue", fill: false },
        { label: "Avg Current", data: currents, borderColor: "orange", fill: false },
        { label: "Total Power", data: powers, borderColor: "green", fill: false }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "top" }, title: { display: true, text: "Historical Data" } },
      scales: { y: { beginAtZero: true } }
    }
  });
}
