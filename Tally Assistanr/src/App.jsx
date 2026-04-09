import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/dashboard/Sidebar';
import { Header } from './components/dashboard/Header';
import { DeepDiveChat } from './pages/DeepDiveChat';

import { ResearchHistory } from './pages/ResearchHistory';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-pucho-light font-sans text-pucho-dark selection:bg-pucho-purple/20">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="md:ml-64 flex flex-col h-screen transition-all duration-300 overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col">
            <Routes>
              <Route path="/" element={<DeepDiveChat />} />
              <Route path="/history" element={<ResearchHistory />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
