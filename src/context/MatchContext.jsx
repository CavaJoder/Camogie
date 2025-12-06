import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const MatchContext = createContext();

export const useMatch = () => useContext(MatchContext);

const INITIAL_STATS = {
  q1: {}, q2: {}, q3: {}, q4: {}, ft: {}
};

const INITIAL_MATCH_INFO = {
  homeTeam: '',
  awayTeam: '',
  date: new Date().toISOString().split('T')[0],
  venue: '',
  competition: '',
  homeCrest: null,
  awayCrest: null,
  homeTeamColor: '#bb86fc',
  awayTeamColor: '#bb86fc'
};

export const MatchProvider = ({ children }) => {
  // Timer State
  const [timer, setTimer] = useState(() => {
    const saved = localStorage.getItem('match_timer');
    return saved ? JSON.parse(saved) : { minutes: 0, seconds: 0, isRunning: false, quarter: 'Q1' };
  });

  // Match Info State
  const [matchInfo, setMatchInfo] = useState(() => {
    const saved = localStorage.getItem('match_info');
    return saved ? JSON.parse(saved) : INITIAL_MATCH_INFO;
  });

  // Stats State
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('match_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  // Pitch Stats State (Scores & Puckouts)
  const [pitchStats, setPitchStats] = useState(() => {
    const saved = localStorage.getItem('match_pitch_stats');
    return saved ? JSON.parse(saved) : { scores: [], puckouts: [] };
  });

  const timerIntervalRef = useRef(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('match_timer', JSON.stringify(timer));
  }, [timer]);

  useEffect(() => {
    localStorage.setItem('match_info', JSON.stringify(matchInfo));
  }, [matchInfo]);

  useEffect(() => {
    localStorage.setItem('match_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('match_pitch_stats', JSON.stringify(pitchStats));
  }, [pitchStats]);

  // Timer Logic
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

  // Actions
  const startTimer = () => setTimer(prev => ({ ...prev, isRunning: true }));
  const pauseTimer = () => setTimer(prev => ({ ...prev, isRunning: false }));

  const endQuarter = () => {
    setTimer(prev => {
      let nextQuarter = prev.quarter;
      let shouldResetTime = false;
      let shouldKeepRunning = false;

      if (prev.quarter === 'Q1') {
        nextQuarter = 'Q2';
        shouldKeepRunning = true;
      }
      else if (prev.quarter === 'Q2') {
        nextQuarter = 'Q3';
        shouldResetTime = true;
        shouldKeepRunning = false;
      }
      else if (prev.quarter === 'Q3') {
        nextQuarter = 'Q4';
        shouldKeepRunning = true;
      }
      else if (prev.quarter === 'Q4') {
        nextQuarter = 'FT';
        shouldKeepRunning = false;
      }

      return {
        ...prev,
        quarter: nextQuarter,
        minutes: shouldResetTime ? 0 : prev.minutes,
        seconds: shouldResetTime ? 0 : prev.seconds,
        isRunning: shouldKeepRunning
      };
    });
  };

  const updateStat = (statId, delta) => {
    if (timer.quarter === 'FT') return; // No updates after full time

    setStats(prev => {
      const currentQ = prev[timer.quarter.toLowerCase()] || {};
      const currentVal = currentQ[statId] || 0;
      const newVal = Math.max(0, currentVal + delta);

      return {
        ...prev,
        [timer.quarter.toLowerCase()]: {
          ...currentQ,
          [statId]: newVal
        }
      };
    });
  };

  const addPitchEvent = (type, data) => {
    setPitchStats(prev => ({
      ...prev,
      [type]: [...prev[type], { ...data, quarter: timer.quarter }]
    }));
  };

  const updateMatchInfo = (field, value) => {
    setMatchInfo(prev => ({ ...prev, [field]: value }));
  };

  // Manual Entry State
  const [manualStats, setManualStats] = useState(() => {
    const saved = localStorage.getItem('manual_stats');
    return saved ? JSON.parse(saved) : { q1: {}, q2: {}, q3: {}, q4: {} };
  });

  const [manualPitchEvents, setManualPitchEvents] = useState(() => {
    const saved = localStorage.getItem('manual_pitch_events');
    return saved ? JSON.parse(saved) : {
      q1: { scores: [], puckouts: [] },
      q2: { scores: [], puckouts: [] },
      q3: { scores: [], puckouts: [] },
      q4: { scores: [], puckouts: [] }
    };
  });

  // Persistence Effects for Manual Data
  useEffect(() => {
    localStorage.setItem('manual_stats', JSON.stringify(manualStats));
  }, [manualStats]);

  useEffect(() => {
    localStorage.setItem('manual_pitch_events', JSON.stringify(manualPitchEvents));
  }, [manualPitchEvents]);

  // Manual Data Actions
  const updateManualStat = (quarter, statId, value) => {
    setManualStats(prev => ({
      ...prev,
      [quarter]: {
        ...prev[quarter],
        [statId]: parseInt(value) || 0
      }
    }));
  };

  const addManualPitchEvent = (quarter, type, event) => {
    setManualPitchEvents(prev => ({
      ...prev,
      [quarter]: {
        ...prev[quarter],
        [type]: [...prev[quarter][type], event]
      }
    }));
  };

  const resetMatch = () => {
    if (window.confirm('Are you sure you want to reset the match? All data will be lost.')) {
      setStats(INITIAL_STATS);
      setTimer({ minutes: 0, seconds: 0, isRunning: false, quarter: 'Q1' });
      setPitchStats({ scores: [], puckouts: [] });
      setMatchInfo(INITIAL_MATCH_INFO);

      // Reset Manual Data too
      setManualStats({ q1: {}, q2: {}, q3: {}, q4: {} });
      setManualPitchEvents({
        q1: { scores: [], puckouts: [] },
        q2: { scores: [], puckouts: [] },
        q3: { scores: [], puckouts: [] },
        q4: { scores: [], puckouts: [] }
      });

      localStorage.removeItem('match_stats');
      localStorage.removeItem('match_timer');
      localStorage.removeItem('match_pitch_stats');
      localStorage.removeItem('match_info');
      localStorage.removeItem('manual_stats');
      localStorage.removeItem('manual_pitch_events');
    }
  };

  return (
    <MatchContext.Provider value={{
      timer,
      matchInfo,
      stats,
      pitchStats,
      manualStats,
      manualPitchEvents,
      setMatchInfo,
      startTimer,
      pauseTimer,
      endQuarter,
      updateStat,
      addPitchEvent,
      updateMatchInfo,
      resetMatch,
      updateManualStat,
      addManualPitchEvent
    }}>
      {children}
    </MatchContext.Provider>
  );
};
