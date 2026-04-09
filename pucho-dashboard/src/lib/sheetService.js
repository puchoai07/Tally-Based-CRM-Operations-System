import Papa from 'papaparse';

const SHEET_ID = '14hvM9J_bkv_7cgYsm5qTZ9ARhGa8gsFkzokqRRQAAzM';
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

// Helper for standardized fetching
const fetchSheetData = async (sheetName, config = {}) => {
    try {
        const response = await fetch(`${BASE_URL}&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`);
        const csvText = await response.text();

        return new Promise((resolve) => {
            Papa.parse(csvText, {
                header: config.header !== undefined ? config.header : true,
                skipEmptyLines: true,
                complete: (results) => resolve(results.data),
                error: (err) => {
                    console.error(`Error parsing ${sheetName}:`, err);
                    resolve([]);
                }
            });
        });
    } catch (error) {
        console.error(`Error fetching ${sheetName}:`, error);
        return [];
    }
};

// Helper to fetch by GID (Tab ID)
const fetchSheetByGid = async (gid, config = {}) => {
    try {
        const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}&t=${Date.now()}`);
        const csvText = await response.text();

        return new Promise((resolve) => {
            Papa.parse(csvText, {
                header: config.header !== undefined ? config.header : true,
                skipEmptyLines: true,
                complete: (results) => resolve(results.data),
                error: (err) => {
                    console.error(`Error parsing GID ${gid}:`, err);
                    resolve([]);
                }
            });
        });
    } catch (error) {
        console.error(`Error fetching GID ${gid}:`, error);
        return [];
    }
};

/**
 * Robust Header Discovery
 * Scans rows to find the one containing specific keywords, then maps the rest into objects.
 */
const discoverHeaders = (rawData, keywords) => {
    if (!Array.isArray(rawData) || rawData.length === 0) return [];

    // Fuzzy Match Helper: remove all non-alphanumeric and lowercase
    const fuzzy = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanKeywords = keywords.map(fuzzy);

    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(rawData.length, 50); i++) {
        const row = rawData[i];
        if (!Array.isArray(row)) continue;
        const rowFuzzy = row.map(fuzzy).join(' ');

        // Match if ALL keywords are found in this row
        const match = cleanKeywords.every(kw => rowFuzzy.includes(kw));
        if (match) {
            headerRowIndex = i;
            break;
        }
    }

    if (headerRowIndex === -1) return [];

    // Keys are trimmed AND non-printable chars (BOM) are removed
    const headers = rawData[headerRowIndex].map(h => String(h).trim().replace(/[^\x20-\x7E]/g, ''));
    const dataRows = rawData.slice(headerRowIndex + 1);

    return dataRows.map(row => {
        const obj = {};
        headers.forEach((h, idx) => {
            if (h) obj[h] = row[idx];
        });
        return obj;
    }).filter(obj => {
        return Object.values(obj).some(v => v !== undefined && v !== null && String(v).trim().length > 0);
    });
};

// 1. Daily Overview (Cards)
export const fetchKPIData = () => fetchSheetData("CEO daily kpi");

// 2. Stock Inventory
// 2. Stock Inventory
export const fetchStockData = async () => {
    try {
        const raw = await fetchSheetData("Multi-location Stock Summary", { header: false });
        const metaDate = extractMetaDate(raw);

        // Keywords for Stock headers
        const targetKeywords = ['item', 'location', 'quantity', 'value', 'stock'];
        const clean = discoverHeaders(raw, targetKeywords);

        if (clean.length > 0) {
            if (metaDate) clean._metaDate = metaDate;
            return clean;
        }

        console.warn("Stock header discovery failed, falling back.");
        return await fetchSheetData("Multi-location Stock Summary");
    } catch (e) {
        console.error("Stock fetch error:", e);
        return [];
    }
};

// 3. Budget Analytics
export const fetchBudgetData = () => fetchSheetData("Budget vs Actual Tracker");

// 4. Statement & Ledger
export const fetchStatementLedgerData = async () => {
    try {
        // 1. Try fetching raw to find metadata lines + headers
        const raw = await fetchSheetData("Statement & Ledger Sharing", { header: false });

        // Extract Metadata Date (e.g., "Current Date: ...")
        const metaDate = extractMetaDate(raw);

        // Discover headers (looking for common ledger columns)
        const targetKeywords = ['date', 'particulars', 'vch', 'debit', 'credit', 'current date', 'current_date'];
        const clean = discoverHeaders(raw, targetKeywords);

        // Success path: We found headers and maybe a date
        if (clean.length > 0) {
            if (metaDate) clean._metaDate = metaDate;
            return clean;
        }

        // 2. Fallback: If discovery failed, just standard fetch (ignoring metadata date)
        console.warn("Ledger header discovery failed, falling back to standard fetch.");
        return await fetchSheetData("Statement & Ledger Sharing");

    } catch (err) {
        console.error("Error in robust ledger fetch:", err);
        return [];
    }
};

// 5. MIS & Analytical Reporting
export const fetchMISData = () => fetchSheetData("MIS & Analytical Reporting");

// 6. Financial Insight
export const fetchFinancialInsightsData = () => fetchSheetData("Financial Insights Generator");

// 7. Data Hygiene
export const fetchDataHygieneData = () => fetchSheetData("Data Hygiene Agent");

// 8. Credit Risk & Receivables
export const fetchCreditRiskData = async () => {
    // Verified GID for "Credit Risk & Receivables Agent"
    const PRIMARY_GID = '1516857517';

    // Keywords verified in browser
    const targetKeywords = ['customer', 'outstanding'];

    // Phase 1: Try by verified GID using robust gviz/tq endpoint
    try {
        const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${PRIMARY_GID}&t=${Date.now()}`);
        const csvText = await response.text();
        const raw = await new Promise(resolve => {
            Papa.parse(csvText, { header: false, skipEmptyLines: true, complete: r => resolve(r.data) });
        });

        // Try meta date from raw
        const metaDate = extractMetaDate(raw);

        const clean = discoverHeaders(raw, targetKeywords);
        if (clean.length > 0) {
            console.log("Matched Credit Risk by Verified GID.");
            if (metaDate) clean._metaDate = metaDate;
            return clean;
        }
    } catch (e) {
        console.warn("Failed to fetch Credit Risk by GID, trying fallbacks...", e);
    }

    // Phase 2: Fallback to candidates by name
    const candidates = ["Credit Risk & Receivables Agent", "Credit Risk"];
    for (const name of candidates) {
        const raw = await fetchSheetData(name, { header: false });

        // Try meta date from raw
        const metaDate = extractMetaDate(raw);

        const clean = discoverHeaders(raw, targetKeywords);
        if (clean.length > 0) {
            if (metaDate) clean._metaDate = metaDate;
            return clean;
        }
    }

    return [];
};

