import axios from 'axios';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5001/api';

export const tallyService = {
  // Main data fetcher
  getDashboardStats: async () => {
    try {
      const response = await axios.get(`${API_BASE}/dashboard/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Tally stats:', error);
      return null;
    }
  },

  // UC-1 & UC-3: Format Receivables
  formatTallyReceivables: (data) => {
    if (!data) return [];
    return data.map(item => ({
      name: item.customer_name || item.name || 'Unknown Customer',
      amount: parseFloat(item.outstanding_amount || item.amount || 0),
      dueDate: item.due_date || 'N/A',
      aging: parseInt(item.aging_days || 0),
      billNo: item.invoice_no || 'N/A'
    }));
  },

  // UC-2 & UC-10: Format Dispatch Data
  getDispatchData: async () => {
    try {
      const response = await axios.get(`${API_BASE}/dashboard/stats`);
      const raw = response.data.dispatch || [];
      return raw.map(item => ({
        id: item.invoice_no || item.order_no || 'ORD-SYNC',
        customer: item.customer_name || 'Generic Customer',
        items: item.item_details || 'Mixed Items',
        status: item.dispatch_status || 'Pending',
        location: item.godown || 'Warehouse A',
        time: 'Sync: Today',
        priority: parseFloat(item.amount) > 200000 ? 'High' : 'Medium'
      }));
    } catch (e) {
      return [];
    }
  },

  // UC-7 & UC-8: Compliance Data
  getComplianceData: async () => {
    try {
       const response = await axios.get(`${API_BASE}/dashboard/stats`);
       return response.data.exceptions || [];
    } catch (e) {
       return [];
    }
  },

  // UC-11: Inventory Planning
  getInventoryData: async () => {
    try {
       const response = await axios.get(`${API_BASE}/dashboard/stats`);
       const raw = response.data.inventory || [];
       return raw.map(item => ({
         name: item.item_name || 'Unknown Item',
         stock: parseFloat(item.quantity_on_hand || 0),
         value: parseFloat(item.value_on_hand || 0),
         category: item.record_type || 'Stock'
       }));
    } catch (e) {
       return [];
    }
  },

  // New: AI Generated Task List (WF-2, 5, 23, 30)
  getTasks: async () => {
    try {
       const response = await axios.get(`${API_BASE}/dashboard/stats`);
       return response.data.tasks || [];
    } catch (e) {
       return [];
    }
  },

  submitDayEndReport: async (reportData) => {
    try {
      const response = await axios.post(`${API_BASE}/reports/day-end`, reportData);
      return response.data;
    } catch (error) {
      console.error('Error submitting report:', error);
      return { status: 'error' };
    }
  },

  updateProductivity: async (stats) => {
    try {
      const response = await axios.post(`${API_BASE}/productivity/update`, stats);
      return response.data;
    } catch (error) {
      console.error('Error updating productivity:', error);
      return { status: 'error' };
    }
  }
};
