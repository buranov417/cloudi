const ACCESS_CODE = "673ziyada";
const API_URL = "https://nodideasai-production.up.railway.app"; // твой API

// --- LOGIN ---
document.getElementById("login-btn").addEventListener("click", () => {
  const code = document.getElementById("access-code").value;
  if (code === ACCESS_CODE) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";
    loadStats();
    loadSteps();
  } else {
    document.getElementById("login-error").innerText = "Wrong code!";
  }
});

// --- LOAD STATS ---
async function loadStats() {
  try {
    const res = await fetch(`${API_URL}/stats`);
    const data = await res.json();
    document.getElementById("stats").innerText = JSON.stringify(data, null, 2);
  } catch (e) {
    document.getElementById("stats").innerText = "Error fetching stats";
  }
}

document.getElementById("refresh-stats").addEventListener("click", loadStats);

// --- GENERATE ACCESS TOKEN ---
document.getElementById("generate-token-btn").addEventListener("click", async () => {
  try {
    const res = await fetch(`${API_URL}/generate-token`, { method: "POST" });
    const data = await res.json();
    document.getElementById("new-token").innerText = data.token;
  } catch (e) {
    document.getElementById("new-token").innerText = "Error generating token";
  }
});

// --- LOAD STEPS ---
async function loadSteps() {
  try {
    const res = await fetch(`${API_URL}/steps`);
    const steps = await res.json();
    const container = document.getElementById("steps");
    container.innerHTML = "";
    steps.forEach(step => {
      const div = document.createElement("div");
      div.innerHTML = `Step ${step.id}: ${step.status}, Loss: ${step.loss}, Complexity: ${step.complexity}`;
      container.appendChild(div);
    });
  } catch (e) {
    document.getElementById("steps").innerText = "Error fetching steps";
  }
}

document.getElementById("refresh-steps").addEventListener("click", loadSteps);