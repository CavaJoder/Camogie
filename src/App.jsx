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
import MatchLogView from './views/MatchLogView';
import ClientView from './views/ClientView';
import TeamSheetsView from './views/TeamSheetsView';
import HeatMapView from './views/HeatMapView';

const MainContent = () => {
  const [activeTab, setActiveTab] = useState('record');
  const { isLive, isAdmin } = useMatch();

  // Client Mode Logic
  const isClient = isLive && !isAdmin;

  const renderView = () => {
    // If client mode, hijack the 'record' view
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
      case 'matchLog': return <MatchLogView />;
      case 'teamSheets': return <TeamSheetsView />;
      case 'heatMap': return <HeatMapView />;
      default: return <RecordView />;
    }
  };

  const isFullScreen = ['playerAnalysis', 'squads', 'settings', 'teamSheets', 'heatMap'].includes(activeTab);

  return (
    <div style={{ paddingTop: isFullScreen ? '0px' : '280px' }}>
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
