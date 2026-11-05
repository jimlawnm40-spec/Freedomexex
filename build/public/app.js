const LABELS = { stolen: "Stolen", damaged: "Sold damaged", misrepresented: "Misrepresented" };

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

function card(r) {
  const item = [r.brand, r.model].filter(Boolean).join(" ") || r.category;
  const meta = [
    r.category !== item ? r.category : "",
    r.location,
    r.incidentDate ? `happened ${fmtDate(r.incidentDate + "T00:00:00")}` : "",
    `reported ${fmtDate(r.createdAt)}`,
  ].filter(Boolean).map(esc).join(" · ");
  return `<li class="card">
    <div class="head"><span class="tag ${esc(r.reportType)}">${esc(LABELS[r.reportType] || r.reportType)}</span>
      <span class="id">${esc(r.identifier)}</span><span>${esc(item)}</span></div>
    <div class="meta">${meta}</div>
    <p class="desc">${esc(r.description)}</p>
  </li>`;
}

async function api(url, opts) {
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

// Check
const checkForm = document.getElementById("check-form");
const checkResult = document.getElementById("check-result");
checkForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = checkForm.querySelector("button");
  const id = checkForm.id.value.trim();
  btn.disabled = true;
  try {
    const data = await api(`/api/check?id=${encodeURIComponent(id)}`);
    if (data.flagged) {
      checkResult.innerHTML = `<div class="result flagged">
        <h3>⚠ ${data.reports.length} report${data.reports.length > 1 ? "s" : ""} found for ${esc(id)}</h3>
        <p>Be cautious. Ask the seller for proof of ownership, and contact local police if the item may be stolen.</p>
        <ul class="cards">${data.reports.map(card).join("")}</ul></div>`;
    } else {
      checkResult.innerHTML = `<div class="result clear"><h3>✓ No reports found for ${esc(id)}</h3>
        <p>That's a good sign, but not a guarantee. Inspect the item, meet somewhere public, and ask for a receipt.</p></div>`;
    }
  } catch (err) {
    checkResult.innerHTML = `<p class="err">${esc(err.message)}</p>`;
  } finally {
    btn.disabled = false;
  }
});

// Report
const reportForm = document.getElementById("report-form");
const reportStatus = document.getElementById("report-status");
reportForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = reportForm.querySelector("button");
  btn.disabled = true;
  reportStatus.className = "";
  reportStatus.textContent = "Submitting…";
  try {
    const body = Object.fromEntries(new FormData(reportForm));
    await api("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    reportForm.reset();
    reportStatus.className = "ok";
    reportStatus.textContent = "Report submitted. Thank you for helping others.";
    loadRecent();
  } catch (err) {
    reportStatus.className = "err";
    reportStatus.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
});

// Recent
const recentList = document.getElementById("recent-list");
async function loadRecent() {
  try {
    const { reports } = await api("/api/reports");
    recentList.innerHTML = reports.length ? reports.map(card).join("") : `<li class="muted">No reports yet.</li>`;
  } catch {
    recentList.innerHTML = `<li class="err">Couldn't load recent reports.</li>`;
  }
}
loadRecent();
