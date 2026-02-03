// Код доступа
const ADMIN_CODE = "673ziyada";

// Вход
function login() {
  const pass = document.getElementById("pass").value;
  if(pass === ADMIN_CODE) {
    localStorage.setItem("admin", "true");
    window.location.href = "admin.html";
  } else {
    alert("Неверный код");
  }
}

// Выход
function logout() {
  localStorage.removeItem("admin");
  window.location.href = "index.html";
}

// Защита админки
if(window.location.pathname.includes("admin.html")) {
  if(localStorage.getItem("admin") !== "true") {
    window.location.href = "index.html";
  }
}