
const { execSync } = require('child_process');

const SHEET_ID = '14hvM9J_bkv_7cgYsm5qTZ9ARhGa8gsFkzokqRRQAAzM';
const CANDIDATES = [
    "Day Book",
    "DayBook",
    "Transactions",
    "Transaction",
    "Voucher Register",
    "Voucher",
    "Bank Statement",
    "Bank",
    "Statement",
    "Ledger",
    "Ledger View",
    "All Ledger",
    "All Transactions",
    "Export",
    "Sheet1",
    "Sheet 1",
    "Data",
    "Master",
    "Account Statement"
];

function fetchSheet(sheetName) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    try {
        const cmd = `curl -L "${url}"`;
        const output = execSync(cmd, { stdio: 'pipe' }).toString();
        // Google Sheet error usually returns HTML
        if (output.includes("<!DOCTYPE html>")) return null;
        return output.split('\n')[0]; // Return header
    } catch (e) {
        return null;
    }
}

console.log("Starting expanded search...");
for (const name of CANDIDATES) {
    const header = fetchSheet(name);
    if (header) {
        console.log(`[FOUND] "${name}"`);
        console.log(`Header: ${header}`);
        if (header.toLowerCase().includes('vch') || header.toLowerCase().includes('credit') || header.toLowerCase().includes('debit')) {
            console.log(">>> MATCH FOUND <<<");
        }
    }
}
