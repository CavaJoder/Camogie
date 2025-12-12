import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const MatchContext = createContext();

export const useMatch = () => useContext(MatchContext);

const INITIAL_STATS = {
  possessionsA: 0,
  pressuresB: 0,
  possessionsB: 0,
  pressuresA: 0,
  rucksTotal: 0,
  rucksWonA: 0,
  rucksWonB: 0
};

const INITIAL_MATCH_INFO = {
  homeTeam: 'Team A',
  awayTeam: 'Team B',
  homeTeamColor: '#bb86fc',
  awayTeamColor: '#03dac6'
};

export const MatchProvider = ({ children }) => {
  // --- State ---
  const [matchNumber, setMatchNumber] = useState(() => {
    const saved = localStorage.getItem('lite_match_number');
    return saved ? parseInt(saved) : 1;
  });

  const [matchHistory, setMatchHistory] = useState(() => {
    const saved = localStorage.getItem('lite_match_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentStats, setCurrentStats] = useState(() => {
    const saved = localStorage.getItem('lite_current_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  const [timer, setTimer] = useState(() => {
    const saved = localStorage.getItem('lite_timer');
    return saved ? JSON.parse(saved) : { minutes: 0, seconds: 0, isRunning: false };
  });

  const [matchInfo, setMatchInfo] = useState(() => {
    const saved = localStorage.getItem('lite_match_info');
    return saved ? JSON.parse(saved) : INITIAL_MATCH_INFO;
  });

  const timerIntervalRef = useRef(null);

  // --- Persistence ---
  useEffect(() => { localStorage.setItem('lite_match_number', matchNumber); }, [matchNumber]);
  useEffect(() => { localStorage.setItem('lite_match_history', JSON.stringify(matchHistory)); }, [matchHistory]);
  useEffect(() => { localStorage.setItem('lite_current_stats', JSON.stringify(currentStats)); }, [currentStats]);
  useEffect(() => { localStorage.setItem('lite_timer', JSON.stringify(timer)); }, [timer]);
  useEffect(() => { localStorage.setItem('lite_match_info', JSON.stringify(matchInfo)); }, [matchInfo]);

  // --- Timer Logic ---
  useEffect(() => {
    if (timer.isRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          const newSeconds = prev.seconds + 1;
          if (newSeconds === 60) {
            return { ...prev, minutes: prev.minutes + 1, seconds: 0 };
          }
          return { ...prev, seconds: newSeconds };
        });
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [timer.isRunning]);

  // --- Actions ---

  const startMatch = () => {
    setTimer(prev => ({ ...prev, isRunning: true }));
  };

  const stopMatch = () => {
    setTimer(prev => ({ ...prev, isRunning: false }));

    // Save to History
    const newRecord = {
      id: matchNumber,
      date: new Date().toISOString(),
      homeTeam: matchInfo.homeTeam,
      awayTeam: matchInfo.awayTeam,
      stats: { ...currentStats },
      duration: `${String(timer.minutes).padStart(2, '0')}:${String(timer.seconds).padStart(2, '0')}`
    };

    setMatchHistory(prev => [newRecord, ...prev]);
    setMatchNumber(prev => prev + 1);

    // Reset Current Stats & Timer
    setCurrentStats(INITIAL_STATS);
    setTimer({ minutes: 0, seconds: 0, isRunning: false });
  };

  const resetCurrentStats = () => {
    if (window.confirm('Reset current match stats?')) {
      setCurrentStats(INITIAL_STATS);
      setTimer({ minutes: 0, seconds: 0, isRunning: false });
    }
  };

  const resetApp = () => {
    if (window.confirm('RESET APP: This will delete all match history and settings. Are you sure?')) {
      setMatchNumber(1);
      setMatchHistory([]);
      setCurrentStats(INITIAL_STATS);
      setTimer({ minutes: 0, seconds: 0, isRunning: false });
      setMatchInfo(INITIAL_MATCH_INFO);

      localStorage.clear(); // Clear all storage
    }
  };

  const updateStat = (key, delta) => {
    setCurrentStats(prev => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta)
    }));
  };

  const updateMatchInfo = (field, value) => {
    setMatchInfo(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MatchContext.Provider value={{
      matchNumber,
      matchHistory,
      currentStats,
      timer,
      matchInfo,
      startMatch,
      stopMatch,
      resetCurrentStats,
      resetApp,
      updateStat,
      updateMatchInfo
    }}>
      {children}
    </MatchContext.Provider>
  );
};
