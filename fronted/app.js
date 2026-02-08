document.getElementById("ping-btn").addEventListener("click", async () => {
    const res = await fetch("/api/status");
    const data = await res.json();
    document.getElementById("result").textContent =
        JSON.stringify(data, null, 2);
});