// 9. Vendor & Customer Management
export const fetchVendorCustomerData = async () => {
    // Both tabs likely have summary rows at the top. Use discovery.
    const [rawVendors, rawCustomers] = await Promise.all([
        fetchSheetData("Vendor & Customer Management-vendor", { header: false }),
        fetchSheetData("Vendor & Customer Management-customer", { header: false })
    ]);

    // Try to find metadata date in top rows
    const metaDate = extractMetaDate(rawVendors) || extractMetaDate(rawCustomers);

    const vendorClean = discoverHeaders(rawVendors, ['vendor', 'bill']);
    const customerClean = discoverHeaders(rawCustomers, ['name', 'balance']);

    if (vendorClean.length > 0) console.log("Vendor Headers Found:", Object.keys(vendorClean[0]));
    if (customerClean.length > 0) console.log("Customer Headers Found:", Object.keys(customerClean[0]));

    const taggedVendors = vendorClean.map(v => ({ ...v, Type: 'Vendor' }));
    const taggedCustomers = customerClean.map(c => ({ ...c, Type: 'Customer' }));

    const result = [...taggedVendors, ...taggedCustomers];
    if (metaDate) result._metaDate = metaDate;

    return result;
};

// 10. Taxation & Compliance
export const fetchTaxationData = () => fetchSheetData("Taxation & Compliance");

// 11. Custom Sheet - Act Turnover Speed
export const fetchActTurnoverSpeedData = async () => {
    const customSheetId = '1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw';
    const gid = '1643722051';
    try {
        const response = await fetch(`https://docs.google.com/spreadsheets/d/${customSheetId}/export?format=csv&gid=${gid}&t=${Date.now()}`);
        const csvText = await response.text();

        return new Promise((resolve) => {
            import('papaparse').then((Papa) => {
                Papa.default.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data),
                    error: (err) => {
                        console.error(`Error parsing Act Turnover Speed data:`, err);
                        resolve([]);
                    }
                });
            });
        });
    } catch (error) {
        console.error(`Error fetching Act Turnover Speed data:`, error);
        return [];
    }
};

