// Replace with your published Google Sheet CSV link
const sheetUrl = "https://docs.google.com/spreadsheets/d/1ploDMTUoV9bxDKVuGtlA4ARlUxgyglO1FHrT8G26hWI/export?format=csv";

// History Modal controls
function openHistoryModal() {
  document.getElementById("historyModal").classList.remove("hidden");
  loadHistoricalData();
}

function closeHistoryModal() {
  document.getElementById("historyModal").classList.add("hidden");
}

// Load historical data from Google Sheet CSV
async function loadHistoricalData() {
  const response = await fetch(sheetUrl);
  const text = await response.text();
  const rows = text.split("\n").map(r => r.split(",")).filter(r => r.length > 1);

  // Header row mapping (your sheet structure)
  const headers = rows[0];
  const dateIndex = headers.indexOf("Date & Time");
  const voltageIndex = headers.indexOf("AVG Phase Voltage");
  const currentIndex = headers.indexOf("Avg Current");
  const powerIndex = headers.indexOf("Total Power");

  const labels = [];
  const voltageData = [];
  const currentData = [];
  const powerData = [];

  rows.slice(1).forEach(row => {
    if (row[dateIndex]) {
      labels.push(row[dateIndex]);
      voltageData.push(parseFloat(row[voltageIndex]) || 0);
      currentData.push(parseFloat(row[currentIndex]) || 0);
      powerData.push(parseFloat(row[powerIndex]) || 0);
    }
  });

  // Destroy old chart if it exists
  if (window.historyChart) {
    window.historyChart.destroy();
  }

  const ctx = document.getElementById("historyChart").getContext("2d");
  window.historyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        { label: "AVG Phase Voltage (V)", data: voltageData, borderColor: "blue", fill: false },
        { label: "Avg Current (A)", data: currentData, borderColor: "orange", fill: false },
        { label: "Total Power (kW)", data: powerData, borderColor: "green", fill: false }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Historical Energy Data" }
      }
    }
  });
}

// Download Historical Chart as PDF
function downloadHistoryPDF() {
  const { jsPDF } = window.jspdf;
  html2canvas(document.getElementById("historyChart")).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const imgWidth = 280;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    pdf.text("Smart Energy Dashboard - Historical Graph", 14, 15);
    pdf.addImage(imgData, 'PNG', 10, 20, imgWidth, imgHeight);
    pdf.save("historical_chart.pdf");
  });
}
