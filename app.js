const ADMIN_KEY = "673ziyada";

// ---------- Вход ----------
function login() {
    const input = document.getElementById("code")?.value;
    if(input === ADMIN_KEY){
        localStorage.setItem("auth","1");
        window.location.href = "admin.html";
    } else {
        alert("Неверный ключ!");
    }
}

// Кнопка Enter
document.getElementById("enterBtn")?.addEventListener("click", login);

// Enter на клавиатуре
document.getElementById("code")?.addEventListener("keypress", function(e){
    if(e.key === "Enter") login();
});

// ---------- Админка ----------
if(window.location.pathname.endsWith("admin.html")){
    // Проверка авторизации
    if(localStorage.getItem("auth") !== "1"){
        window.location.href = "index.html";
    }

    const ipListEl = document.getElementById("ipList");
    const newIP = document.getElementById("newIP");
    const addIPBtn = document.getElementById("addIP");
    const resultEl = document.getElementById("result");
    const runBtn = document.getElementById("runOptimization");
    const logoutBtn = document.getElementById("logoutBtn");

    let ips = JSON.parse(localStorage.getItem("ips") || "[]");

    function renderIPs(){
        ipListEl.innerHTML = "";
        ips.forEach(ip => {
            const li = document.createElement("li");
            li.textContent = ip;
            ipListEl.appendChild(li);
        });
    }

    addIPBtn.addEventListener("click", ()=>{
        const val = newIP.value.trim();
        if(val && !ips.includes(val)){
            ips.push(val);
            localStorage.setItem("ips", JSON.stringify(ips));
            renderIPs();
            newIP.value = "";
        }
    });

    runBtn.addEventListener("click", ()=>{
        // Генерация тестового JSON
        const json = ips.map(ip => ({
            ip,
            optimization: (Math.random()*30+20).toFixed(2) + "%",
            stepsReduced: (Math.random()*50+10).toFixed(2) + "%"
        }));
        resultEl.textContent = JSON.stringify(json, null, 2);
    });

    logoutBtn.addEventListener("click", ()=>{
        localStorage.removeItem("auth");
        window.location.href = "index.html";
    });

    renderIPs();
}