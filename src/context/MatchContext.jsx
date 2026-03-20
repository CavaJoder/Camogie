import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, set, onValue, get, query, orderByKey, limitToLast, child } from 'firebase/database';
import { usePlayerAnalysis } from './PlayerAnalysisContext';

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
  awayTeamColor: '#bb86fc',
  perspective: ''
};

const INITIAL_HEATMAP_EVENTS = {
  q1: [], q2: [], q3: [], q4: []
};

const INITIAL_PLAYER_PRESSURE_STATS = [];

// Global Helper to ensure array type (Firebase/LocalStorage safety)
const ensureArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  try {
    return Object.values(data);
  } catch (e) {
    return [];
  }
};

export const MatchProvider = ({ children }) => {
  const { playerStats, setPlayerStats } = usePlayerAnalysis();

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
    let parsed = saved ? JSON.parse(saved) : null;
    if (!parsed) {
      return {
        q1: { scores: [], puckouts: [], frees: [] },
        q2: { scores: [], puckouts: [], frees: [] },
        q3: { scores: [], puckouts: [], frees: [] },
        q4: { scores: [], puckouts: [], frees: [] }
      };
    }

    // Immediate Sanitization of LocalStorage Data
    // Helper to handle Firebase Arrays (which can be objects) or real Arrays
    const ensureArray = (data) => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      return Object.values(data);
    };

    const cleanQuarter = (q) => ({
      scores: ensureArray(q?.scores).filter(s => s !== null && s !== undefined),
      puckouts: ensureArray(q?.puckouts).filter(p => p !== null && p !== undefined),
      frees: ensureArray(q?.frees).filter(f => f !== null && f !== undefined)
    });

    return {
      q1: cleanQuarter(parsed.q1 || {}),
      q2: cleanQuarter(parsed.q2 || {}),
      q3: cleanQuarter(parsed.q3 || {}),
      q4: cleanQuarter(parsed.q4 || {}),
      ft: cleanQuarter(parsed.ft || {}) // Ensure FT bucket exists
    };
  });

  // Heat Map Events State (New)
  const [heatMapEvents, setHeatMapEvents] = useState(() => {
    const saved = localStorage.getItem('match_heatmap_events');
    const parsed = saved ? JSON.parse(saved) : null;
    if (!parsed) return INITIAL_HEATMAP_EVENTS;

    // Sanitize
    const cleanList = (list) => (list || []).filter(e => e !== null && e !== undefined);
    return {
      q1: cleanList(parsed.q1),
      q2: cleanList(parsed.q2),
      q3: cleanList(parsed.q3),
      q4: cleanList(parsed.q4),
    };
  });

  // Use a Ref to hold the latest heatMapEvents for the listener to write back atomically if needed
  const heatMapEventsRef = useRef(heatMapEvents);
  useEffect(() => {
    heatMapEventsRef.current = heatMapEvents;
  }, [heatMapEvents]);


  // Player Pressure Stats (New)
  const [playerPressureStats, setPlayerPressureStats] = useState(() => {
    const saved = localStorage.getItem('match_player_pressure_stats');
    return saved ? JSON.parse(saved) : INITIAL_PLAYER_PRESSURE_STATS;
  });

  // Match Log State
  const [matchLog, setMatchLog] = useState(() => {
    const saved = localStorage.getItem('match_log');
    return ensureArray(saved ? JSON.parse(saved) : []);
  });


  // Live Sync State
  const [matchId, setMatchId] = useState(null); // For LIVE BROADCAST (Auto-Sync)
  const [loadedMatchId, setLoadedMatchId] = useState(null); // For MANUAL EDIT (No Auto-Sync)
  const [isLive, setIsLive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Saved Match List
  const [matchList, setMatchList] = useState([]);
  const [debugKeys, setDebugKeys] = useState([]); // Debugging: Raw keys from DB

  // Effects for LocalStorage
  useEffect(() => localStorage.setItem('match_timer', JSON.stringify(timer)), [timer]);
  useEffect(() => localStorage.setItem('match_info', JSON.stringify(matchInfo)), [matchInfo]);
  useEffect(() => localStorage.setItem('match_stats', JSON.stringify(stats)), [stats]);
  useEffect(() => localStorage.setItem('match_pitch_stats', JSON.stringify(pitchStats)), [pitchStats]);
  useEffect(() => localStorage.setItem('match_heatmap_events', JSON.stringify(heatMapEvents)), [heatMapEvents]);
  useEffect(() => localStorage.setItem('match_player_pressure_stats', JSON.stringify(playerPressureStats)), [playerPressureStats]);
  useEffect(() => localStorage.setItem('match_log', JSON.stringify(ensureArray(matchLog))), [matchLog]);

  // Auto-Sync Player Analysis to DB
  useEffect(() => {
    if (matchId && isAdmin && playerStats && Object.keys(playerStats).length > 0) {
      saveToDb('playerAnalysis', playerStats);
    }
  }, [playerStats, matchId, isAdmin]);

  // Load Saved Matches (Master DB Only)
  const loadMatchList = async () => {
    try {
      const snapshot = await get(child(ref(db), 'matches'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map(key => ({
          id: key,
          ...data[key].matchInfo,
          timestamp: data[key].timestamp
        })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)); // Sort Newest First
        setMatchList(list);
      } else {
        setMatchList([]);
      }
    } catch (error) {
      console.error("Error loading match list:", error);
    }
  };


  // Live Sync Effect (Master DB)
  useEffect(() => {
    if (!matchId) return;

    // Use onValue for Real-time updates from MASTER DB
    const matchRef = ref(db, `matches/${matchId}`);

    const unsubscribe = onValue(matchRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        // Incoming Sync: Always update local state to match DB
        // (Unless we are Admin and actively writing? No, Firebase handles local echo well)
        if (data.timer) setTimer(data.timer);
        if (data.matchInfo) setMatchInfo(data.matchInfo); // Sync Match Info (Names, etc)
        if (data.stats) setStats(data.stats);
        if (data.pitchStats) {
          const ensureArray = (data) => {
            if (!data) return [];
            if (Array.isArray(data)) return data;
            return Object.values(data);
          };
          const cleanQuarter = (q) => ({
            scores: ensureArray(q?.scores).filter(s => s !== null && s !== undefined),
            puckouts: ensureArray(q?.puckouts).filter(p => p !== null && p !== undefined),
            frees: ensureArray(q?.frees).filter(f => f !== null && f !== undefined)
          });
          const cleanStats = {
            q1: cleanQuarter(data.pitchStats.q1 || {}),
            q2: cleanQuarter(data.pitchStats.q2 || {}),
            q3: cleanQuarter(data.pitchStats.q3 || {}),
            q4: cleanQuarter(data.pitchStats.q4 || {}),
            ft: cleanQuarter(data.pitchStats.ft || {})
          };
          setPitchStats(cleanStats);
        }
        if (data.heatMapEvents) {
          setHeatMapEvents(data.heatMapEvents);
          heatMapEventsRef.current = data.heatMapEvents; // Sync Ref
        }
        if (data.playerPressureStats) setPlayerPressureStats(data.playerPressureStats);
        if (data.matchLog) {
          setMatchLog(ensureArray(data.matchLog));
        }

        // Robust Analysis Sync (Handles new and legacy paths)
        const analysisData = data.playerAnalysis || data.playAnalysis;
        if (analysisData) {
          const actualStats = analysisData.playerStats || analysisData;
          setPlayerStats(actualStats);
        }

        // Note: Manual Stats are LOCAL ONLY usually, but could be synced. 
        // For now, leaving Manual Stats local to device unless specifically added to DB schema.
      }
    });

    return () => unsubscribe();
  }, [matchId]);

  // Actions
  const goLive = async (id, admin = false) => {
    setMatchId(id);
    setIsLive(true);
    setIsAdmin(admin);

    if (admin) {
      // Always save current local state to the DB when going live as host
      const matchRef = ref(db, `matches/${id}`);

      set(matchRef, {
        timer,
        matchInfo,
        stats,
        pitchStats,
        heatMapEvents,
        playerPressureStats,
        playerAnalysis: playerStats,
        matchLog,
        timestamp: Date.now()
      }).catch(err => {
        console.error("Error saving match for live broadcast:", err);
      });
    }
  };

  const stopLive = () => {
    setMatchId(null);
    setIsLive(false);
    setIsAdmin(false);
    setPlayerStats({}); // Reset player stats when leaving live session
  };

  // Generic Update Helper (Master Only)
  const saveToDb = (path, value) => {
    // Only auto-save if we are in LIVE BROADCAST mode as Admin
    if (matchId && isAdmin) {
      set(ref(db, `matches/${matchId}/${path}`), value)
        .catch(e => console.error("Save Error:", e));
    }
  };

  // Manual Save (For Loading Saved Matches)
  const saveMatch = async () => {
    if (!loadedMatchId) return;
    try {
      await set(ref(db, `matches/${loadedMatchId}`), {
        matchInfo,
        timer,
        stats,
        pitchStats,
        heatMapEvents,
        playerPressureStats,
        matchLog,
        timestamp: Date.now() // Update timestamp on save
      });
      alert("Match saved successfully!");
    } catch (e) {
      console.error("Manual Save Error:", e);
      alert("Error saving match: " + e.message);
    }
  };

  const addLogEntry = (type, team, details) => {
    let teamName = team;
    if (team === 'home') teamName = matchInfo.homeTeam || 'Home';
    else if (team === 'away') teamName = matchInfo.awayTeam || 'Away';
    // If team is already a name (like from Heatmap), keep it as is
    else if (!team) teamName = 'N/A';

    // If perspective is set, override the team name for specific events
    if (matchInfo.perspective) {
      // Events that are strictly tied to the perspective team (Own actions)
      const perspectiveFixedEvents = [
        'pressures', 'defRuckWon', 'midRuckWon', 'offRuckWon',
        'ownPuckout', 'ownPuckoutWon', 'oppPuckoutWon', 'freeConcededHome', 'freesAgainst'
      ];

      // Events that are strictly tied to the opposition
      const oppositionFixedEvents = [
        'oppPuckout', 'oppPossessions'
      ];

      // Events that are neutral (N/A)
      const neutralEvents = [
        'defRuck', 'midRuck', 'offRuck'
      ];

      if (perspectiveFixedEvents.includes(type)) {
        teamName = matchInfo.perspective;
      } else if (oppositionFixedEvents.includes(type)) {
        teamName = matchInfo.perspective === matchInfo.homeTeam ? (matchInfo.awayTeam || 'Away') : (matchInfo.homeTeam || 'Home');
      } else if (neutralEvents.includes(type)) {
        teamName = 'N/A';
      }
      // For all other events (Scores, Wide, etc.), teamName already correctly uses the 'team' parameter
    }

    const entry = {
      id: Date.now().toString(),
      quarter: timer.quarter,
      time: `${timer.minutes.toString().padStart(2, '0')}:${timer.seconds.toString().padStart(2, '0')}`,
      type,
      team: teamName,
      details: details || '',
      timestamp: Date.now()
    };
    setMatchLog(prev => {
      const newList = [entry, ...ensureArray(prev)];
      saveToDb('matchLog', newList);
      return newList;
    });
  };

  const deleteLogEntry = (id) => {
    setMatchLog(prev => {
      const newList = ensureArray(prev).filter(entry => entry.id !== id);
      saveToDb('matchLog', newList);
      return newList;
    });
  };

  const startTimer = () => {
    setTimer(prev => {
      const newState = { ...prev, isRunning: true };
      saveToDb('timer', newState);
      return newState;
    });
  };

  const pauseTimer = () => {
    setTimer(prev => {
      const newState = { ...prev, isRunning: false };
      saveToDb('timer', newState);
      return newState;
    });
  };

  // Interval for Timer
  useEffect(() => {
    let interval;
    if (timer.isRunning) {
      interval = setInterval(() => {
        setTimer(prev => {
          // Logic to increment time
          let { minutes, seconds } = prev;
          seconds++;
          if (seconds >= 60) {
            minutes++;
            seconds = 0;
          }
          const next = { ...prev, minutes, seconds };
          // Don't save every second to DB (too much), only on pause/event?
          // OR standard app approach: save every 5-10s?
          // For now: syncing every second is spammy. 
          // Better: Save timer only on modify actions.
          // *Ideally* only Admin updates DB.
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer.isRunning]);

  // Sync Timer periodically if Admin
  useEffect(() => {
    if (timer.isRunning && matchId && isAdmin) {
      const tick = setInterval(() => {
        saveToDb('timer', timer);
      }, 5000);
      return () => clearInterval(tick);
    }
  }, [timer, matchId, isAdmin]);


  const endQuarter = () => {
    setTimer(prev => {
      let nextQ = 'FT';
      let minutes = prev.minutes;
      let seconds = prev.seconds;
      let isRunning = prev.isRunning;

      if (prev.quarter === 'Q1') {
        nextQ = 'Q2';
      } else if (prev.quarter === 'Q2') {
        nextQ = 'Q3';
        minutes = 0;
        seconds = 0;
        isRunning = false;
      } else if (prev.quarter === 'Q3') {
        nextQ = 'Q4';
      } else if (prev.quarter === 'Q4') {
        nextQ = 'FT';
        isRunning = false;
      }

      const newState = { minutes, seconds, isRunning, quarter: nextQ };
      saveToDb('timer', newState);
      return newState;
    });
  };

  const setQuarter = (quarter) => {
    setTimer(prev => {
      const newState = { ...prev, quarter };
      saveToDb('timer', newState);
      return newState;
    });
  };

  const updateMatchInfo = (field, value) => {
    setMatchInfo(prev => {
      const next = { ...prev, [field]: value };
      saveToDb('matchInfo', next);
      return next;
    });
  };

  const updateStat = (quarter, statType, team, delta) => {
    setStats(prev => {
      const qStats = prev[quarter] || {};
      let currentVal = qStats[statType];

      // Robust handling for legacy data (number instead of object)
      if (typeof currentVal === 'number') {
        currentVal = { home: currentVal, away: 0 };
      } else if (!currentVal) {
        currentVal = { home: 0, away: 0 };
      }

      // Now currentVal is guaranteed to be an object
      const currentCount = currentVal[team] || 0;
      const nextVal = { ...currentVal, [team]: Math.max(0, currentCount + delta) };

      const nextState = {
        ...prev,
        [quarter]: { ...qStats, [statType]: nextVal }
      };
      saveToDb('stats', nextState);

      // Auto-Log significant stat changes (increments only)
      if (delta > 0) {
        addLogEntry(statType, team);
      }

      return nextState;
    });
  };

  // ... similar for other updates, simpler to just rely on local state update + sync

  const addPitchEvent = (quarter, type, event, skipLog = false) => { // type: scores, puckouts, frees
    setPitchStats(prev => {
      const qStats = prev[quarter] || { scores: [], puckouts: [], frees: [] };
      const list = qStats[type] || [];
      const nextList = [...list, event];
      const nextQ = { ...qStats, [type]: nextList };
      const nextState = { ...prev, [quarter]: nextQ };
      saveToDb('pitchStats', nextState);

      // Auto-Log Pitch events (optional)
      if (!skipLog) {
        addLogEntry(type === 'scores' ? (event.type || 'score') : type, event.team, event.details || '');
      }

      return nextState;
    });
  };

  const undoPitchEvent = (quarter, type) => {
    setPitchStats(prev => {
      const qStats = prev[quarter];
      if (!qStats || !qStats[type] || qStats[type].length === 0) return prev;

      const nextList = [...qStats[type]];
      nextList.pop(); // Remove last

      const nextState = { ...prev, [quarter]: { ...qStats, [type]: nextList } };
      saveToDb('pitchStats', nextState);
      return nextState;
    });
  };

  const removePitchEvent = (quarter, type, id) => {
    setPitchStats(prev => {
      const qStats = prev[quarter];
      if (!qStats) {
        console.warn(`removePitchEvent: Invalid quarter '${quarter}'`);
        return prev;
      }
      const list = qStats[type] || [];
      // Filter by ID (assuming id is passed, not index)
      const nextList = list.filter(item => item && item.id !== id);

      const nextState = { ...prev, [quarter]: { ...qStats, [type]: nextList } };
      saveToDb('pitchStats', nextState);
      return nextState;
    });
  };

  // Heatmap
  const addHeatMapEvent = (quarter, event) => {
    setHeatMapEvents(prev => {
      const list = prev[quarter] || [];
      const nextList = [...list, event];
      const nextState = { ...prev, [quarter]: nextList };

      // AUTO-SAVE to DB
      // NOTE: Previous logic had complex "save to historical if historicalID present".
      // Now: ALWAYS save to Master DB if matchId present.
      if (matchId) {
        saveToDb('heatMapEvents', nextState);
      }

      addLogEntry('Heatmap Event', event.team || 'home');

      return nextState;
    });
  };

  const removeHeatMapEvent = (quarter, index) => {
    setHeatMapEvents(prev => {
      const list = prev[quarter] || [];
      const nextList = list.filter((_, i) => i !== index);
      const nextState = { ...prev, [quarter]: nextList };
      saveToDb('heatMapEvents', nextState);
      return nextState;
    });
  };

  const undoHeatMapEvent = (quarter) => {
    setHeatMapEvents(prev => {
      const list = prev[quarter] || [];
      if (list.length === 0) return prev;
      const nextList = list.slice(0, -1);
      const nextState = { ...prev, [quarter]: nextList };
      saveToDb('heatMapEvents', nextState);
      return nextState;
    });
  };

  const updatePlayerPressureStats = (newStats) => { // Accepts full array or delta? Usually full list
    setPlayerPressureStats(newStats);
    saveToDb('playerPressureStats', newStats);
  };


  // Manual methods removed

  // LOAD MATCH LOGIC (Unified)
  const loadMatch = async (id) => {
    try {
      // Single Source: MASTER DB
      const snapshot = await get(child(ref(db), `matches/${id}`));

      if (snapshot.exists()) {
        const data = snapshot.val();
        setDebugKeys(Object.keys(data)); // Capture all keys for debugging


        // HELPER FUNCTIONS (Defined FIRST for scope visibility)
        const getCI = (obj, key) => {
          if (!obj) return undefined;
          const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
          return foundKey ? obj[foundKey] : undefined;
        };

        const ensureArray = (data) => {
          if (!data) return [];
          if (Array.isArray(data)) return data;
          return Object.values(data);
        };

        const cleanQuarter = (q) => ({
          scores: ensureArray(q?.scores).filter(s => s !== null && s !== undefined),
          puckouts: ensureArray(q?.puckouts).filter(p => p !== null && p !== undefined),
          frees: ensureArray(q?.frees).filter(f => f !== null && f !== undefined)
        });

        const getQData = (source, key) => {
          if (!source) return {};
          return source[key] || source[key.toUpperCase()] || source[key.toLowerCase()] || {};
        };

        // LEGACY DETECTION & MIGRATION
        const rawPitchStats = getCI(data, 'pitchStats');

        // Detect Legacy Flat Structure (direct arrays at root)
        let legacyScores = rawPitchStats && Array.isArray(rawPitchStats.scores) ? rawPitchStats.scores : [];
        let legacyPuckouts = rawPitchStats && Array.isArray(rawPitchStats.puckouts) ? rawPitchStats.puckouts : [];
        let legacyFrees = rawPitchStats && Array.isArray(rawPitchStats.frees) ? rawPitchStats.frees : [];

        const legacyBuckets = {
          q1: { scores: [], puckouts: [], frees: [] },
          q2: { scores: [], puckouts: [], frees: [] },
          q3: { scores: [], puckouts: [], frees: [] },
          q4: { scores: [], puckouts: [], frees: [] },
          ft: { scores: [], puckouts: [], frees: [] }
        };

        const distribute = (items, type) => {
          items.forEach(item => {
            if (!item) return;
            let q = (item.quarter || 'q1').toLowerCase();
            if (!legacyBuckets[q]) q = 'q1';
            legacyBuckets[q][type].push(item);
          });
        };

        if (legacyScores.length > 0) distribute(legacyScores, 'scores');
        if (legacyPuckouts.length > 0) distribute(legacyPuckouts, 'puckouts');
        if (legacyFrees.length > 0) distribute(legacyFrees, 'frees');

        const hasLegacyData = legacyScores.length > 0 || legacyPuckouts.length > 0 || legacyFrees.length > 0;
        if (hasLegacyData) console.warn("Detected and migrated Legacy Flat PitchStats:", legacyBuckets);

        // MERGE LOGIC
        const cleanWithLegacy = (qKey) => {
          const quarterData = getQData(rawPitchStats, qKey);
          const cleaned = cleanQuarter(quarterData);
          const legacy = legacyBuckets[qKey];

          return {
            scores: [...legacy.scores, ...cleaned.scores],
            puckouts: [...legacy.puckouts, ...cleaned.puckouts],
            frees: [...legacy.frees, ...cleaned.frees]
          };
        };

        const sanitizedPitchStats = {
          q1: cleanWithLegacy('q1'),
          q2: cleanWithLegacy('q2'),
          q3: cleanWithLegacy('q3'),
          q4: cleanWithLegacy('q4'),
          ft: cleanWithLegacy('ft')
        };

        console.log("Loaded Pitch Stats (Raw):", rawPitchStats);
        console.log("Loaded Pitch Stats (Sanitized):", sanitizedPitchStats);
        setPitchStats(sanitizedPitchStats);

        // TIMER INFERENCE LOGIC (Aggressive)
        let newTimer = getCI(data, 'timer');
        if (!newTimer || newTimer.quarter === 'Q1') { // Also checking if it defaulted to Q1 in DB but has later stats
          console.warn("Timer data missing or Q1. Inferring state from stats...");

          const hasData = (q) => {
            const p = sanitizedPitchStats?.[q];
            if (p) {
              if (p.scores && p.scores.length > 0) return true;
              if (p.puckouts && p.puckouts.length > 0) return true;
              if (p.frees && p.frees.length > 0) return true;
            }
            return false;
          };

          if (hasData('ft') || hasData('q4')) {
            newTimer = { minutes: 70, seconds: 0, isRunning: false, quarter: 'FT' };
          } else if (hasData('q3')) {
            newTimer = { minutes: 35, seconds: 0, isRunning: false, quarter: 'Q3' };
          } else if (hasData('q2')) {
            newTimer = { minutes: 35, seconds: 0, isRunning: false, quarter: 'Q2' };
          } else {
            newTimer = getCI(data, 'timer') || { minutes: 0, seconds: 0, isRunning: false, quarter: 'Q1' };
          }
        }
        setTimer(newTimer);


        setMatchInfo(getCI(data, 'matchInfo') || INITIAL_MATCH_INFO);

        // Merge with INITIAL_STATS to ensure no missing quarters/keys
        const rawStats = getCI(data, 'stats') || {};
        const mergedStats = { ...INITIAL_STATS, ...rawStats };
        setStats(mergedStats);

        setHeatMapEvents(getCI(data, 'heatMapEvents') || INITIAL_HEATMAP_EVENTS);
        setPlayerPressureStats(getCI(data, 'playerPressureStats') || INITIAL_PLAYER_PRESSURE_STATS);
        setMatchLog(ensureArray(getCI(data, 'matchLog')));

        // MANUAL EDIT MODE:
        // Do NOT set matchId (avoids auto-sync listeners)
        // Set loadedMatchId to allow manual saving
        setMatchId(null);
        setLoadedMatchId(id);
        setIsAdmin(false); // Not broadcasting
        setIsLive(false);

        alert("Match loaded for editing. Changes will NOT be saved until you click 'Save Changes'.");
      } else {
        alert("Match not found.");
      }
    } catch (error) {
      console.error("Load Match Error:", error);
      alert("Error loading match.");
    }
  };

  const resetMatch = () => {
    if (window.confirm("Reset all match data?")) {
      setTimer({ minutes: 0, seconds: 0, isRunning: false, quarter: 'Q1' });
      setStats(INITIAL_STATS);
      setPitchStats({
        q1: { scores: [], puckouts: [], frees: [] },
        q2: { scores: [], puckouts: [], frees: [] },
        q3: { scores: [], puckouts: [], frees: [] },
        q4: { scores: [], puckouts: [], frees: [] }
      });
      setHeatMapEvents(INITIAL_HEATMAP_EVENTS);
      setPlayerPressureStats(INITIAL_PLAYER_PRESSURE_STATS);
      setMatchInfo(INITIAL_MATCH_INFO);
      setMatchLog([]);

      localStorage.removeItem('match_stats');
      localStorage.removeItem('match_timer');
      localStorage.removeItem('match_pitch_stats');
      localStorage.removeItem('match_heatmap_events');
      localStorage.removeItem('match_player_pressure_stats');
      localStorage.removeItem('match_info');
      localStorage.removeItem('match_log');

      // Clear Sync
      setMatchId(null);
      setLoadedMatchId(null);
      setIsAdmin(false);
      setIsLive(false);
    }
  };

  return (
    <MatchContext.Provider value={{
      timer,
      matchInfo,
      stats,
      pitchStats,
      heatMapEvents,
      playerPressureStats,
      setMatchInfo,
      startTimer,
      pauseTimer,
      endQuarter,
      setQuarter,
      updateStat,
      addPitchEvent,
      updateMatchInfo,
      addHeatMapEvent,
      removeHeatMapEvent,
      undoHeatMapEvent,
      updatePlayerPressureStats,
      resetMatch,
      undoPitchEvent,
      removePitchEvent,
      matchLog,
      addLogEntry,
      deleteLogEntry,
      goLive,
      stopLive,
      matchId,
      isAdmin,
      matchList,
      loadMatchList, // Expose
      loadMatch,      // Expose
      loadedMatchId,  // Expose
      saveMatch,      // Expose
      debugKeys
    }}>
      {children}
    </MatchContext.Provider>
  );
};
