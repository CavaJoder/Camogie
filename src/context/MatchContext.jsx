import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, set, onValue } from 'firebase/database';

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

  // Pitch Stats State (Scores, Puckouts, Frees)
  const [pitchStats, setPitchStats] = useState(() => {
    const saved = localStorage.getItem('match_pitch_stats');
    return saved ? JSON.parse(saved) : { scores: [], puckouts: [], frees: [] };
  });

  // Manual Entry State
  const [manualStats, setManualStats] = useState(() => {
    const saved = localStorage.getItem('manual_stats');
    return saved ? JSON.parse(saved) : { q1: {}, q2: {}, q3: {}, q4: {} };
  });

  const [manualPitchEvents, setManualPitchEvents] = useState(() => {
    const saved = localStorage.getItem('manual_pitch_events');
    return saved ? JSON.parse(saved) : {
      q1: { scores: [], puckouts: [], frees: [] },
      q2: { scores: [], puckouts: [], frees: [] },
      q3: { scores: [], puckouts: [], frees: [] },
      q4: { scores: [], puckouts: [], frees: [] }
    };
  });

  // Real-Time Sync State
  const [matchId, setMatchId] = useState(() => localStorage.getItem('match_id') || '');
  const [isLive, setIsLive] = useState(() => localStorage.getItem('is_live') === 'true');
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('is_admin') === 'true'); // True if we are the ones broadcasting

  const timerIntervalRef = useRef(null);

  // Sync Effect
  useEffect(() => {
    if (!matchId) return;

    // Safety check: if db failed to initialize (e.g. missing config), don't crash the app
    if (!db) {
      console.error("Firebase Database not initialized");
      return;
    }

    try {
      const matchRef = ref(db, `matches/${matchId}`);

      if (isLive && isAdmin) {
        // ADMIN MODE: Push changes to Firebase
        set(matchRef, {
          timer,
          matchInfo,
          stats,
          pitchStats,
          manualStats,
          manualPitchEvents,
          lastUpdated: Date.now()
        }).catch(err => console.error("Sync Error:", err));
      }
      else if (isLive && !isAdmin) {
        // CLIENT MODE: Listen for changes from Firebase
        const unsubscribe = onValue(matchRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            if (data.timer) setTimer(prev => ({ ...prev, ...data.timer, isRunning: data.timer.isRunning })); // Keep local running state logic? Actually for clients we usually just mirror
            if (data.matchInfo) setMatchInfo(data.matchInfo);
            if (data.stats) setStats(data.stats);
            if (data.pitchStats) setPitchStats(data.pitchStats);
            if (data.manualStats) setManualStats(data.manualStats);
            if (data.manualPitchEvents) setManualPitchEvents(data.manualPitchEvents);
          }
        });
        return () => unsubscribe();
      }
    } catch (e) {
      console.error("Error setting up Firebase sync:", e);
    }
  }, [matchId, isLive, isAdmin, timer, matchInfo, stats, pitchStats, manualStats, manualPitchEvents]);

  // Persist Live State
  useEffect(() => {
    localStorage.setItem('match_id', matchId);
    localStorage.setItem('is_live', isLive);
    localStorage.setItem('is_admin', isAdmin);
  }, [matchId, isLive, isAdmin]);

  const goLive = (newMatchId, admin = true) => {
    setMatchId(newMatchId);
    setIsAdmin(admin);
    setIsLive(true);
  };

  const stopLive = () => {
    setIsLive(false);
    setIsAdmin(false);
    setMatchId('');
  };

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

  const undoPitchEvent = (type) => {
    setPitchStats(prev => {
      const currentLayer = prev[type] || [];
      if (currentLayer.length === 0) return prev;
      return {
        ...prev,
        [type]: currentLayer.slice(0, -1)
      };
    });
  };

  const undoManualPitchEvent = (quarter, type) => {
    setManualPitchEvents(prev => {
      const currentQuarter = prev[quarter] || {};
      const currentLayer = currentQuarter[type] || [];
      if (currentLayer.length === 0) return prev;
      return {
        ...prev,
        [quarter]: {
          ...currentQuarter,
          [type]: currentLayer.slice(0, -1)
        }
      };
    });
  };

  const resetMatch = () => {
    if (window.confirm('Are you sure you want to reset the match? All data will be lost.')) {
      setStats(INITIAL_STATS);
      setTimer({ minutes: 0, seconds: 0, isRunning: false, quarter: 'Q1' });
      setPitchStats({ scores: [], puckouts: [], frees: [] });
      setMatchInfo(INITIAL_MATCH_INFO);

      // Reset Manual Data too
      setManualStats({ q1: {}, q2: {}, q3: {}, q4: {} });
      setManualPitchEvents({
        q1: { scores: [], puckouts: [], frees: [] },
        q2: { scores: [], puckouts: [], frees: [] },
        q3: { scores: [], puckouts: [], frees: [] },
        q4: { scores: [], puckouts: [], frees: [] }
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
      addManualPitchEvent,
      undoPitchEvent,
      undoManualPitchEvent,
      goLive,
      stopLive,
      matchId,
      isLive,
      isAdmin
    }}>
      {children}
    </MatchContext.Provider>
  );
};
