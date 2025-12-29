import React, { useState } from 'react';
import { MatchProvider, useMatch } from './context/MatchContext';
import { SquadProvider } from './context/SquadContext';
import { PlayerAnalysisProvider } from './context/PlayerAnalysisContext';
import './pdf.css';
import './player-pdf.css';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import RecordView from './views/RecordView';
import DashboardView from './views/DashboardView';
import PlayerStatsView from './views/PlayerStatsView';
import SettingsView from './views/SettingsView';
import PuckoutsView from './views/PuckoutsView';
import ScoresView from './views/ScoresView';
import SquadsView from './views/SquadsView';
import PlayerAnalysisView from './views/PlayerAnalysisView';
import ManualEntryView from './views/ManualEntryView';
import ManualDashboardView from './views/ManualDashboardView';
import ClientView from './views/ClientView';

// Inner component to access context
const MainContent = () => {
  const [activeTab, setActiveTab] = useState('record');
  const { isLive, isAdmin } = useMatch();

  // Client Mode Logic
  const isClient = isLive && !isAdmin;

  const renderView = () => {
    // If client mode, hijack the 'record' view (and others if we want strict mode)
    // For now, let's just make the default landing view the Client View
    if (isClient && activeTab === 'record') {
      return <ClientView />;
    }

    switch (activeTab) {
      case 'record': return <RecordView />;
      case 'dashboard': return <DashboardView />;
      case 'player': return <PlayerStatsView />;
      case 'settings': return <SettingsView />;
      case 'puckouts': return <PuckoutsView />;
      case 'scores': return <ScoresView />;
      case 'squads': return <SquadsView />;
      case 'playerAnalysis': return <PlayerAnalysisView />;
      case 'manual': return <ManualEntryView />;
      case 'manualDashboard': return <ManualDashboardView />;
      default: return <RecordView />;
    }
  };

  // For clients, we might want to hide some tabs in BottomNav?
  // Let's pass isClient prop to BottomNav if needed, or just let them explore read-only views.
  // For now, simple implementation: just override the Record view.

  const isFullScreen = ['playerAnalysis', 'squads', 'settings'].includes(activeTab);

  return (
    <div style={{ paddingTop: isFullScreen ? '0px' : '180px' }}>
      {!isFullScreen && <Header />}
      <main>
        {renderView()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

function App() {
  return (
    <PlayerAnalysisProvider>
      <SquadProvider>
        <MatchProvider>
          <MainContent />
        </MatchProvider>
      </SquadProvider>
    </PlayerAnalysisProvider>
  );
}

export default App;
