
const fs = require('fs');
const { execSync } = require('child_process');

const SHEET_ID = '14hvM9J_bkv_7cgYsm5qTZ9ARhGa8gsFkzokqRRQAAzM';
const CANDIDATES = [
    "Statement & Ledger",
    "Statement & Ledger Sharing",
    "Statement",
    "Ledger",
    "Transactions",
    "Date & Ledger",
    "Sidebar 4",
    "Sidebar #4",
    "Sidebar4",
    "Bank Statement",
    "Bank Book",
    "Day Book"
];

function fetchSheet(sheetName) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    try {
        // Use curl via execSync
        const cmd = `curl -L "${url}"`;
        const output = execSync(cmd, { stdio: 'pipe' }).toString();
        const firstLine = output.split('\n')[0];
        return firstLine; // Returns HTML error if sheet not found, or CSV header
    } catch (e) {
        return null;
    }
}

console.log("Checking sheets...");
for (const name of CANDIDATES) {
    const header = fetchSheet(name);
    if (header && !header.includes("<!DOCTYPE html>")) {
        console.log(`[FOUND] Sheet: "${name}"`);
        console.log(`header: ${header}`);

        // Check for key columns
        if (header.includes("credit") || header.includes("debit") || header.includes("v_type") || header.includes("narration")) {
            console.log(">>> LIKELY MATCH <<<");
        }
    } else {
        // console.log(`[MISSING] Sheet: "${name}"`);
    }
}
