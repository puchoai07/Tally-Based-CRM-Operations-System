
const fetch = require('node-fetch');

// Polyfill for Papa Parse in Node environment if needed, or just simple split
async function run() {
    const SHEET_ID = '14hvM9J_bkv_7cgYsm5qTZ9ARhGa8gsFkzokqRRQAAzM';
    const SHEET_NAME = "Statement & Ledger Sharing";
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

    console.log("Fetching URL:", url);
    try {
        const response = await fetch(url);
        const text = await response.text();
        const lines = text.split('\n');
        if (lines.length > 0) {
            console.log("Header Row (Raw):", lines[0]);
            const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, ''));
            console.log("Parsed Headers:", headers);
            console.log("First Data Row:", lines[1]);
        } else {
            console.log("No data found");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
