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
  awayCrest: null
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
        isRunning: shouldKeepRunning,
        minutes: shouldResetTime ? 0 : prev.minutes,
        seconds: shouldResetTime ? 0 : prev.seconds
      };
    });
  };

  const resetMatch = () => {
    setTimer({ minutes: 0, seconds: 0, isRunning: false, quarter: 'Q1' });
    setStats(INITIAL_STATS);
    // Optional: Keep match info or reset it? Usually keep info, reset stats.
    // User said "Reset Match button (clears all data and returns to initial state)"
    // and "Reset clears all match information and team data"
    setMatchInfo(INITIAL_MATCH_INFO);
    localStorage.clear();
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

  const updateMatchInfo = (field, value) => {
    setMatchInfo(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MatchContext.Provider value={{
      timer,
      matchInfo,
      stats,
      startTimer,
      pauseTimer,
      endQuarter,
      resetMatch,
      updateStat,
      updateMatchInfo
    }}>
      {children}
    </MatchContext.Provider>
  );
};
