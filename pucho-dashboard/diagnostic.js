const Papa = require('papaparse');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const SHEET_ID = '14hvM9J_bkv_7cgYsm5qTZ9ARhGa8gsFkzokqRRQAAzM';
const sheetName = "Vendor & Customer Management-vendor";
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

async function diagnostic() {
    try {
        console.log("Fetching Vendor data...");
        const response = await fetch(`${BASE_URL}&sheet=${encodeURIComponent(sheetName)}`);
        const csvText = await response.text();

        console.log("Parsing CSV...");
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data && results.data.length > 0) {
                    console.log("FIRST ROW KEYS:", Object.keys(results.data[0]));
                    console.log("FIRST ROW DATA:", results.data[0]);
                } else {
                    console.log("NO DATA RETURNED");
                }
            }
        });
    } catch (e) {
        console.error("DIAGNOSTIC ERROR:", e);
    }
}

diagnostic();
