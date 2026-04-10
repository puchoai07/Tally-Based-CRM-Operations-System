const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// In-memory data store
let tallyDataStore = {
  receivables: [],
  payables: [],
  dispatch: [],
  inventory: [],
  exceptions: [],
  tasks: [], // New AI Generated Tasks
  reports: [], // Day End Reports
  productivity: {
    score: 65,
    rank: "Top 5%",
    onTimeRate: "88%"
  },
  stats: {
    totalRevenue: "₹0",
    totalOutstanding: "₹0",
    pendingInvoices: 0
  },
  lastUpdated: null
};

// Webhook endpoint for Pucho Studio
app.post('/api/tally/sync', (req, res) => {
  console.log('Received Sync Data from Pucho Studio (Background processing started)...');
  
  // Respond immediately to prevent tunnel timeout
  res.status(200).json({ status: 'processing', message: 'Data received and routing in background' });

  // Process data asynchronously
  setTimeout(() => {
    try {
      const rawContent = req.body.data?.content || [];
      let allRecords = [];

      // Tally often returns data inside a stringified "Json Agg" field
      rawContent.forEach(item => {
        if (item['Json Agg']) {
          try {
            const parsed = JSON.parse(item['Json Agg']);
            if (Array.isArray(parsed)) {
              allRecords = [...allRecords, ...parsed];
            }
          } catch (e) {
            console.error('Error parsing Json Agg:', e);
          }
        }
      });

      if (allRecords.length === 0 && Array.isArray(rawContent)) {
          allRecords = rawContent;
      }

      // Process and Route data based on record_type
      tallyDataStore = {
        ...tallyDataStore, // Keep existing data (like tasks)
        receivables: allRecords.filter(r => r.record_type === 'Receivable' || r.record_type === 'Customer Outstanding'),
        payables: allRecords.filter(r => r.record_type === 'Payable' || r.record_type === 'Vendor Payable'),
        dispatch: allRecords.filter(r => r.record_type === 'Sales Order' || r.record_type === 'Dispatch' || r.record_type === 'Invoice'),
        inventory: allRecords.filter(r => r.record_type === 'Stock' || r.record_type === 'Inventory'),
        exceptions: allRecords.filter(r => r.record_type === 'Exception' || r.record_type === 'Audit Flag'),
        stats: {
          totalRevenue: `₹${allRecords.filter(r => r.record_type === 'Sales Order' || r.record_type === 'Invoice').reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0).toLocaleString()}`,
          totalOutstanding: `₹${allRecords.filter(r => r.record_type === 'Receivable' || r.record_type === 'Customer Outstanding').reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0).toLocaleString()}`,
          pendingInvoices: allRecords.filter(r => r.record_type === 'Receivable' || r.record_type === 'Customer Outstanding').length
        },
        lastUpdated: new Date().toISOString()
      };

      console.log(`Sync Complete (Background): Routed ${allRecords.length} records.`);
    } catch (err) {
      console.error('Background Sync Error:', err);
    }
  }, 10);
});


// New endpoint for AI Generated Tasks from Pucho Studio (WF-2, 5, 23, 30)
app.post('/api/tasks/create', (req, res) => {
  console.log('Received AI Generated Tasks from Pucho Studio...');
  try {
    const newTasks = req.body || [];
    if (Array.isArray(newTasks)) {
       tallyDataStore.tasks = [...newTasks, ...tallyDataStore.tasks].slice(0, 100); 
       console.log(`Created ${newTasks.length} new AI tasks.`);
    }
    res.status(200).json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error' });
  }
});

// Endpoint for UI to fetch data
app.get('/api/dashboard/stats', (req, res) => {
  res.json(tallyDataStore);
});

// New: Day End Reporting (WF-28)
app.post('/api/reports/day-end', (req, res) => {
  console.log('Received Day End Report:', req.body);
  try {
    const report = req.body;
    tallyDataStore.reports.push({
      ...report,
      timestamp: new Date().toISOString()
    });
    
    // Simulate Carry Forward logic (WF-28)
    const pendingTasks = report.tasks?.filter(t => report.statusUpdates[t.id] !== 'Completed') || [];
    console.log(`Carrying forward ${pendingTasks.length} tasks to next day.`);
    
    res.status(200).json({ status: 'success', message: 'Report submitted and manager notified' });
  } catch (err) {
    res.status(500).json({ status: 'error' });
  }
});

// New: Update Productivity Stats (WF-10)
app.post('/api/productivity/update', (req, res) => {
  console.log('Updating Productivity Stats:', req.body);
  try {
    tallyDataStore.productivity = {
      ...tallyDataStore.productivity,
      ...req.body
    };
    res.status(200).json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error' });
  }
});

// Serve static files in production
app.use(express.static(path.join(__dirname, 'dist')));

// Route all other requests to index.html for React Router (Express 5 Named Wildcard Fix)
app.get('/:any*', (req, res) => {
  try {
    if (!req.url.startsWith('/api')) {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  } catch (err) {
    console.error('Routing Error:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Bridge Server running at http://localhost:${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/api/tally/sync`);
  console.log(`Task Webhook: http://localhost:${PORT}/api/tasks/create`);
});
