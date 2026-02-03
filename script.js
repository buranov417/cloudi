const ADMIN_KEY = "673ziyada";

// auth
function login() {
  if (document.getElementById("code").value === ADMIN_KEY) {
    localStorage.setItem("auth", "1");
    location.href = "dashboard.html";
  } else alert("Wrong key");
}

function logout() {
  localStorage.clear();
  location.href = "index.html";
}

// protect
if (location.pathname.includes("dashboard")) {
  if (!localStorage.getItem("auth")) location.href = "index.html";
}

// data
let data = JSON.parse(localStorage.getItem("ips") || "[]");

function generateIP() {
  return `${rand()}.${rand()}.${rand()}.${rand()}`;
}
function rand() { return Math.floor(Math.random() * 255); }

function generate() {
  const company = document.getElementById("company").value;
  if (!company) return alert("Company name");

  data.push({
    company,
    ip: generateIP(),
    key: Math.random().toString(36).substring(2, 14)
  });

  save();
}

function remove(i) {
  data.splice(i, 1);
  save();
}

function save() {
  localStorage.setItem("ips", JSON.stringify(data));
  render();
}

function render() {
  const tbody = document.getElementById("list");
  if (!tbody) return;
  tbody.innerHTML = "";
  data.forEach((x, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${x.company}</td>
        <td>${x.ip}</td>
        <td>${x.key}</td>
        <td><button onclick="remove(${i})">Revoke</button></td>
      </tr>`;
  });
}

render();