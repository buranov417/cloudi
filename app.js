const ADMIN_KEY = "673ziyada";

function login() {
    const input = document.getElementById("code").value;
    if(input === ADMIN_KEY){
        localStorage.setItem("auth","1");
        window.location.href = "dashboard.html";
    } else {
        alert("Неверный ключ!");
    }
}

// Кнопка Enter
document.getElementById("enterBtn").addEventListener("click", login);

// Enter на клавиатуре
document.getElementById("code").addEventListener("keypress", function(e){
    if(e.key === "Enter") login();
});