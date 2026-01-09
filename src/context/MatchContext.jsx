import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const MatchContext = createContext();

export const useMatch = () => useContext(MatchContext);

const INITIAL_STATS = {
  possessionsA: 0,
  pressuresB: 0,
  possessionsB: 0,
  pressuresA: 0,
  turnoversA: 0,
  turnoversB: 0,
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

  const [currentQuarter, setCurrentQuarter] = useState(() => {
    const saved = localStorage.getItem('lite_current_quarter');
    return saved ? parseInt(saved) : 1;
  });

  const [quarterlyStats, setQuarterlyStats] = useState(() => {
    const saved = localStorage.getItem('lite_quarterly_stats');
    return saved ? JSON.parse(saved) : {};
  });

  const [matchType, setMatchType] = useState('Match'); // 'Match' or 'Training'

  const timerIntervalRef = useRef(null);

  // --- Persistence ---
  useEffect(() => { localStorage.setItem('lite_match_number', matchNumber); }, [matchNumber]);
  useEffect(() => { localStorage.setItem('lite_match_history', JSON.stringify(matchHistory)); }, [matchHistory]);
  useEffect(() => { localStorage.setItem('lite_current_stats', JSON.stringify(currentStats)); }, [currentStats]);
  useEffect(() => { localStorage.setItem('lite_timer', JSON.stringify(timer)); }, [timer]);
  useEffect(() => { localStorage.setItem('lite_match_info', JSON.stringify(matchInfo)); }, [matchInfo]);
  useEffect(() => { localStorage.setItem('lite_current_quarter', currentQuarter); }, [currentQuarter]);
  useEffect(() => { localStorage.setItem('lite_quarterly_stats', JSON.stringify(quarterlyStats)); }, [quarterlyStats]);

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

  const pauseMatch = () => {
    setTimer(prev => ({ ...prev, isRunning: false }));
  };

  const endQuarter = () => {
    setTimer(prev => ({ ...prev, isRunning: false }));

    // Save snapshot of current stats for this quarter
    setQuarterlyStats(prev => ({
      ...prev,
      [currentQuarter]: { ...currentStats }
    }));

    // Reset counters for the next quarter
    setCurrentStats(INITIAL_STATS);

    // Move to next quarter if not already at 4
    if (currentQuarter < 4) {
      setCurrentQuarter(prev => prev + 1);
    }
  };

  const finishMatch = () => {
    setTimer(prev => ({ ...prev, isRunning: false }));

    let finalQuarterlyStats = {};
    let totalStats = {};

    if (matchType === 'Training') {
      // Training Mode: Treat current stats as the full match stats
      // We'll map it to 'Q1' just so legacy quarterly viewers don't crash, 
      // or effectively just save it as the stats.
      finalQuarterlyStats = { 1: { ...currentStats } };
      totalStats = { ...currentStats };
    } else {
      // Match Mode: Aggregate quarters
      finalQuarterlyStats = quarterlyStats[4] ? quarterlyStats : { ...quarterlyStats, [currentQuarter]: { ...currentStats } };

      totalStats = Object.values(finalQuarterlyStats).reduce((acc, qStats) => {
        const result = { ...acc };
        Object.keys(qStats).forEach(key => {
          result[key] = (result[key] || 0) + (qStats[key] || 0);
        });
        return result;
      }, { ...INITIAL_STATS });
    }

    const newRecord = {
      id: matchNumber,
      date: new Date().toISOString(),
      homeTeam: matchInfo.homeTeam,
      awayTeam: matchInfo.awayTeam,
      stats: totalStats,
      quarterlyStats: finalQuarterlyStats,
      duration: matchType === 'Training' ? 'Training' : `${String(timer.minutes).padStart(2, '0')}:${String(timer.seconds).padStart(2, '0')}`,
      type: matchType // Save the type
    };

    setMatchHistory(prev => [newRecord, ...prev]);
    setMatchNumber(prev => prev + 1);

    // Reset
    setCurrentStats(INITIAL_STATS);
    setTimer({ minutes: 0, seconds: 0, isRunning: false });
    setCurrentQuarter(1);
    setQuarterlyStats({});
    // We don't reset matchType here, user might want to do multiple training sessions
  };

  const resetCurrentStats = () => {
    if (window.confirm('Reset current match stats?')) {
      setCurrentStats(INITIAL_STATS);
      setTimer({ minutes: 0, seconds: 0, isRunning: false });
      setCurrentQuarter(1);
      setQuarterlyStats({});
    }
  };

  const resetApp = () => {
    if (window.confirm('RESET APP: This will delete all match history and settings. Are you sure?')) {
      setMatchNumber(1);
      setMatchHistory([]);
      setCurrentStats(INITIAL_STATS);
      setTimer({ minutes: 0, seconds: 0, isRunning: false });
      setMatchInfo(INITIAL_MATCH_INFO);
      setCurrentQuarter(1);
      setQuarterlyStats({});

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
      currentQuarter,
      quarterlyStats,
      matchType,
      setMatchType,
      startMatch,
      pauseMatch,
      endQuarter,
      finishMatch,
      resetCurrentStats,
      resetApp,
      updateStat,
      updateMatchInfo
    }}>
      {children}
    </MatchContext.Provider>
  );
};
