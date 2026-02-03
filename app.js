const ADMIN_KEY = "673ziyada";

const nodeListEl = document.getElementById("nodeList");
const companyInput = document.getElementById("company");
const genBtn = document.getElementById("genNode");

async function fetchNodes() {
    const res = await fetch(`http://localhost:8000/nodes?admin_key=${ADMIN_KEY}`);
    const data = await res.json();
    nodeListEl.innerHTML = "";
    data.forEach(node => {
        const li = document.createElement("li");
        li.textContent = `${node.node_id} | ${node.company} | ${node.status} | Optim: ${node.optimization}% Steps: ${node.steps_reduced}%`;
        nodeListEl.appendChild(li);
    });
}

genBtn.addEventListener("click", async () => {
    const company = companyInput.value.trim();
    if(!company) return alert("Введите компанию");
    const form = new FormData();
    form.append("admin_key", ADMIN_KEY);
    form.append("company", company);

    await fetch("https://nodideasai-lilz.vercel.app/", {
        method: "POST",
        body: form
    });
    companyInput.value = "";
    fetchNodes();
});

fetchNodes();