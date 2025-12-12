import React, { useState } from 'react';
import { MatchProvider } from './context/MatchContext';
import './pdf.css'; // Import PDF styles
import BottomNav from './components/BottomNav';
import RecordView from './views/RecordView';
import DashboardView from './views/DashboardView';
import SettingsView from './views/SettingsView';

function App() {
  const [activeTab, setActiveTab] = useState('record');

  const renderView = () => {
    switch (activeTab) {
      case 'record': return <RecordView />;
      case 'dashboard': return <DashboardView />;
      case 'settings': return <SettingsView />;
      default: return <RecordView />;
    }
  };

  return (
    <MatchProvider>
      <div style={{ paddingTop: '20px' }}>
        <main>
          {renderView()}
        </main>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </MatchProvider>
  );
}

export default App;
