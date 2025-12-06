import React, { useState } from 'react';
import { MatchProvider } from './context/MatchContext';
import { SquadProvider } from './context/SquadContext';
import { PlayerAnalysisProvider } from './context/PlayerAnalysisContext';
import './pdf.css'; // Import PDF styles
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

function App() {
  const [activeTab, setActiveTab] = useState('record');

  const renderView = () => {
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

  return (
    <PlayerAnalysisProvider>
      <SquadProvider>
        <MatchProvider>
          <div style={{ paddingTop: ['playerAnalysis', 'squads', 'settings'].includes(activeTab) ? '0px' : '180px' }}> {/* No padding for full screen views */}
            {!['playerAnalysis', 'squads', 'settings'].includes(activeTab) && <Header />}
            <main>
              {renderView()}
            </main>
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </MatchProvider>
      </SquadProvider>
    </PlayerAnalysisProvider>
  );
}

export default App;