// 12. Custom Sheet - Contribution PBT Revenue
export const fetchContributionPBTData = async () => {
    const customSheetId = '1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw';
    const gid = '2111194098';
    try {
        const response = await fetch(`https://docs.google.com/spreadsheets/d/${customSheetId}/export?format=csv&gid=${gid}&t=${Date.now()}`);
        const csvText = await response.text();

        return new Promise((resolve) => {
            import('papaparse').then((Papa) => {
                Papa.default.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data),
                    error: (err) => {
                        console.error(`Error parsing Contribution PBT data:`, err);
                        resolve([]);
                    }
                });
            });
        });
    } catch (error) {
        console.error(`Error fetching Contribution PBT data:`, error);
        return [];
    }
};

// 13. Custom Sheet - Daily Production
export const fetchDailyProductionData = async () => {
    const customSheetId = '1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw';
    const gid = '151381999';
    try {
        const response = await fetch(`https://docs.google.com/spreadsheets/d/${customSheetId}/export?format=csv&gid=${gid}&t=${Date.now()}`);
        const csvText = await response.text();

        return new Promise((resolve) => {
            import('papaparse').then((Papa) => {
                Papa.default.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data),
                    error: (err) => {
                        console.error(`Error parsing Daily Production data:`, err);
                        resolve([]);
                    }
                });
            });
        });
    } catch (error) {
        console.error(`Error fetching Daily Production data:`, error);
        return [];
    }
};

// Helper: Format Currency
export const formatCurrency = (value) => {
    if (!value) return '₹0';
    const num = parseFloat(String(value).replace(/,/g, ''));
    if (isNaN(num)) return value;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(num);
};

// Helper: Parse Date (Exported for reuse) - Strictly prioritized DD/MM/YYYY for slashes
export const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const cleanStr = String(dateStr).trim();

    // STRICT: If slash format, assumes DD/MM/YYYY (Google sheet India locale)
    if (cleanStr.includes('/')) {
        const parts = cleanStr.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
            const year = parseInt(parts[2], 10);
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) return date;
        }
    }

    // Try ISO YYYY-MM-DD
    let date = new Date(cleanStr);
    if (!isNaN(date.getTime())) return date;

    return null;
};

// Helper: Extract Date from Metadata (Top rows before headers)
const extractMetaDate = (rawData) => {
    if (!Array.isArray(rawData)) return null;

    // Scan first 10 rows
    for (let i = 0; i < Math.min(rawData.length, 10); i++) {
        const row = rawData[i];
        if (!Array.isArray(row)) continue;

        // Join row to string to search for patterns
        const rowStr = row.join(' ').toLowerCase();

        // Look for "Current Date: ..." or similar patterns common in Tally
        // Or just find ANY valid date string in these top rows if it's explicitly labeled or standalone

        // Strategy: Look for date specific key-value pair in the row?
        // Often it's like ["Current Date", "02-Jan-2026"]

        for (const cell of row) {
            if (!cell) continue;
            const str = String(cell).trim();
            // Check if this cell IS a date
            const date = parseDate(str); // Re-use robust parseDate

            // Heuristic: If we find a date in top rows, and it's surrounded by metadata-like text?
            // Tally specific: "DayBook", "List of Accounts", etc often have a date range or "As on".
            if (date) {
                // To avoid picking up random numbers, ensure the row also has "date" keyword 
                // formatted like "1-Apr-2022"
                if (rowStr.includes('date') || rowStr.includes('period') || rowStr.includes('as on')) {
                    return date;
                }

                // Or if the cell content ITSELF is just a date and nothing else, and high up?
                // Let's rely on row context "date" for safety.
            }
        }
    }
    return null;
};

