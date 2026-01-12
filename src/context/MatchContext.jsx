import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, set, onValue, get, query, orderByKey, limitToLast, child } from 'firebase/database';

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

const INITIAL_HEATMAP_EVENTS = {
  q1: [], q2: [], q3: [], q4: []
};

const INITIAL_PLAYER_PRESSURE_STATS = [];

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
    const cleanQuarter = (q) => ({
      scores: (q?.scores || []).filter(s => s !== null && s !== undefined),
      puckouts: (q?.puckouts || []).filter(p => p !== null && p !== undefined),
      frees: (q?.frees || []).filter(f => f !== null && f !== undefined)
    });

    return {
      q1: cleanQuarter(parsed.q1),
      q2: cleanQuarter(parsed.q2),
      q3: cleanQuarter(parsed.q3),
      q4: cleanQuarter(parsed.q4),
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

  // Manual Entry State
  const [manualStats, setManualStats] = useState(() => {
    const saved = localStorage.getItem('manual_stats');
    return saved ? JSON.parse(saved) : { q1: {}, q2: {}, q3: {}, q4: {} };
  });

  const [manualPitchEvents, setManualPitchEvents] = useState(() => {
    const saved = localStorage.getItem('manual_pitch_events');
    const parsed = saved ? JSON.parse(saved) : null;
    if (!parsed) {
      return {
        q1: { scores: [], puckouts: [], frees: [] },
        q2: { scores: [], puckouts: [], frees: [] },
        q3: { scores: [], puckouts: [], frees: [] },
        q4: { scores: [], puckouts: [], frees: [] }
      };
    }

    const cleanQuarter = (q) => ({
      scores: (q?.scores || []).filter(s => s !== null && s !== undefined),
      puckouts: (q?.puckouts || []).filter(p => p !== null && p !== undefined),
      frees: (q?.frees || []).filter(f => f !== null && f !== undefined)
    });

    return {
      q1: cleanQuarter(parsed.q1),
      q2: cleanQuarter(parsed.q2),
      q3: cleanQuarter(parsed.q3),
      q4: cleanQuarter(parsed.q4),
    };
  });


  // Live Sync State
  const [matchId, setMatchId] = useState(null);
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
  useEffect(() => localStorage.setItem('manual_stats', JSON.stringify(manualStats)), [manualStats]);
  useEffect(() => localStorage.setItem('manual_pitch_events', JSON.stringify(manualPitchEvents)), [manualPitchEvents]);

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
          const cleanQuarter = (q) => ({
            scores: (q?.scores || []).filter(s => s !== null && s !== undefined),
            puckouts: (q?.puckouts || []).filter(p => p !== null && p !== undefined),
            frees: (q?.frees || []).filter(f => f !== null && f !== undefined)
          });
          const cleanStats = {
            q1: cleanQuarter(data.pitchStats.q1),
            q2: cleanQuarter(data.pitchStats.q2),
            q3: cleanQuarter(data.pitchStats.q3),
            q4: cleanQuarter(data.pitchStats.q4),
          };
          setPitchStats(cleanStats);
        }
        if (data.heatMapEvents) {
          setHeatMapEvents(data.heatMapEvents);
          heatMapEventsRef.current = data.heatMapEvents; // Sync Ref
        }
        if (data.playerPressureStats) setPlayerPressureStats(data.playerPressureStats);

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
      // Create/Overwrite in MASTER
      const matchRef = ref(db, `matches/${id}`);

      // Check if exists to preserve data if reconnecting as Admin
      const snapshot = await get(matchRef);
      if (!snapshot.exists()) {
        // Initialize New Match
        set(matchRef, {
          timer,
          matchInfo,
          stats,
          pitchStats,
          heatMapEvents,
          playerPressureStats,
          timestamp: Date.now()
        });
      } else {
        // Reconnected: Use DB data? Or Local?
        // Policy: If Admin reconnects, assume DB is truth to prevent overwrite?
        // OR assume Local is truth (if connection dropped)?
        // Let's assume Local State is FRESHER if we just clicked "Go Live", 
        // BUT if we are joining an existing ID, maybe we want to load it first?
        // For simplicity/safety: Just set the Ref listeners invoke above will sync us.
        // We trigger an initial write ONLY if we have data?
      }
    }
  };

  const stopLive = () => {
    setMatchId(null);
    setIsLive(false);
    setIsAdmin(false);
  };

  // Generic Update Helper (Master Only)
  const saveToDb = (path, value) => {
    if (matchId && isAdmin) {
      set(ref(db, `matches/${matchId}/${path}`), value)
        .catch(e => console.error("Save Error:", e));
    }
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
      if (prev.quarter === 'Q1') nextQ = 'Q2';
      else if (prev.quarter === 'Q2') nextQ = 'Q3';
      else if (prev.quarter === 'Q3') nextQ = 'Q4';

      const newState = { minutes: 0, seconds: 0, isRunning: false, quarter: nextQ };
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
      return nextState;
    });
  };

  // ... similar for other updates, simpler to just rely on local state update + sync

  const addPitchEvent = (quarter, type, event) => { // type: scores, puckouts, frees
    setPitchStats(prev => {
      const qStats = prev[quarter] || { scores: [], puckouts: [], frees: [] };
      const list = qStats[type] || [];
      const nextList = [...list, event];
      const nextQ = { ...qStats, [type]: nextList };
      const nextState = { ...prev, [quarter]: nextQ };
      saveToDb('pitchStats', nextState);
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

        // Also update Player Pressure Stats if derived?
        // Not automatically here, updatePlayerPressureStats is separate call
      }

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


  // Manual
  const updateManualStat = (quarter, playerIndex, stat, delta) => {
    setManualStats(prev => {
      const qStats = prev[quarter] || {};
      const pStats = qStats[playerIndex] || {};
      const nextVal = Math.max(0, (pStats[stat] || 0) + delta);
      return { ...prev, [quarter]: { ...qStats, [playerIndex]: { ...pStats, [stat]: nextVal } } };
    });
  };

  const addManualPitchEvent = (quarter, type, event) => {
    setManualPitchEvents(prev => {
      const qStats = prev[quarter] || { scores: [], puckouts: [], frees: [] };
      const list = qStats[type] || [];
      return {
        ...prev, [quarter]: { ...qStats, [type]: [...list, event] }
      };
    });
  };

  const undoManualPitchEvent = (quarter, type) => {
    setManualPitchEvents(prev => {
      const qStats = prev[quarter];
      const list = qStats[type] || [];
      if (list.length === 0) return prev;
      return {
        ...prev, [quarter]: { ...qStats, [type]: list.slice(0, -1) }
      };
    });
  };

  // LOAD MATCH LOGIC (Unified)
  const loadMatch = async (id) => {
    try {
      // Single Source: MASTER DB
      const snapshot = await get(child(ref(db), `matches/${id}`));

      if (snapshot.exists()) {
        const data = snapshot.val();
        setDebugKeys(Object.keys(data)); // Capture all keys for debugging


        // SANITIZATION: Clean pitchStats to remove nulls immediately on load
        const cleanPitchStats = (rawStats) => {
          if (!rawStats) return { q1: { scores: [], puckouts: [], frees: [] }, q2: { scores: [], puckouts: [], frees: [] }, q3: { scores: [], puckouts: [], frees: [] }, q4: { scores: [], puckouts: [], frees: [] } };
          const cleanQuarter = (q) => ({
            scores: (q?.scores || []).filter(s => s !== null && s !== undefined),
            puckouts: (q?.puckouts || []).filter(p => p !== null && p !== undefined),
            frees: (q?.frees || []).filter(f => f !== null && f !== undefined)
          });
          return {
            q1: cleanQuarter(rawStats.q1),
            q2: cleanQuarter(rawStats.q2),
            q3: cleanQuarter(rawStats.q3),
            q4: cleanQuarter(rawStats.q4),
          };
        };
        setPitchStats(cleanPitchStats(data.pitchStats));

        setTimer(data.timer || { minutes: 0, seconds: 0, isRunning: false, quarter: 'Q1' });
        setMatchInfo(data.matchInfo || INITIAL_MATCH_INFO);
        setStats(data.stats || INITIAL_STATS);
        // Note: pitchStats already set via cleanPitchStats above
        setHeatMapEvents(data.heatMapEvents || INITIAL_HEATMAP_EVENTS);
        setPlayerPressureStats(data.playerPressureStats || INITIAL_PLAYER_PRESSURE_STATS);

        // Set ID so we are "Live" with this match (Read/Write)
        // IMPORTANT: "Load" usually implies "View/Edit". 
        // Do we set isAdmin?
        // Logic: If loading, let's treat as Local View unless "Go Live" is pressed?
        // User said "Load" -> "Edit" -> "Save". 
        // To support Save, we need `matchId` set.
        setMatchId(id);
        // Do NOT set isAdmin automatically? Or set it true to allow edits?
        // The user specifically wants to "load and update". 
        // Let's set isAdmin = true to enable `saveToDb` hooks.
        // Wait, `goLive` does this.
        // Let's repurpose this:
        setIsAdmin(true);
        setIsLive(false); // It's not a "Live Broadcast" maybe, but it is an active session

        alert("Match loaded successfully from Master Database.");
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
      localStorage.removeItem('match_heatmap_events');
      localStorage.removeItem('match_player_pressure_stats');
      localStorage.removeItem('match_info');
      localStorage.removeItem('manual_stats');
      localStorage.removeItem('manual_pitch_events');

      // Clear Sync
      setMatchId(null);
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
      manualStats,
      manualPitchEvents,
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
      updateManualStat,
      addManualPitchEvent,
      undoPitchEvent,
      removePitchEvent,
      undoManualPitchEvent,
      goLive,
      stopLive,
      matchId,
      isAdmin,
      matchList,
      loadMatchList, // Expose
      loadMatch,      // Expose
      debugKeys
    }}>
      {children}
    </MatchContext.Provider>
  );
};