// Helper: Extract Date from Sheet Data (Generic, Exported)
// Helper: Extract Date from Sheet Data (Generic, Exported)
export const extractSheetDate = (data) => {
    if (!data || data.length === 0) return null;

    // Helper to find column key based on priority keys
    const findKey = (priorityKeys) => {
        const firstRow = data[0];
        const keys = Object.keys(firstRow);
        // Find the first priorityKey that matches a column header
        for (const pk of priorityKeys) {
            const result = keys.find(k => k.toLowerCase().includes(pk));
            if (result) return result;
        }
        return null;
    };

    // Helper to get max date from a column
    const getMaxDateFromColumn = (key) => {
        let maxDate = null;
        for (const row of data) {
            if (row[key] && row[key].trim() !== '' && row[key] !== 'N/A') {
                const parsed = parseDate(row[key]);
                if (parsed) {
                    if (!maxDate || parsed > maxDate) {
                        maxDate = parsed;
                    }
                }
            }
        }
        return maxDate;
    };

    // 1. High Priority: Explicit "Current Date" or "Last Updated" column
    const highPriorityKeys = ['current date', 'last updated', 'report date'];
    const highPriorityKey = findKey(highPriorityKeys);

    if (highPriorityKey) {
        const date = getMaxDateFromColumn(highPriorityKey);
        if (date) return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    // 2. Metadata Date (from file headers)
    if (data._metaDate) {
        return data._metaDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    // 3. Low Priority: Generic "Date" columns (e.g. transaction dates)
    const lowPriorityKeys = ['date', 'bill_date', 'active from'];
    const lowPriorityKey = findKey(lowPriorityKeys);

    if (lowPriorityKey) {
        const date = getMaxDateFromColumn(lowPriorityKey);
        if (date) return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    return null;
};

// Helper: Last Updated Date (Global Fallback)
export const fetchLastUpdatedDate = async () => {
    try {
        // Fetch from multiple sources to find the latest date
        const [kpiData, budgetData] = await Promise.all([
            fetchKPIData(),
            fetchBudgetData()
        ]);

        const d1 = extractSheetDate(kpiData);
        const d2 = extractSheetDate(budgetData);

        // Helper to convert string back to time for comparison
        const time = (str) => parseDate(str)?.getTime() || 0;

        if (time(d2) > time(d1)) return d2;
        return d1 || d2 || null;

    } catch (err) {
        console.error("Error fetching last updated date:", err);
        return null;
    }
};

/**
 * Fetches Creditor RM PM data from a specific Google Sheet GID.
 * Expected Structure: Tabular data for RM/PM creditors.
 * Target URL: https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=747461732
 *
 * @returns {Promise<Array<Object>>} Array of parsed CSV row objects
 */
export const fetchCreditorRMPMData = async () => {
    try {
        console.log('Fetching Creditor RM PM data...');
        const customUrl = `https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=747461732`;
        const response = await fetch(customUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch CSV: HTTP ${response.status}`);
        }

        const csvText = await response.text();
        console.log('Creditor RM PM CSV fetched successfully. Length:', csvText.length);

        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    console.log(`Creditor RM PM data parsed successfully: ${results.data.length} rows.`);
                    resolve(results.data);
                },
                error: (error) => {
                    console.error("PapaParse failed to parse CSV:", error);
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error("Error fetching Creditor RM PM data:", error);
        throw error;
    }
};

/**
 * Fetches Debtor Ageing data
 * Target URL: https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=116254619
 */
export const fetchDebtorAgeingData = async () => {
    try {
        const customUrl = `https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=116254619&t=${Date.now()}`;
        const response = await fetch(customUrl);
        const csvText = await response.text();
        return new Promise((resolve) => {
            import('papaparse').then((Papa) => {
                Papa.default.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data),
                    error: () => resolve([])
                });
            });
        });
    } catch (error) {
        console.error("Error fetching Debtor Ageing data:", error);
        return [];
    }
};

/**
 * Fetches Debtor Outstanding data
 * Target URL: https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=1333782092
 */
export const fetchDebtorOutstandingData = async () => {
    try {
        const customUrl = `https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=1333782092&t=${Date.now()}`;
        const response = await fetch(customUrl);
        const csvText = await response.text();
        return new Promise((resolve) => {
            import('papaparse').then((Papa) => {
                Papa.default.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data),
                    error: () => resolve([])
                });
            });
        });
    } catch (error) {
        console.error("Error fetching Debtor Outstanding data:", error);
        return [];
    }
};

/**
 * Fetches DSO Dashboard data
 * Target URL: https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=351256322
 */
export const fetchDSODashData = async () => {
    try {
        const customUrl = `https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=351256322&t=${Date.now()}`;
        const response = await fetch(customUrl);
        const csvText = await response.text();
        return new Promise((resolve) => {
            import('papaparse').then((Papa) => {
                Papa.default.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data),
                    error: () => resolve([])
                });
            });
        });
    } catch (error) {
        console.error("Error fetching DSO Dashboard data:", error);
        return [];
    }
};

/**
 * Fetches Inventory Dashboard data
 * Target URL: https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=2095053325
 */
export const fetchInventoryData = async () => {
    try {
        const customUrl = `https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=2095053325&t=${Date.now()}`;
        const response = await fetch(customUrl);
        const csvText = await response.text();
        return new Promise((resolve) => {
            import('papaparse').then((Papa) => {
                Papa.default.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data),
                    error: () => resolve([])
                });
            });
        });
    } catch (error) {
        console.error("Error fetching Inventory Dashboard data:", error);
        return [];
    }
};

/**
 * Fetches Project Progress Dashboard data
 * Target URL: https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=607916518
 */
export const fetchProjectProgressData = async () => {
    try {
        const customUrl = `https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=607916518&t=${Date.now()}`;
        const response = await fetch(customUrl);
        const csvText = await response.text();
        return new Promise((resolve) => {
            import('papaparse').then((Papa) => {
                Papa.default.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data),
                    error: () => resolve([])
                });
            });
        });
    } catch (error) {
        console.error("Error fetching Project Progress Dashboard data:", error);
        return [];
    }
};

/**
 * Fetches Repairs Dashboard data
 * Target URL: https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=1172190470
 */
export const fetchRepairsData = async () => {
    try {
        const customUrl = `https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=1172190470&t=${Date.now()}`;
        const response = await fetch(customUrl);
        const csvText = await response.text();
        return new Promise((resolve) => {
            import('papaparse').then((Papa) => {
                Papa.default.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data),
                    error: () => resolve([])
                });
            });
        });
    } catch (error) {
        console.error("Error fetching Repairs Dashboard data:", error);
        return [];
    }
};

/**
 * Fetches RM Proportion Dashboard data
 * Target URL: https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=1347372313
 */
export const fetchRMProportionData = async () => {
    try {
        const customUrl = `https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=1347372313&t=${Date.now()}`;
        const response = await fetch(customUrl);
        const csvText = await response.text();
        return new Promise((resolve) => {
            import('papaparse').then((Papa) => {
                Papa.default.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data),
                    error: () => resolve([])
                });
            });
        });
    } catch (error) {
        console.error("Error fetching RM Proportion Dashboard data:", error);
        return [];
    }
};

/**
 * Fetches Targets Dashboard data
 * Target URL: https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=2135999985
 */
export const fetchTargetsData = async () => {
    try {
        const customUrl = `https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=2135999985&t=${Date.now()}`;
        const response = await fetch(customUrl);
        const csvText = await response.text();
        return new Promise((resolve) => {
            import('papaparse').then((Papa) => {
                Papa.default.parse(csvText, { header: true, skipEmptyLines: true, complete: (results) => resolve(results.data), error: () => resolve([]) });
            });
        });
    } catch (error) {
        console.error("Error fetching Targets Dashboard data:", error); return [];
    }
};

/**
 * Fetches Top Bottom Line Dashboard data
 * Target URL: https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=244817134
 */
export const fetchTopBottomLineData = async () => {
    try {
        const customUrl = `https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=244817134&t=${Date.now()}`;
        const response = await fetch(customUrl);
        const csvText = await response.text();
        return new Promise((resolve) => {
            import('papaparse').then((Papa) => {
                Papa.default.parse(csvText, { header: true, skipEmptyLines: true, complete: (results) => resolve(results.data), error: () => resolve([]) });
            });
        });
    } catch (error) {
        console.error("Error fetching Top Bottom Line Dashboard data:", error); return [];
    }
};

/**
 * Fetches Users Dashboard data
 * Target URL: https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=1931559751
 */
export const fetchUsersData = async () => {
    try {
        const customUrl = `https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=1931559751&t=${Date.now()}`;
        const response = await fetch(customUrl);
        const csvText = await response.text();
        return new Promise((resolve) => {
            import('papaparse').then((Papa) => {
                Papa.default.parse(csvText, { header: true, skipEmptyLines: true, complete: (results) => resolve(results.data), error: () => resolve([]) });
            });
        });
    } catch (error) {
        console.error("Error fetching Users Dashboard data:", error); return [];
    }
};

/**
 * Fetches Top Bottom Line Old Dashboard data
 * Target URL: https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=93366966
 */
export const fetchTopBottomLineOldData = async () => {
    try {
        const customUrl = `https://docs.google.com/spreadsheets/d/1B1bErfAQISla0yCKsXSVrRkTQZ-H9FHlcgpYZ7dPBZw/export?format=csv&gid=93366966&t=${Date.now()}`;
        const response = await fetch(customUrl);
        const csvText = await response.text();
        return new Promise((resolve) => {
            import('papaparse').then((Papa) => {
                Papa.default.parse(csvText, { header: true, skipEmptyLines: true, complete: (results) => resolve(results.data), error: () => resolve([]) });
            });
        });
    } catch (error) {
        console.error("Error fetching Top Bottom Line Old Dashboard data:", error); return [];
    }
};
