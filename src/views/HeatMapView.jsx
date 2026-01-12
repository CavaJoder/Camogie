import React, { useState, useEffect, useRef } from 'react';
import { useMatch } from '../context/MatchContext';
import { useSquad } from '../context/SquadContext';
import { db as database } from '../firebase';
const liveMatchesDatabase = database;
import { ref, get, child, query, orderByKey, limitToLast, set, update } from 'firebase/database';
import { RotateCcw, Trash2, Layers, Grid, Columns, Square, FileUp, FileDown, FileText, Save, Lock, Unlock, Plus, RefreshCw, Upload, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import Papa from 'papaparse';

// --- SUB-COMPONENT: HeatMapPitch ---
// ... (No changes to HeatMapPitch definition, assuming it's above or I skip it in this chunk if possible, but I need to be careful about offsets. 
// I will target the imports and the component body specifically).

// ... HeatMapPitch is lines 9-247. I will target lines 1-7 and 221 onwards.

// WAIT, I need to use MultiReplace to skip HeatMapPitch.

// ... 


// --- SUB-COMPONENT: HeatMapPitch ---
const HeatMapPitch = ({
    events,
    viewMode,
    onClick,
    showNumbers,
    showHeatColor,
    usePercentageColor, // New prop
    onHover,
    hoveredZoneId,
    width,     // Optional prop for override
    height,    // Optional prop for override
    style,     // Optional style prop
    idSuffix = '',
    homeGoalSide = 'left', // 'left' or 'right'
    homeTeamName = '',
    awayTeamName = ''
}) => {
    // INTERNAL COORDINATE SYSTEM (FIXED 400x250)
    // INTERNAL COORDINATE SYSTEM (FIXED 400x250)
    console.log("DEBUG: HeatMapPitch Props", { homeTeamName, awayTeamName, homeGoalSide });
    const INT_W = 400;
    const INT_H = 250;

    // Dimensions
    const START_X = 15;
    const END_X = INT_W - 15;
    const PLAYABLE_WIDTH = END_X - START_X;

    const ZONE_COUNT = 5;
    const ZONE_WIDTH = PLAYABLE_WIDTH / ZONE_COUNT;
    const LINES_X = Array.from({ length: ZONE_COUNT + 1 }, (_, i) => START_X + (i * ZONE_WIDTH));

    const TOP_Y = 15;
    const BOTTOM_Y = INT_H - 15;
    const PITCH_HEIGHT = BOTTOM_Y - TOP_Y;
    const CHANNEL_HEIGHT = PITCH_HEIGHT / 3;
    const CHANNELS_Y = [TOP_Y, TOP_Y + CHANNEL_HEIGHT, TOP_Y + 2 * CHANNEL_HEIGHT, BOTTOM_Y];

    const ZONE_NAMES = [
        ['Left Corner Back', 'Full Back', 'Right Corner Back'],
        ['Left Half Back', 'Centre Back', 'Right Half Back'],
        ['Centre Left', 'Centre', 'Centre Right'],
        ['Left Half Forward', 'Centre Forward', 'Right Half Forward'],
        ['Left Corner Forward', 'Full Forward', 'Right Corner Forward']
    ];

    const standardZones = [];
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++) {
            standardZones.push({
                id: `z_${i}_${j}`,
                x: LINES_X[i],
                y: CHANNELS_Y[j],
                width: ZONE_WIDTH,
                height: CHANNEL_HEIGHT,
                label: ZONE_NAMES[i][j],
                subZoneIds: [`z_${i}_${j}`]
            });
        }
    }

    const lineZones = [
        { id: 'l_0', label: 'Full Back Line', x: LINES_X[0], y: TOP_Y, width: ZONE_WIDTH, height: PITCH_HEIGHT, subZoneIds: ['z_0_0', 'z_0_1', 'z_0_2'] },
        { id: 'l_1', label: 'Half Back Line', x: LINES_X[1], y: TOP_Y, width: ZONE_WIDTH, height: PITCH_HEIGHT, subZoneIds: ['z_1_0', 'z_1_1', 'z_1_2'] },
        { id: 'l_2', label: 'Midfield', x: LINES_X[2], y: TOP_Y, width: ZONE_WIDTH, height: PITCH_HEIGHT, subZoneIds: ['z_2_0', 'z_2_1', 'z_2_2'] },
        { id: 'l_3', label: 'Half Forward Line', x: LINES_X[3], y: TOP_Y, width: ZONE_WIDTH, height: PITCH_HEIGHT, subZoneIds: ['z_3_0', 'z_3_1', 'z_3_2'] },
        { id: 'l_4', label: 'Full Forward Line', x: LINES_X[4], y: TOP_Y, width: ZONE_WIDTH, height: PITCH_HEIGHT, subZoneIds: ['z_4_0', 'z_4_1', 'z_4_2'] }
    ];

    const sectorZones = [
        { id: 's_def', label: 'Defensive Zone', x: LINES_X[0], y: TOP_Y, width: ZONE_WIDTH * 2, height: PITCH_HEIGHT, subZoneIds: ['z_0_0', 'z_0_1', 'z_0_2', 'z_1_0', 'z_1_1', 'z_1_2'] },
        { id: 's_mid', label: 'Midfield Zone', x: LINES_X[2], y: TOP_Y, width: ZONE_WIDTH, height: PITCH_HEIGHT, subZoneIds: ['z_2_0', 'z_2_1', 'z_2_2'] },
        { id: 's_fwd', label: 'Forward Zone', x: LINES_X[3], y: TOP_Y, width: ZONE_WIDTH * 2, height: PITCH_HEIGHT, subZoneIds: ['z_3_0', 'z_3_1', 'z_3_2', 'z_4_0', 'z_4_1', 'z_4_2'] }
    ];

    const displayZones = viewMode === 'standard' ? standardZones : (viewMode === 'lines' ? lineZones : sectorZones);

    const getZoneCounts = (subZoneIds) => {
        const zoneEvents = events.filter(e => e && subZoneIds.includes(e.zoneId));
        return {
            oppPossession: zoneEvents.filter(e => e && e.type === 'oppPossession').length,
            teamPressure: zoneEvents.filter(e => e && e.type === 'teamPressure').length
        };
    };

    const getZoneColor = (counts) => {
        if (!showHeatColor) return 'transparent';

        if (usePercentageColor) {
            const opp = counts.oppPossession;
            const press = counts.teamPressure;
            // Avoid division by zero
            if (opp === 0 && press === 0) return 'transparent';
            // If opp is 0 but press > 0, it's technically 100% or infinite efficiency, treat as Green?
            // Or if total events are low? Let's stick to (Press / Opp) * 100 logic.
            // If Opp is 0, let's treat it as high efficiency if Press > 0, else 0.
            let percent = 0;
            if (opp > 0) {
                percent = (press / opp) * 100;
            } else if (press > 0) {
                percent = 100; // All pressure, no possession lost? (Edge case)
            }

            // Transparency factor based on activity volume to still show "heat"?
            // Or just solid colors? User said "Green co,our, between...". 
            // Let's use opacity 0.6 to match previous style so grid lines show through.
            const opacity = 0.6;

            if (percent > 55) return `rgba(76, 175, 80, ${opacity})`;   // Green
            if (percent >= 45) return `rgba(255, 193, 7, ${opacity})`;  // Amber

            // Red Zone Logic
            // Exception: Low Activity (<= 2 Opp Possessions) -> Pink
            if (opp <= 2) return `rgba(255, 182, 193, ${opacity})`;

            // Red Gradient based on %
            if (percent >= 40) return `rgba(255, 82, 82, ${opacity})`; // Light Red (40-44%)
            if (percent >= 30) return `rgba(244, 67, 54, ${opacity})`; // Standard Red (30-39%)
            if (percent >= 25) return `rgba(211, 47, 47, ${opacity})`; // Dark Red (25-29%)
            return `rgba(183, 28, 28, ${opacity})`;                    // Darkest Red (<25%)
        }

        const net = counts.oppPossession - counts.teamPressure;
        if (net > 0) {
            const intensity = Math.min(net / 5, 1);
            return `rgba(255, 0, 0, ${intensity * 0.6})`;
        }
        return 'transparent';
    };

    const handleZoneClickInternal = (e, zone) => {
        if (onClick) onClick(e, zone);
    };

    const patternId = `grassStripes${idSuffix}`;

    return (
        <svg
            viewBox={`0 0 ${INT_W} ${INT_H}`}
            width={width}
            height={height}
            style={{
                backgroundColor: '#1a4d1a',
                border: '2px solid #444',
                borderRadius: '8px',
                display: 'block',
                ...style
            }}
        >
            <defs>
                <pattern id={patternId} x="0" y="0" width="16" height={INT_H} patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="8" height={INT_H} fill="#1a5c1a" />
                    <rect x="8" y="0" width="8" height={INT_H} fill="#1a4d1a" />
                </pattern>
            </defs>
            <rect x="0" y="0" width={INT_W} height={INT_H} fill={`url(#${patternId})`} />

            {/* ZONES LAYER - Enhanced Visibility */}
            {displayZones.map(zone => {
                const counts = getZoneCounts(zone.subZoneIds);
                const fillColor = getZoneColor(counts);

                return (
                    <g key={zone.id}>
                        <rect
                            x={zone.x}
                            y={zone.y}
                            width={zone.width}
                            height={zone.height}
                            fill={fillColor}
                            // Zone Lines: Pink and Solid
                            stroke={viewMode === 'standard' ? "#FF1493" : "none"}
                            strokeWidth={viewMode === 'standard' ? "2" : "0"}
                            strokeOpacity={viewMode === 'standard' ? "0.8" : "0"}
                            strokeDasharray=""

                            onClick={(e) => handleZoneClickInternal(e, zone)}
                            style={{ cursor: onClick ? (viewMode === 'standard' ? 'pointer' : 'not-allowed') : 'default' }}
                            onMouseEnter={() => onHover && onHover(zone.id)}
                            onMouseLeave={() => onHover && onHover(null)}
                        />
                    </g>
                );
            })}

            {/* DETAILED PITCH LINES LAYER - FADED OUT */}
            {/* Reduced strokeOpacity to 0.5 (was 1 or implicit) */}
            <g pointerEvents="none" strokeOpacity="0.4">
                <rect x="15" y="15" width="370" height="220" fill="none" stroke="white" strokeWidth="2" />
                <rect x="15" y="100" width="12" height="50" fill="none" stroke="white" strokeWidth="2" />
                <path d="M 70 55 C 110 55, 110 125, 110 125 C 110 125, 110 195, 70 195" fill="none" stroke="white" strokeWidth="2" />
                <path d="M 70 85 Q 90 85 90 125 Q 90 165 70 165" fill="none" stroke="white" strokeWidth="2" />
                <rect x="373" y="100" width="12" height="50" fill="none" stroke="white" strokeWidth="2" />
                <path d="M 330 55 C 290 55, 290 125, 290 125 C 290 125, 290 195, 330 195" fill="none" stroke="white" strokeWidth="2" />
                <path d="M 330 85 Q 310 85 310 125 Q 310 165 330 165" fill="none" stroke="white" strokeWidth="2" />
                <line x1="55" y1="15" x2="55" y2="235" stroke="white" strokeWidth="2" />
                <line x1="70" y1="15" x2="70" y2="235" stroke="white" strokeWidth="2" />
                <line x1="130" y1="15" x2="130" y2="235" stroke="white" strokeWidth="2" />
                <line x1="165" y1="15" x2="165" y2="235" stroke="white" strokeWidth="2" />
                <line x1="200" y1="15" x2="200" y2="235" stroke="white" strokeWidth="2" strokeDasharray="6,4" />
                <line x1="235" y1="15" x2="235" y2="235" stroke="white" strokeWidth="2" />
                <line x1="270" y1="15" x2="270" y2="235" stroke="white" strokeWidth="2" />
                <line x1="330" y1="15" x2="330" y2="235" stroke="white" strokeWidth="2" />
                <line x1="345" y1="15" x2="345" y2="235" stroke="white" strokeWidth="2" />
                <line x1="15" y1="92" x2="55" y2="92" stroke="white" strokeWidth="2" />
                <line x1="15" y1="158" x2="55" y2="158" stroke="white" strokeWidth="2" />
                <line x1="345" y1="92" x2="385" y2="92" stroke="white" strokeWidth="2" />
                <line x1="345" y1="158" x2="385" y2="158" stroke="white" strokeWidth="2" />
                <rect x="10" y="115" width="5" height="5" fill="white" />
                <rect x="10" y="130" width="5" height="5" fill="white" />
                <rect x="385" y="115" width="5" height="5" fill="white" />
                <rect x="385" y="130" width="5" height="5" fill="white" />
            </g>

            {/* TEXT LAYER */}
            {displayZones.map(zone => {
                const counts = getZoneCounts(zone.subZoneIds);
                const isHovered = hoveredZoneId === zone.id;
                const shouldDisplayStats = showNumbers || isHovered;

                if (!shouldDisplayStats) return null;

                return (
                    <g key={`text_${zone.id}`} pointerEvents="none">
                        <text
                            x={zone.x + zone.width / 2}
                            y={zone.y + zone.height * (viewMode === 'standard' ? 0.3 : 0.4)}
                            textAnchor="middle"
                            fill="#ff6b6b"
                            fontSize={viewMode === 'standard' ? "10" : "14"}
                            fontWeight="bold"
                            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                        >
                            {counts.oppPossession > 0 ? counts.oppPossession : ''}
                        </text>
                        <text
                            x={zone.x + zone.width / 2}
                            y={zone.y + zone.height * (viewMode === 'standard' ? 0.8 : 0.6)}
                            textAnchor="middle"
                            fill="#4caf50"
                            fontSize={viewMode === 'standard' ? "10" : "14"}
                            fontWeight="bold"
                            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                        >
                            {counts.teamPressure > 0 ? counts.teamPressure : ''}
                        </text>
                    </g>
                );
            })}
            {/* GOAL LABELS */}
            {/* Logic: If Home is Left -> Left Label = Home Name, Right Label = Away Name */}
            {/* Logic: If Home is Left -> Left Label = Home Name, Right Label = Away Name */}
            <text x="15" y="12" textAnchor="start" fill="#ffffff" fontSize="12" fontWeight="bold" style={{ textShadow: '1px 1px 2px black' }}>
                {homeGoalSide === 'left' ? (homeTeamName || 'HOME') : (awayTeamName || 'AWAY')}
            </text>
            <text x={END_X - 15} y="12" textAnchor="end" fill="#ffffff" fontSize="12" fontWeight="bold" style={{ textShadow: '1px 1px 2px black' }}>
                {homeGoalSide === 'right' ? (homeTeamName || 'HOME') : (awayTeamName || 'AWAY')}
            </text>

        </svg>
    );
};

const HeatMapView = () => {
    const {
        matchInfo,
        heatMapEvents,
        addHeatMapEvent,
        removeHeatMapEvent,
        undoHeatMapEvent,
        isAdmin,
        isLive,
        squad = [], // Default to empty array to prevent crash if undefined
        playerPressureStats,
        updateSquad,
        updateMatchInfo, // Add updateMatchInfo
        updatePlayerPressureStats,
        matchList, // Use Global Match List
        loadMatchList // Added for initialization
    } = useMatch();
    const { squads } = useSquad();
    const [selectedQuarter, setSelectedQuarter] = useState('q1');
    const [isCorrectionMode, setIsCorrectionMode] = useState(false);
    const [viewMode, setViewMode] = useState('standard');
    const [hoveredZoneId, setHoveredZoneId] = useState(null);


    // Alias strictly for compatibility with existing render logic
    const availableMatches = matchList;
    const [viewedMatchInfo, setViewedMatchInfo] = useState(null); // New state for historical match info
    const [viewedHeatMapEvents, setViewedHeatMapEvents] = useState(null);
    const [viewedPlayerPressureStats, setViewedPlayerPressureStats] = useState(null);
    const [viewedMatchId, setViewedMatchId] = useState('__default__');
    const [isEditable, setIsEditable] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Player Stats Local State Inputs
    const [newPlayerName, setNewPlayerName] = useState('');
    const [selectedSquadId, setSelectedSquadId] = useState('');

    // Updated Quarters List including Halves
    const PRESET_TABS = [
        { id: 'q1', label: 'Q1' },
        { id: 'q2', label: 'Q2' },
        { id: 'firstHalf', label: '1st Half' },
        { id: 'q3', label: 'Q3' },
        { id: 'q4', label: 'Q4' },
        { id: 'secondHalf', label: '2nd Half' },
        { id: 'summary', label: 'Full Match' }
    ];

    // Load match list on mount
    useEffect(() => {
        loadMatchList();
    }, [loadMatchList]);

    const handleMatchSelect = async (e) => {
        const id = e.target.value;
        console.log("DEBUG: One-Off Select ID:", id);
        setViewedMatchId(id);

        if (id) {
            // Fetch heatMapEvents AND playerPressureStats from CORRECT database for the selected match
            const foundMatch = availableMatches.find(m => m.id === id);
            console.log("DEBUG: Found Match Object:", foundMatch);

            const targetDb = database; // Always Master DB
            console.log("DEBUG: Target DB is Master");

            const dbRef = ref(targetDb);
            try {
                const snapshot = await get(child(dbRef, `matches/${id}`));
                console.log("DEBUG: Snapshot Exists?", snapshot.exists());
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    console.log("DEBUG: Snapshot Data Keys:", Object.keys(data));

                    setViewedHeatMapEvents(data.heatMapEvents || { q1: [], q2: [], q3: [], q4: [] });

                    const pStats = data.playerPressureStats;
                    setViewedPlayerPressureStats(pStats ? (Array.isArray(pStats) ? pStats : Object.values(pStats)) : []);

                    // ALWAYS load matchInfo from DB to get homeTeam/awayTeam details
                    setViewedMatchInfo(data.matchInfo || null);
                } else {
                    setViewedHeatMapEvents(null);
                    setViewedPlayerPressureStats([]);
                    setViewedMatchInfo(null);
                }
            } catch (error) {
                console.error("Error fetching match data:", error);
                setViewedHeatMapEvents(null);
                setViewedPlayerPressureStats([]);
                if (!foundMatch) setViewedMatchInfo(null);
            }
        } else {
            setViewedHeatMapEvents(null);
            setViewedPlayerPressureStats(null);
            setViewedMatchInfo(null);
        }
        // Reset edit state on match change
        setIsEditable(false);
        setHasUnsavedChanges(false);
    };

    const saveToFirebase = async () => {
        if (!viewedMatchId) return;
        try {
            // --- RETROSPECTIVE POSITION SYNC ---
            let statsToSave = viewedPlayerPressureStats;
            if (viewedPlayerPressureStats && Array.isArray(viewedPlayerPressureStats)) {
                statsToSave = viewedPlayerPressureStats.map(p => {
                    if (!p.position || p.position === 'Unknown') {
                        // Lookup in squads
                        for (const s of squads) {
                            const match = s.players?.find(pl => pl.name === p.name);
                            if (match) {
                                // Handle both 'positions' (array) and 'position' (string) formats
                                const pos = match.positions?.[0] || match.position;
                                if (pos) return { ...p, position: pos };
                            }
                        }
                    }
                    return p;
                });
                // Update local state if changed
                if (JSON.stringify(statsToSave) !== JSON.stringify(viewedPlayerPressureStats)) {
                    setViewedPlayerPressureStats(statsToSave);
                }
            }
            // -----------------------------------

            const viewedMatch = availableMatches.find(m => m.id === viewedMatchId);
            const targetDb = database; // Always Master DB

            if (viewedHeatMapEvents) await set(ref(targetDb, `matches/${viewedMatchId}/heatMapEvents`), viewedHeatMapEvents);
            if (statsToSave) await set(ref(targetDb, `matches/${viewedMatchId}/playerPressureStats`), statsToSave);

            // Save only Goal Direction to prevent overwriting critical match info (names/dates)
            if (viewedMatchInfo && viewedMatchInfo.homeGoalSide) {
                await update(ref(targetDb, `matches/${viewedMatchId}/matchInfo`), {
                    homeGoalSide: viewedMatchInfo.homeGoalSide
                });
            }

            setHasUnsavedChanges(false);
            alert("Data synced successfully!");
        } catch (err) {
            console.error("Error saving data:", err);
            alert("Failed to sync data.");
        }
    };

    const handleGoalDirectionChange = (direction) => {
        if (viewedMatchId) {
            if (!isEditable) {
                alert("Unlock editing to change goal direction.");
                return;
            }
            setViewedMatchInfo(prev => ({ ...prev, homeGoalDirection: direction }));
            setHasUnsavedChanges(true);
        } else {
            updateMatchInfo('homeGoalDirection', direction);
        }
    };

    const getAdjustedDirection = (baseDirection, quarter) => {
        if (!baseDirection) return 'left';
        if (['q3', 'q4', 'secondHalf'].includes(quarter)) {
            return baseDirection === 'left' ? 'right' : 'left';
        }
        return baseDirection;
    };

    const activeData = viewedMatchId ? (viewedHeatMapEvents || { q1: [], q2: [], q3: [], q4: [] }) : heatMapEvents;
    const rawPlayerStats = viewedMatchId ? (viewedPlayerPressureStats || []) : playerPressureStats;
    const activePlayerStats = Array.isArray(rawPlayerStats) ? rawPlayerStats : [];

    // --- Player Stats Helpers ---
    const updateActivePlayerStats = (newStats) => {
        if (viewedMatchId) {
            setViewedPlayerPressureStats(newStats);
            setHasUnsavedChanges(true);
        } else {
            updatePlayerPressureStats(newStats);
        }
    };

    const handleAddPlayer = () => {
        if (!newPlayerName.trim()) return;

        // Auto-Add to global squad if live
        if (!viewedMatchId && !squad.includes(newPlayerName.trim())) {
            updateSquad([...squad, newPlayerName.trim()]);
        }

        // Check if player already exists in the table to prevent duplicates
        if (activePlayerStats.find(p => p.name === newPlayerName.trim())) {
            alert("Player already added.");
            return;
        }

        // Lookup Position from Squads
        let position = 'Unknown';
        if (selectedSquadId) {
            const sq = squads.find(s => s.id === selectedSquadId);
            const pl = sq?.players?.find(p => p.name === newPlayerName.trim());
            if (pl) {
                const pos = pl.positions?.[0] || pl.position;
                if (pos) position = pos;
            }
        } else {
            // Global search if no squad selected (less reliable but useful)
            for (const s of squads) {
                const pl = s.players?.find(p => p.name === newPlayerName.trim());
                if (pl) {
                    const pos = pl.positions?.[0] || pl.position;
                    if (pos) {
                        position = pos;
                        break;
                    }
                }
            }
        }

        const newEntry = {
            id: Date.now(),
            name: newPlayerName.trim(),
            position: position, // Added Position
            // New Structure: quarters object
            quarters: {
                q1: { pressures: 0, freeConceded: 0, turnovers: 0, minutes: '' },
                q2: { pressures: 0, freeConceded: 0, turnovers: 0, minutes: '' },
                q3: { pressures: 0, freeConceded: 0, turnovers: 0, minutes: '' },
                q4: { pressures: 0, freeConceded: 0, turnovers: 0, minutes: '' }
            }
        };

        updateActivePlayerStats([...activePlayerStats, newEntry]);
        setNewPlayerName('');
        // Reset dropdown via key or just let state handle it (state is cleared)
    };

    const handleUpdatePlayerStat = (playerId, quarter, field, value) => {
        if (viewedMatchId && !isEditable) return;

        // Ensure we are strictly in a single Quarter for editing (not H1/H2/Full)
        if (!['q1', 'q2', 'q3', 'q4'].includes(quarter)) {
            alert("Please select a specific Quarter (Q1-Q4) to edit stats.");
            return;
        }

        const updated = activePlayerStats.map(p => {
            if (p.id !== playerId) return p;

            // Migrate old structure if needed (robustness)
            const pQuarters = p.quarters || {
                q1: { pressures: p.pressures || 0, freeConceded: p.freeConceded || 0, turnovers: p.turnovers || 0, minutes: '' },
                q2: { pressures: 0, freeConceded: 0, turnovers: 0, minutes: '' },
                q3: { pressures: 0, freeConceded: 0, turnovers: 0, minutes: '' },
                q4: { pressures: 0, freeConceded: 0, turnovers: 0, minutes: '' }
            };

            const qStats = pQuarters[quarter] || { pressures: 0, freeConceded: 0, turnovers: 0, minutes: '' };
            let newVal = value;
            // Parse ints for metrics, keep minutes as string or int? 
            // "This field is free text" -> Keep as string but user said "I will add the number of minutes". 
            // Let's treat as number for aggregation but string for input. 
            if (field !== 'minutes') newVal = parseInt(value) || 0;

            return {
                ...p,
                quarters: {
                    ...pQuarters,
                    [quarter]: {
                        ...qStats,
                        [field]: newVal
                    }
                }
            };
        });
        updateActivePlayerStats(updated);
    };

    const handleRemovePlayerStat = (id) => {
        if (viewedMatchId && !isEditable) return;
        updateActivePlayerStats(activePlayerStats.filter(p => p.id !== id));
    };

    const handlePlayerStatsImport = (e) => {
        if (viewedMatchId && !isEditable) return;
        const file = e.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const imported = results.data.map(row => ({
                        id: Date.now() + Math.random(),
                        name: row.Name || row.name || 'Unknown',
                        club: row.Club || row.club || '', // Added Club Import
                        pressures: parseInt(row.Pressures || row.pressures) || 0,
                        freeConceded: parseInt(row['Free Conceded'] || row.freeConceded) || 0,
                        turnovers: parseInt(row['Turnover Won'] || row.turnovers) || 0
                    }));
                    updateActivePlayerStats([...activePlayerStats, ...imported]);
                }
            });
        }
    };

    const handlePlayerStatsExport = () => {
        const csvRows = [];

        // Helper to get totals
        const getTotals = (p) => {
            const qs = p.quarters || {};
            const metrics = ['pressures', 'freeConceded', 'turnovers', 'minutes']; // Minutes needs parsing
            const totals = { pressures: 0, freeConceded: 0, turnovers: 0, minutes: 0 };
            ['q1', 'q2', 'q3', 'q4'].forEach(q => {
                const stats = qs[q] || {};
                totals.pressures += (stats.pressures || 0);
                totals.freeConceded += (stats.freeConceded || 0);
                totals.turnovers += (stats.turnovers || 0);
                totals.minutes += (parseInt(stats.minutes) || 0);
            });
            return totals;
        }

        // Expanded CSV Format
        activePlayerStats.forEach(p => {
            const t = getTotals(p);
            const qs = p.quarters || {};
            const row = {
                Name: p.name,
                Club: p.club || '', // Added Club Export
                'Total Minutes': t.minutes,
                'Total Pressures': t.pressures,
                'Total Frees': t.freeConceded,
                'Total Turnovers': t.turnovers,
                // Breakdown
                'Q1 Mins': qs.q1?.minutes || '', 'Q1 Press': qs.q1?.pressures || 0,
                'Q2 Mins': qs.q2?.minutes || '', 'Q2 Press': qs.q2?.pressures || 0,
                'Q3 Mins': qs.q3?.minutes || '', 'Q3 Press': qs.q3?.pressures || 0,
                'Q4 Mins': qs.q4?.minutes || '', 'Q4 Press': qs.q4?.pressures || 0
            };
            csvRows.push(row);
        });

        const csv = Papa.unparse(csvRows);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'player_pressure_stats.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleResetPlayerStats = () => {
        if (viewedMatchId && !isEditable) return;
        if (confirm("Clear all player stats?")) {
            updateActivePlayerStats([]);
        }
    };

    const getNormalizedZoneId = (zoneId) => {
        // Format: z_x_y (e.g. z_0_0 is Top Left)
        if (!zoneId.startsWith('z_')) return zoneId; // Ignore line/sector zones if any

        const parts = zoneId.split('_');
        if (parts.length !== 3) return zoneId;

        const x = parseInt(parts[1]);
        const y = parseInt(parts[2]);

        // Invert Grid (5x3): x -> 4-x, y -> 2-y
        // This maps Bottom-Right (4,2) back to Top-Left (0,0)
        return `z_${4 - x}_${2 - y}`;
    };

    const getEventsForQuarter = (q) => {
        if (q === 'summary') {
            const firstHalf = [...(activeData.q1 || []), ...(activeData.q2 || [])];

            // For Summary, we normalize Q3/Q4 events to match the 1st Half orientation
            // i.e. "Left Corner Back" (Top-Left) events in 2nd half (which occur at Bottom-Right)
            // are mapped back to Top-Left zone.
            const rawSecondHalf = [...(activeData.q3 || []), ...(activeData.q4 || [])];
            const normalizedSecondHalf = rawSecondHalf.map(e => ({
                ...e,
                zoneId: getNormalizedZoneId(e.zoneId)
            }));

            return [...firstHalf, ...normalizedSecondHalf];
        }
        if (q === 'firstHalf') {
            return [...(activeData.q1 || []), ...(activeData.q2 || [])];
        }
        if (q === 'secondHalf') {
            return [...(activeData.q3 || []), ...(activeData.q4 || [])];
        }
        return activeData[q] || [];
    };

    const currentEvents = getEventsForQuarter(selectedQuarter);

    const getActiveZoneCounts = (subZoneIds, qOverride) => {
        // Use qOverride if provided, otherwise selectedQuarter
        const targetQ = qOverride || selectedQuarter;
        // MUST use getEventsForQuarter to handle virtual tabs (firstHalf, secondHalf, summary)
        const events = getEventsForQuarter(targetQ);

        const zoneEvents = events.filter(e => e && subZoneIds.includes(e.zoneId));
        return {
            oppPossession: zoneEvents.filter(e => e && e.type === 'oppPossession').length,
            teamPressure: zoneEvents.filter(e => e && e.type === 'teamPressure').length
        };
    };
    const handleZoneClick = (e, zone) => {
        // HISTORICAL EDITING MODE
        if (viewedMatchId) {
            if (!isEditable) {
                alert("Viewing mode only. Click 'Unlock Editing' to modify.");
                return;
            }

            // Allow editing historical data via local state
            if (viewMode !== 'standard') {
                alert("Switch to 'Standard' view to edit.");
                return;
            }

            const rect = e.currentTarget.getBoundingClientRect();
            const rectY = e.clientY - rect.top;
            const isTop = rectY < rect.height / 2;
            const type = isTop ? 'oppPossession' : 'teamPressure';

            // Local State Update Helper
            const updateLocalState = (type, action) => {
                setViewedHeatMapEvents(prev => {
                    const currentQEvents = prev[selectedQuarter] || [];
                    let newQEvents = [...currentQEvents];

                    if (action === 'add') {
                        if (['summary', 'firstHalf', 'secondHalf'].includes(selectedQuarter)) {
                            alert("Please select a specific Quarter (Q1-Q4) to add data.");
                            return prev;
                        }
                        newQEvents.push({
                            id: Date.now(),
                            zoneId: zone.id,
                            type: type,
                            timestamp: Date.now()
                        });
                    } else if (action === 'remove') {
                        if (['summary', 'firstHalf', 'secondHalf'].includes(selectedQuarter)) {
                            alert("Select a quarter to remove data.");
                            return prev;
                        }
                        const lastIndex = newQEvents.findLastIndex(ev => ev.zoneId === zone.id && ev.type === type);
                        if (lastIndex !== -1) newQEvents.splice(lastIndex, 1);
                    }

                    return { ...prev, [selectedQuarter]: newQEvents };
                });
                setHasUnsavedChanges(true);
            };

            if (isCorrectionMode) {
                updateLocalState(type, 'remove');
            } else {
                updateLocalState(type, 'add');
            }
            return;
        }

        // ... EXISTING LIVE MODE LOGIC ...
        if (viewMode !== 'standard') {
            alert("Please switch to 'Standard' view to add or correct data.");
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const rectY = e.clientY - rect.top;
        const isTop = rectY < rect.height / 2;
        const type = isTop ? 'oppPossession' : 'teamPressure';

        if (isCorrectionMode) {
            if (['summary', 'firstHalf', 'secondHalf'].includes(selectedQuarter)) {
                alert("Please select specific quarter to correct data.");
                return;
            }
            removeHeatMapEvent(selectedQuarter, zone.id, type);
        } else {
            if (['summary', 'firstHalf', 'secondHalf'].includes(selectedQuarter)) {
                alert("Please select a specific Quarter (Q1-Q4) to add data.");
                return;
            }
            addHeatMapEvent(selectedQuarter, {
                id: Date.now(),
                zoneId: zone.id,
                type: type,
                timestamp: Date.now()
            });
        }
    };

    const handleLocalUndo = () => {
        if (!viewedMatchId || !isEditable) return;
        if (selectedQuarter === 'summary') return;

        setViewedHeatMapEvents(prev => {
            const currentQEvents = prev[selectedQuarter] || [];
            if (currentQEvents.length === 0) return prev;

            const newQEvents = [...currentQEvents];
            newQEvents.pop(); // Remove last
            return { ...prev, [selectedQuarter]: newQEvents };
        });
        setHasUnsavedChanges(true);
    };

    const exportCSV = () => {
        const rows = [['Quarter', 'Zone', 'Type', 'Timestamp']];
        ['q1', 'q2', 'q3', 'q4'].forEach(q => {
            const evts = activeData[q] || [];
            evts.forEach(e => {
                rows.push([q.toUpperCase(), e.zoneId, e.type, new Date(e.timestamp).toISOString()]);
            });
        });

        const csvContent = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `heatmap_data_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const importCSV = (e) => {
        if (viewedMatchId) { alert("Cannot import into a viewed match."); return; }
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split('\n');
            const newEvents = { q1: [], q2: [], q3: [], q4: [] };
            lines.slice(1).forEach(line => {
                const cols = line.split(',');
                if (cols.length < 4) return;
                const q = cols[0].toLowerCase();
                const zoneId = cols[1];
                const type = cols[2];
                const timestamp = new Date(cols[3]).getTime();

                if (newEvents[q]) {
                    newEvents[q].push({ id: timestamp + Math.random(), zoneId, type, timestamp });
                }
            });

            alert("Importing... existing data will be merged (locally for session).");
            Object.keys(newEvents).forEach(q => {
                newEvents[q].forEach(evt => addHeatMapEvent(q, evt));
            });
        };
        reader.readAsText(file);
    };

    const generatePDF = () => {
        const element = document.getElementById('heatmap-pdf-report');
        element.style.display = 'block';
        // Fix for Match Name
        const title = matchInfo.homeTeam && matchInfo.awayTeam
            ? `${matchInfo.homeTeam} vs ${matchInfo.awayTeam}`
            : 'Match Report';

        const opt = {
            margin: [10, 10, 10, 10], // top, left, bottom, right
            filename: `HeatMap_Report_${title.replace(/ /g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            element.style.display = 'none';
        });
    };


    const totalOppPossession = getEventsForQuarter('summary').filter(e => e && e.type === 'oppPossession').length;
    const totalTeamPressure = getEventsForQuarter('summary').filter(e => e && e.type === 'teamPressure').length;

    const getDisplayZones = (modeOverride) => {
        const mode = modeOverride || viewMode;
        if (mode === 'lines') return [
            { id: 'l_0', label: 'Full Back Line', subZoneIds: ['z_0_0', 'z_0_1', 'z_0_2'] },
            { id: 'l_1', label: 'Half Back Line', subZoneIds: ['z_1_0', 'z_1_1', 'z_1_2'] },
            { id: 'l_2', label: 'Midfield', subZoneIds: ['z_2_0', 'z_2_1', 'z_2_2'] },
            { id: 'l_3', label: 'Half Forward Line', subZoneIds: ['z_3_0', 'z_3_1', 'z_3_2'] },
            { id: 'l_4', label: 'Full Forward Line', subZoneIds: ['z_4_0', 'z_4_1', 'z_4_2'] }
        ];
        if (mode === 'sectors') return [
            { id: 's_def', label: 'Defensive Zone', subZoneIds: ['z_0_0', 'z_0_1', 'z_0_2', 'z_1_0', 'z_1_1', 'z_1_2'] },
            { id: 's_mid', label: 'Midfield Zone', subZoneIds: ['z_2_0', 'z_2_1', 'z_2_2'] },
            { id: 's_fwd', label: 'Forward Zone', subZoneIds: ['z_3_0', 'z_3_1', 'z_3_2', 'z_4_0', 'z_4_1', 'z_4_2'] }
        ];
        // Standard
        const std = [];
        const ZN = [['Left Corner Back', 'Full Back', 'Right Corner Back'], ['Left Half Back', 'Centre Back', 'Right Half Back'], ['Centre Left', 'Centre', 'Centre Right'], ['Left Half Forward', 'Centre Forward', 'Right Half Forward'], ['Left Corner Forward', 'Full Forward', 'Right Corner Forward']];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                std.push({ id: `z_${i}_${j}`, label: ZN[i][j], subZoneIds: [`z_${i}_${j}`] });
            }
        }
        return std;
    };

    // For screen table, use current viewMode
    const tableZones = getDisplayZones();

    const renderTable = (quarter, title, modeOverride) => {
        const zones = getDisplayZones(modeOverride);
        const effectiveMode = modeOverride || viewMode;
        let qTotalOpp = 0;
        let qTotalPress = 0;

        return (
            <div style={{ marginBottom: '10px', fontSize: '0.7rem' }}>
                {title && <h5 style={{ textAlign: 'center', margin: '2px 0' }}>{title}</h5>}
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                    <thead>
                        <tr style={{ background: '#f0f0f0' }}>
                            <th style={{ padding: '4px', border: '1px solid #ccc', textAlign: 'left' }}>Zone</th>
                            <th style={{ padding: '4px', border: '1px solid #ccc' }}>Opp</th>
                            <th style={{ padding: '4px', border: '1px solid #ccc' }}>Press</th>
                            <th style={{ padding: '4px', border: '1px solid #ccc' }}>Net</th>
                            <th style={{ padding: '4px', border: '1px solid #ccc' }}>% Press</th>
                        </tr>
                    </thead>
                    <tbody>
                        {zones.map((zone) => {
                            let counts;
                            // Special Logic for Full Zone Analysis (Sectors) with Side Switching
                            if (effectiveMode === 'sectors' && quarter === 'summary') {
                                // Define SubZone Groups
                                const defZones = ['z_0_0', 'z_0_1', 'z_0_2', 'z_1_0', 'z_1_1', 'z_1_2'];
                                const fwdZones = ['z_3_0', 'z_3_1', 'z_3_2', 'z_4_0', 'z_4_1', 'z_4_2'];
                                const midZones = ['z_2_0', 'z_2_1', 'z_2_2'];

                                const bucketCounts = (qData, targetZones) => {
                                    const evs = qData || [];
                                    const relevant = evs.filter(e => e && targetZones.includes(e.zoneId));
                                    return {
                                        opp: relevant.filter(e => e && e.type === 'oppPossession').length,
                                        press: relevant.filter(e => e && e.type === 'teamPressure').length
                                    };
                                };

                                const q1 = activeData.q1 || [];
                                const q2 = activeData.q2 || [];
                                const q3 = activeData.q3 || [];
                                const q4 = activeData.q4 || [];
                                const h1 = [...q1, ...q2];
                                const h2 = [...q3, ...q4];

                                let c1 = { opp: 0, press: 0 };
                                let c2 = { opp: 0, press: 0 };

                                if (zone.id === 's_def') {
                                    // H1: Def Zones, H2: Fwd Zones (physically furthest due to switch)
                                    c1 = bucketCounts(h1, defZones);
                                    c2 = bucketCounts(h2, fwdZones);
                                } else if (zone.id === 's_fwd') {
                                    // H1: Fwd Zones, H2: Def Zones
                                    c1 = bucketCounts(h1, fwdZones);
                                    c2 = bucketCounts(h2, defZones);
                                } else {
                                    // Midfield - Always Mid
                                    c1 = bucketCounts(h1, midZones);
                                    c2 = bucketCounts(h2, midZones);
                                }
                                counts = { oppPossession: c1.opp + c2.opp, teamPressure: c1.press + c2.press };
                            } else {
                                counts = getActiveZoneCounts(zone.subZoneIds, quarter);
                            }

                            qTotalOpp += counts.oppPossession;
                            qTotalPress += counts.teamPressure;
                            const net = counts.oppPossession - counts.teamPressure;
                            const percentVal = counts.oppPossession > 0
                                ? (counts.teamPressure / counts.oppPossession) * 100
                                : (counts.teamPressure > 0 ? 100 : 0);

                            const percent = counts.oppPossession > 0
                                ? Math.round((counts.teamPressure / counts.oppPossession) * 100) + '%'
                                : '-';

                            // Color Logic
                            let color = '#000'; // Default black for PDF
                            if (percentVal > 55) color = '#4caf50'; // Green
                            else if (percentVal >= 45) color = '#ffa000'; // Darker Amber for text visibility
                            else if (counts.oppPossession > 0) color = '#f44336'; // Red

                            return (
                                <tr key={zone.id}>
                                    <td style={{ padding: '3px', border: '1px solid #ccc' }}>{zone.label}</td>
                                    <td style={{ padding: '3px', border: '1px solid #ccc', textAlign: 'center' }}>{counts.oppPossession}</td>
                                    <td style={{ padding: '3px', border: '1px solid #ccc', textAlign: 'center' }}>{counts.teamPressure}</td>
                                    <td style={{ padding: '3px', border: '1px solid #ccc', textAlign: 'center', fontWeight: 'bold' }}>{net > 0 ? `+${net}` : net}</td>
                                    <td style={{ padding: '3px', border: '1px solid #ccc', textAlign: 'center', color: color, fontWeight: 'bold' }}>{percent}</td>
                                </tr>
                            );
                        })}
                        <tr style={{ background: '#eee', fontWeight: 'bold' }}>
                            <td style={{ padding: '3px', border: '1px solid #ccc' }}>TOTAL</td>
                            <td style={{ padding: '3px', border: '1px solid #ccc', textAlign: 'center' }}>{qTotalOpp}</td>
                            <td style={{ padding: '3px', border: '1px solid #ccc', textAlign: 'center' }}>{qTotalPress}</td>
                            <td style={{ padding: '3px', border: '1px solid #ccc', textAlign: 'center' }}>{qTotalOpp - qTotalPress}</td>
                            <td style={{ padding: '3px', border: '1px solid #ccc', textAlign: 'center' }}>
                                {qTotalOpp > 0 ? Math.round((qTotalPress / qTotalOpp) * 100) + '%' : '-'}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div style={{ padding: '20px', paddingBottom: '90px', color: '#fff' }}>
            {/* ... Header and Controls ... */}
            <div style={{ marginBottom: '20px', backgroundColor: '#2d2d2d', padding: '15px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h2 style={{ color: '#bb86fc', margin: 0 }}>Heat Map Analysis</h2>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button onClick={generatePDF} title="Download Report PDF" style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '5px' }}>
                            <FileText size={20} />
                        </button>
                        <button onClick={exportCSV} title="Export CSV" style={{ background: 'none', border: 'none', color: '#2196f3', cursor: 'pointer', padding: '5px' }}>
                            <FileUp size={20} />
                        </button>
                        <label style={{ cursor: 'pointer', color: '#9c27b0', padding: '5px' }} title="Import CSV">
                            <FileDown size={20} />
                            <input type="file" accept=".csv" onChange={importCSV} style={{ display: 'none' }} />
                        </label>
                    </div>
                </div>

                <select
                    value={viewedMatchId}
                    onChange={handleMatchSelect}
                    style={{ width: '100%', padding: '8px', backgroundColor: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
                >
                    <option value="__default__">-- Select Match to View --</option>
                    <option value="">Live Analysis</option>
                    {availableMatches.map(m => (
                        <option key={m.id} value={m.id}>
                            {m.homeTeam} vs {m.awayTeam} ({m.date})
                        </option>
                    ))}
                </select>

                {viewedMatchId && (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ color: '#ffb74d', fontSize: '0.8rem' }}>Viewing Historical Data</div>

                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setIsEditable(!isEditable)}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: isEditable ? '#bb86fc' : '#444',
                                    color: isEditable ? '#000' : '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                {isEditable ? <Unlock size={14} /> : <Lock size={14} />}
                                {isEditable ? 'Editing Unlocked' : 'Unlock Editing'}
                            </button>

                            {isEditable && (
                                <button
                                    onClick={saveToFirebase}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: hasUnsavedChanges ? '#4caf50' : '#444',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer',
                                        opacity: hasUnsavedChanges ? 1 : 0.7
                                    }}
                                >
                                    <Save size={14} />
                                    {hasUnsavedChanges ? 'Sync Changes *' : 'Sync Data'}
                                </button>
                            )}
                        </div>

                    </div>
                )}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Right Aligned Controls Group */}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {/* Goal Direction Control (Moved here) */}
                        {(isLive || isEditable) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginRight: '10px' }}>
                                <button
                                    onClick={() => handleGoalDirectionChange('left')}
                                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #555', backgroundColor: (viewedMatchId ? viewedMatchInfo?.homeGoalDirection : matchInfo.homeGoalDirection) === 'left' ? '#4caf50' : 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
                                    title="Home Goal Left"
                                >
                                    &larr; HG
                                </button>
                                <button
                                    onClick={() => handleGoalDirectionChange('right')}
                                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #555', backgroundColor: (viewedMatchId ? viewedMatchInfo?.homeGoalDirection : matchInfo.homeGoalDirection) === 'right' ? '#4caf50' : 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
                                    title="Home Goal Right"
                                >
                                    HG &rarr;
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => setIsCorrectionMode(!isCorrectionMode)}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: isCorrectionMode ? '#cf6679' : '#333',
                                color: '#fff',
                                border: isCorrectionMode ? '1px solid #ff4444' : '1px solid #555',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            <Trash2 size={14} /> {isCorrectionMode ? 'Correction ON' : 'Correction'}
                        </button>

                        {selectedQuarter !== 'summary' && (
                            <button
                                onClick={() => viewedMatchId ? handleLocalUndo() : undoHeatMapEvent(selectedQuarter)}
                                disabled={viewedMatchId && !isEditable}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#444',
                                    color: (viewedMatchId && !isEditable) ? '#666' : '#b0b0b0',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    cursor: (viewedMatchId && !isEditable) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <RotateCcw size={14} /> Undo Last
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quarter Selector */}
            <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
                {PRESET_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSelectedQuarter(tab.id)}
                        style={{
                            flex: 1,
                            padding: '10px',
                            backgroundColor: selectedQuarter === tab.id ? (['summary', 'firstHalf', 'secondHalf'].includes(tab.id) ? '#03dac6' : '#bb86fc') : '#2d2d2d',
                            color: selectedQuarter === tab.id ? '#000' : '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            minWidth: '60px'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '20px', backgroundColor: '#2d2d2d', padding: '10px', borderRadius: '8px', justifyContent: 'center', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: viewMode === 'standard' ? '#bb86fc' : '#b0b0b0' }}>
                    <input type="radio" name="viewMode" value="standard" checked={viewMode === 'standard'} onChange={() => setViewMode('standard')} />
                    <Grid size={16} /> Standard
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: viewMode === 'lines' ? '#bb86fc' : '#b0b0b0' }}>
                    <input type="radio" name="viewMode" value="lines" checked={viewMode === 'lines'} onChange={() => setViewMode('lines')} />
                    <Columns size={16} /> Half Zones
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: viewMode === 'sectors' ? '#bb86fc' : '#b0b0b0' }}>
                    <input type="radio" name="viewMode" value="sectors" checked={viewMode === 'sectors'} onChange={() => setViewMode('sectors')} />
                    <Square size={16} /> Full Zones
                </label>
            </div>

            {/* PITCH IN APP - Resizable */}
            {/* CHANGED: Increased max-width to 1200px (2x prev 600px) */}
            {/* PITCH IN APP - Resizable - HIDDEN ON SUMMARY */}
            {selectedQuarter !== 'summary' && (
                <div style={{ width: '100%', overflowX: 'auto', marginBottom: '30px' }}>
                    <HeatMapPitch
                        events={currentEvents}
                        viewMode={viewMode}
                        onClick={handleZoneClick}
                        showNumbers={true} // ALWAYS SHOW NUMBERS NOW
                        isCorrectionMode={isCorrectionMode}
                        showHeatColor={['firstHalf', 'secondHalf'].includes(selectedQuarter)} // Only show heat color for halves, not individual quarters
                        // User said "In 1st Half and 2nd Half Tabs I want teh Heat Map aplied" -> implication: show heat/percentage color on halves too?
                        // Let's enable heat color for summary AND halves.
                        usePercentageColor={true}
                        // Wait, showHeatColor prop handles visibility. 
                        onHover={setHoveredZoneId}
                        hoveredZoneId={hoveredZoneId}
                        width="100%"   // Use full width of container
                        style={{ maxWidth: '1200px', margin: '0 auto', aspectRatio: '400/250' }} // Doubled size limit
                        idSuffix="_main"

                        homeGoalSide={getAdjustedDirection(viewedMatchId ? (viewedMatchInfo?.homeGoalDirection || 'left') : matchInfo.homeGoalDirection, selectedQuarter)}
                        homeTeamName={viewedMatchId ? (viewedMatchInfo?.homeTeam || 'Unknown') : matchInfo.homeTeam}
                        awayTeamName={viewedMatchId ? (viewedMatchInfo?.awayTeam || 'Unknown') : matchInfo.awayTeam}
                    />
                </div>
            )}

            <div style={{ marginTop: '0px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', gap: '20px', fontSize: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {/* Legend */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#ff6b6b', borderRadius: '50%' }}></div>
                        <span>Opp. Poss</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#4caf50', borderRadius: '50%' }}></div>
                        <span>Pressure</span>
                    </div>
                    {selectedQuarter === 'summary' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(255, 0, 0, 0.5)', border: '1px solid white' }}></div>
                            <span>Red Zone: High Unpressured Poss</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden PDF Report Container */}
            <div id="heatmap-pdf-report" style={{ display: 'none', padding: '20px', background: 'white', color: 'black' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Match HeatMap Report</h1>
                <h3 style={{ textAlign: 'center', marginBottom: '30px' }}>
                    {viewedMatchId ? (viewedMatchInfo?.homeTeam || 'Unknown') : matchInfo.homeTeam} vs {viewedMatchId ? (viewedMatchInfo?.awayTeam || 'Unknown') : matchInfo.awayTeam} ({viewedMatchId ? (viewedMatchInfo?.date || '') : matchInfo.date})
                </h3>

                {/* PAGE 1: MATCH DETAILS, 1ST HALF & 2ND HALF PITCHES */}
                {/* PAGE 1: FULL MATCH SUMMARY STATS */}
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ textAlign: 'center', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>Full Match Summary</h2>
                    {renderTable('summary', null, 'standard')}
                </div>

                <div style={{ marginTop: '40px', marginBottom: '20px' }}>
                    <h2 style={{ textAlign: 'center', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>3 (Defence, Midfield, Forwards) zone summary</h2>
                    <div style={{ marginTop: '20px' }}>
                        {renderTable('summary', null, 'sectors')}
                    </div>
                </div>

                {/* PAGE 2: 1ST HALF ANALYSIS */}
                <div style={{ pageBreakBefore: 'always', marginBottom: '20px' }}>
                    <h3 style={{ textAlign: 'center' }}>1st Half Analysis</h3>
                    <div style={{ border: '1px solid #ccc', padding: '10px', width: '90%', margin: '0 auto 20px auto' }}>
                        <HeatMapPitch
                            events={getEventsForQuarter('firstHalf')}
                            viewMode='standard'
                            showNumbers={true}
                            showHeatColor={true}
                            usePercentageColor={true}
                            width="100%"
                            idSuffix="_pdf_h1"
                            homeGoalSide={viewedMatchId ? (viewedMatchInfo?.homeGoalDirection || 'left') : matchInfo.homeGoalDirection}
                            homeTeamName={viewedMatchId ? (viewedMatchInfo?.homeTeam || 'Unknown') : matchInfo.homeTeam}
                            awayTeamName={viewedMatchId ? (viewedMatchInfo?.awayTeam || 'Unknown') : matchInfo.awayTeam}
                        />
                    </div>
                    {renderTable('firstHalf', '1st Half Statistics', 'standard')}
                </div>

                {/* PAGE 3: 2ND HALF ANALYSIS */}
                <div style={{ pageBreakBefore: 'always', marginBottom: '20px' }}>
                    <h3 style={{ textAlign: 'center' }}>2nd Half Analysis</h3>
                    <div style={{ border: '1px solid #ccc', padding: '10px', width: '90%', margin: '0 auto 20px auto' }}>
                        <HeatMapPitch
                            events={getEventsForQuarter('secondHalf')}
                            viewMode='standard'
                            showNumbers={true}
                            showHeatColor={true}
                            usePercentageColor={true}
                            width="100%"
                            idSuffix="_pdf_h2"
                            homeGoalSide={getAdjustedDirection(viewedMatchId ? (viewedMatchInfo?.homeGoalDirection || 'left') : matchInfo.homeGoalDirection, 'secondHalf')}
                            homeTeamName={viewedMatchId ? (viewedMatchInfo?.homeTeam || 'Unknown') : matchInfo.homeTeam}

                            awayTeamName={viewedMatchId ? (viewedMatchInfo?.awayTeam || 'Unknown') : matchInfo.awayTeam}
                        />
                    </div>
                    {renderTable('secondHalf', '2nd Half Statistics', 'standard')}
                </div>

                {/* PAGE 2: HALF ZONES MAP + TABLE */}
                {/* PAGE 4: 1ST HALF ZONE ANALYSIS */}
                <div style={{ pageBreakBefore: 'always', marginTop: '20px' }}>
                    <h2 style={{ textAlign: 'center', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>1st Half - 5 Zone Analysis</h2>
                    <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px', width: '90%', margin: '0 auto 20px auto' }}>
                        <HeatMapPitch
                            events={getEventsForQuarter('firstHalf')}
                            viewMode='lines'
                            showNumbers={true}
                            showHeatColor={true}
                            usePercentageColor={true}
                            width="100%"
                            idSuffix="_pdf_lines_h1"
                            homeGoalSide={viewedMatchId ? (viewedMatchInfo?.homeGoalDirection || 'left') : matchInfo.homeGoalDirection}
                            homeTeamName={viewedMatchId ? (viewedMatchInfo?.homeTeam || 'Unknown') : matchInfo.homeTeam}
                            awayTeamName={viewedMatchId ? (viewedMatchInfo?.awayTeam || 'Unknown') : matchInfo.awayTeam}
                        />
                    </div>
                    {renderTable('firstHalf', '1st Half Zone Statistics', 'lines')}
                </div>

                {/* PAGE 5: 2ND HALF ZONE ANALYSIS */}
                <div style={{ pageBreakBefore: 'always', marginTop: '20px' }}>
                    <h2 style={{ textAlign: 'center', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>2nd Half - 5 Zone Analysis</h2>
                    <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px', width: '90%', margin: '0 auto 20px auto' }}>
                        <HeatMapPitch
                            events={getEventsForQuarter('secondHalf')}
                            viewMode='lines'
                            showNumbers={true}
                            showHeatColor={true}
                            usePercentageColor={true}
                            width="100%"
                            idSuffix="_pdf_lines_h2"
                            homeGoalSide={getAdjustedDirection(viewedMatchId ? (viewedMatchInfo?.homeGoalDirection || 'left') : matchInfo.homeGoalDirection, 'secondHalf')}
                            homeTeamName={viewedMatchId ? (viewedMatchInfo?.homeTeam || 'Unknown') : matchInfo.homeTeam}
                            awayTeamName={viewedMatchId ? (viewedMatchInfo?.awayTeam || 'Unknown') : matchInfo.awayTeam}
                        />
                    </div>
                    {renderTable('secondHalf', '2nd Half Zone Statistics', 'lines')}
                </div>



                {/* PAGE 4: QUARTER GRIDS */}
                <div style={{ pageBreakBefore: 'always', marginTop: '20px' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Quarter Breakdown</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        {['q1', 'q2', 'q3', 'q4'].map(q => (
                            <div key={q} style={{ width: '48%', marginBottom: '20px', pageBreakInside: 'avoid' }}>
                                <h4 style={{ textAlign: 'center', textTransform: 'uppercase', marginBottom: '5px' }}>{q}</h4>
                                <div style={{ border: '1px solid #ccc' }}>
                                    <HeatMapPitch
                                        events={getEventsForQuarter(q)}
                                        viewMode='standard'
                                        showNumbers={true}
                                        showHeatColor={false}
                                        width="100%"
                                        idSuffix={`_${q}`}

                                        homeGoalSide={getAdjustedDirection(viewedMatchId ? (viewedMatchInfo?.homeGoalDirection || 'left') : matchInfo.homeGoalDirection, q)}
                                        homeTeamName={viewedMatchId ? (viewedMatchInfo?.homeTeam || 'Unknown') : matchInfo.homeTeam}
                                        awayTeamName={viewedMatchId ? (viewedMatchInfo?.awayTeam || 'Unknown') : matchInfo.awayTeam}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* NEW: QUARTERLY PLAYER STATS TABLES (Q1-Q4) */}
                {['q1', 'q2', 'q3', 'q4'].map(quarter => (
                    <div key={`stats-${quarter}`} style={{ pageBreakBefore: 'always', paddingTop: '60px' }}>
                        <h2 style={{ textAlign: 'center', borderBottom: '2px solid #ccc', paddingBottom: '10px', textTransform: 'uppercase' }}>
                            {quarter} Player Stats
                        </h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginTop: '20px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #000', backgroundColor: '#f0f0f0' }}>
                                    <th style={{ textAlign: 'left', padding: '8px' }}>Player Name</th>
                                    <th style={{ textAlign: 'center', padding: '8px' }}>Minutes</th>
                                    <th style={{ textAlign: 'center', padding: '8px' }}>Pressures</th>
                                    <th style={{ textAlign: 'center', padding: '8px' }}>Free Conceded</th>
                                    <th style={{ textAlign: 'center', padding: '8px' }}>Turnovers Won</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activePlayerStats.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>No player stats recorded.</td></tr>
                                ) : (
                                    activePlayerStats.map(stat => {
                                        const s = stat.quarters?.[quarter] || {};
                                        // Only show players who have data for this quarter? Or all?
                                        // Let's show all for consistency, or maybe filter out empty rows? 
                                        // User request implies full tables. Let's keep all rows.
                                        const mins = parseInt(s.minutes) || 0;
                                        const press = s.pressures || 0;
                                        const free = s.freeConceded || 0;
                                        const turn = s.turnovers || 0;

                                        return (
                                            <tr key={stat.id} style={{ borderBottom: '1px solid #ccc' }}>
                                                <td style={{ padding: '8px', fontWeight: 'bold' }}>{stat.name}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{mins}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{press}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{free}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{turn}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                            <tfoot>
                                {(() => {
                                    let tMins = 0, tPress = 0, tFree = 0, tTurn = 0;
                                    activePlayerStats.forEach(stat => {
                                        const s = stat.quarters?.[quarter] || {};
                                        tMins += (parseInt(s.minutes) || 0);
                                        tPress += (s.pressures || 0);
                                        tFree += (s.freeConceded || 0);
                                        tTurn += (s.turnovers || 0);
                                    });
                                    return (
                                        <tr style={{ backgroundColor: '#e0e0e0', fontWeight: 'bold', borderTop: '2px solid #000' }}>
                                            <td style={{ padding: '8px' }}>TOTALS</td>
                                            <td style={{ padding: '8px', textAlign: 'center' }}>{tMins}</td>
                                            <td style={{ padding: '8px', textAlign: 'center' }}>{tPress}</td>
                                            <td style={{ padding: '8px', textAlign: 'center' }}>{tFree}</td>
                                            <td style={{ padding: '8px', textAlign: 'center' }}>{tTurn}</td>
                                        </tr>
                                    );
                                })()}
                            </tfoot>
                        </table>
                    </div>
                ))}

                {/* PAGE 5: FULL MATCH PLAYER SUMMARY STATS */}
                <div style={{ pageBreakBefore: 'always', paddingTop: '60px' }}>
                    <h2 style={{ textAlign: 'center', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>Full Match Player Summary Stats</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginTop: '20px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #000', backgroundColor: '#f0f0f0' }}>
                                <th style={{ textAlign: 'left', padding: '8px' }}>Player Name</th>
                                <th style={{ textAlign: 'center', padding: '8px' }}>Total Minutes</th>
                                <th style={{ textAlign: 'center', padding: '8px' }}>Total Pressures</th>
                                <th style={{ textAlign: 'center', padding: '8px' }}>Total Free Conceded</th>
                                <th style={{ textAlign: 'center', padding: '8px' }}>Total Turnovers Won</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activePlayerStats.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>No player stats recorded.</td></tr>
                            ) : (
                                activePlayerStats.map(stat => {
                                    const qs = stat.quarters || {};
                                    let dPress = 0, dFree = 0, dTurn = 0, dMins = 0;
                                    const oldPress = stat.quarters ? 0 : (stat.pressures || 0);

                                    ['q1', 'q2', 'q3', 'q4'].forEach(q => {
                                        const s = qs[q] || {};
                                        dPress += (s.pressures || 0);
                                        dFree += (s.freeConceded || 0);
                                        dTurn += (s.turnovers || 0);
                                        dMins += (parseInt(s.minutes) || 0);
                                    });
                                    dPress += oldPress;

                                    return (
                                        <tr key={stat.id} style={{ borderBottom: '1px solid #ccc' }}>
                                            <td style={{ padding: '8px', fontWeight: 'bold' }}>{stat.name}</td>
                                            <td style={{ padding: '8px', textAlign: 'center' }}>{dMins}</td>
                                            <td style={{ padding: '8px', textAlign: 'center' }}>{dPress}</td>
                                            <td style={{ padding: '8px', textAlign: 'center' }}>{dFree}</td>
                                            <td style={{ padding: '8px', textAlign: 'center' }}>{dTurn}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                        <tfoot>
                            {(() => {
                                let tMins = 0, tPress = 0, tFree = 0, tTurn = 0;
                                activePlayerStats.forEach(stat => {
                                    const qs = stat.quarters || {};
                                    const oldPress = stat.quarters ? 0 : (stat.pressures || 0);
                                    ['q1', 'q2', 'q3', 'q4'].forEach(q => {
                                        const s = qs[q] || {};
                                        tPress += (s.pressures || 0);
                                        tFree += (s.freeConceded || 0);
                                        tTurn += (s.turnovers || 0);
                                        tMins += (parseInt(s.minutes) || 0);
                                    });
                                    tPress += oldPress;
                                });
                                return (
                                    <tr style={{ backgroundColor: '#e0e0e0', fontWeight: 'bold', borderTop: '2px solid #000' }}>
                                        <td style={{ padding: '8px' }}>TOTALS</td>
                                        <td style={{ padding: '8px', textAlign: 'center' }}>{tMins}</td>
                                        <td style={{ padding: '8px', textAlign: 'center' }}>{tPress}</td>
                                        <td style={{ padding: '8px', textAlign: 'center' }}>{tFree}</td>
                                        <td style={{ padding: '8px', textAlign: 'center' }}>{tTurn}</td>
                                    </tr>
                                );
                            })()}
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Results Table (Screen) - Unchanged */}
            <div style={{ overflowX: 'auto', maxWidth: '600px', margin: '0 auto' }}>
                <h3 style={{ color: '#03dac6', marginBottom: '10px', fontSize: '1rem', textAlign: 'center' }}>
                    {PRESET_TABS.find(t => t.id === selectedQuarter)?.label} Statistics ({viewMode})
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#2d2d2d', color: '#b0b0b0' }}>
                            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #444' }}>Zone</th>
                            <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #444', color: '#ff6b6b' }}>Opp Poss</th>
                            <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #444', color: '#4caf50' }}>Team Press</th>
                            <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #444', color: '#fff' }}>Net</th>
                            <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #444', color: '#ffd700' }}>% Press</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableZones.map((zone) => {
                            let counts;
                            // Special Logic for Full Zone Analysis (Sectors) with Side Switching
                            if (viewMode === 'sectors' && selectedQuarter === 'summary') {
                                // Define SubZone Groups
                                const defZones = ['z_0_0', 'z_0_1', 'z_0_2', 'z_1_0', 'z_1_1', 'z_1_2'];
                                const fwdZones = ['z_3_0', 'z_3_1', 'z_3_2', 'z_4_0', 'z_4_1', 'z_4_2'];
                                const midZones = ['z_2_0', 'z_2_1', 'z_2_2'];

                                const bucketCounts = (qData, targetZones) => {
                                    const evs = qData || [];
                                    const relevant = evs.filter(e => e && targetZones.includes(e.zoneId));
                                    return {
                                        opp: relevant.filter(e => e && e.type === 'oppPossession').length,
                                        press: relevant.filter(e => e && e.type === 'teamPressure').length
                                    };
                                };

                                const q1 = activeData.q1 || [];
                                const q2 = activeData.q2 || [];
                                const q3 = activeData.q3 || [];
                                const q4 = activeData.q4 || [];
                                const h1 = [...q1, ...q2];
                                const h2 = [...q3, ...q4];

                                let c1 = { opp: 0, press: 0 };
                                let c2 = { opp: 0, press: 0 };

                                if (zone.id === 's_def') {
                                    // H1: Def Zones, H2: Fwd Zones (physically furthest due to switch)
                                    c1 = bucketCounts(h1, defZones);
                                    c2 = bucketCounts(h2, fwdZones);
                                } else if (zone.id === 's_fwd') {
                                    // H1: Fwd Zones, H2: Def Zones
                                    c1 = bucketCounts(h1, fwdZones);
                                    c2 = bucketCounts(h2, defZones);
                                } else {
                                    // Midfield - Always Mid
                                    c1 = bucketCounts(h1, midZones);
                                    c2 = bucketCounts(h2, midZones);
                                }
                                counts = { oppPossession: c1.opp + c2.opp, teamPressure: c1.press + c2.press };
                            } else {
                                counts = getActiveZoneCounts(zone.subZoneIds);
                            }
                            const net = counts.oppPossession - counts.teamPressure;
                            const percentVal = counts.oppPossession > 0
                                ? (counts.teamPressure / counts.oppPossession) * 100
                                : (counts.teamPressure > 0 ? 100 : 0);

                            const percent = counts.oppPossession > 0
                                ? Math.round((counts.teamPressure / counts.oppPossession) * 100) + '%'
                                : '-';

                            // Color Logic
                            let color = '#ffd700'; // Default gold
                            if (percentVal > 55) color = '#4caf50'; // Green
                            else if (percentVal >= 45) color = '#ffc107'; // Amber (lighter for dark theme)
                            else if (counts.oppPossession > 0) color = '#ff6b6b'; // Red

                            return (
                                <tr key={zone.id} style={{ borderBottom: '1px solid #333' }}>
                                    <td style={{ padding: '8px', color: '#fff' }}>{zone.label}</td>
                                    <td style={{ padding: '8px', textAlign: 'center', backgroundColor: counts.oppPossession > 0 ? 'rgba(255, 107, 107, 0.1)' : 'transparent' }}>{counts.oppPossession}</td>
                                    <td style={{ padding: '8px', textAlign: 'center', backgroundColor: counts.teamPressure > 0 ? 'rgba(76, 175, 80, 0.1)' : 'transparent' }}>{counts.teamPressure}</td>
                                    <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: net > 0 ? '#ff6b6b' : (net < 0 ? '#4caf50' : '#888') }}>{net > 0 ? `+${net}` : net}</td>
                                    <td style={{ padding: '8px', textAlign: 'center', color: color }}>{percent}</td>
                                </tr>
                            );
                        })}
                        {(() => {
                            // Calculate Totals dynamically based on selected tabs
                            const currentOpp = currentEvents.filter(e => e && e.type === 'oppPossession').length;
                            const currentPress = currentEvents.filter(e => e && e.type === 'teamPressure').length;
                            return (
                                <tr style={{ backgroundColor: '#2d2d2d', fontWeight: 'bold' }}>
                                    <td style={{ padding: '8px', color: '#fff' }}>TOTAL</td>
                                    <td style={{ padding: '8px', textAlign: 'center', color: '#ff6b6b' }}>{currentOpp}</td>
                                    <td style={{ padding: '8px', textAlign: 'center', color: '#4caf50' }}>{currentPress}</td>
                                    <td style={{ padding: '8px', textAlign: 'center', color: '#fff' }}>{currentOpp - currentPress}</td>
                                    <td style={{ padding: '8px', textAlign: 'center', color: '#ffd700' }}>
                                        {currentOpp > 0 ? Math.round((currentPress / currentOpp) * 100) + '%' : '-'}
                                    </td>
                                </tr>
                            );
                        })()}
                    </tbody>
                </table>
            </div>

            {/* PLAYER PRESSURE STATS TABLE */}
            <div style={{
                marginTop: '30px',
                backgroundColor: '#1e1e1e',
                borderRadius: '8px',
                padding: '15px',
                border: '1px solid #333',
                maxWidth: '800px',
                margin: '30px auto 0 auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ margin: 0, color: '#bb86fc', fontSize: '1rem', textTransform: 'uppercase' }}>
                        Player Pressure Stats
                    </h3>



                    {!['summary', 'firstHalf', 'secondHalf'].includes(selectedQuarter) && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={handleResetPlayerStats} disabled={viewedMatchId && !isEditable} style={{ backgroundColor: '#cf6679', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><RefreshCw size={14} /> Reset</button>
                            <label style={{ backgroundColor: '#444', color: 'white', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Upload size={14} /> Import
                                <input type="file" accept=".csv" onChange={handlePlayerStatsImport} style={{ display: 'none' }} disabled={viewedMatchId && !isEditable} />
                            </label>
                            <button onClick={handlePlayerStatsExport} style={{ backgroundColor: '#03dac6', color: 'black', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Download size={14} /> Export</button>
                        </div>
                    )}
                </div>

                {/* Add Player Control */}
                {(!['summary', 'firstHalf', 'secondHalf'].includes(selectedQuarter)) && (isLive || isEditable || !viewedMatchId) && (
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #333', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <select
                                value={selectedSquadId}
                                onChange={(e) => setSelectedSquadId(e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', backgroundColor: '#2d2d2d', color: '#b0b0b0', border: '1px solid #444', marginBottom: '5px' }}
                            >
                                <option value="">-- Filter by Squad (Optional) --</option>
                                {squads.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>

                            <select
                                value=""
                                onChange={(e) => {
                                    if (e.target.value) {
                                        setNewPlayerName(e.target.value);
                                        // Auto-add immediate effect
                                        // We need to call a function locally because handleAddPlayer relies on state 'newPlayerName' which might not be updated yet?
                                        // Actually batching might delay it. Best to call a modified handleAddPlayer(name) or useEffect.
                                        // Let's just set name and then auto-trigger? 
                                        // Issue: State update is async. 
                                        // Refactor: handleAddPlayer to accept optional name.
                                        setTimeout(() => document.getElementById('btn-add-player-hidden').click(), 0);
                                    }
                                }}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', backgroundColor: '#333', color: 'white', border: '1px solid #555', marginBottom: '5px' }}
                            >
                                <option value="">-- Select Player --</option>
                                {selectedSquadId
                                    ? (squads.find(s => s.id === selectedSquadId)?.players || [])
                                        .filter(p => !activePlayerStats.find(ap => ap.name === p.name)) // Hide used
                                        .map(p => <option key={p.id} value={p.name}>{p.name} ({p.club || p.number || '-'}) - {(p.positions?.[0] || p.position) || 'Unknown'}</option>)
                                    : (squad.filter(pName => !activePlayerStats.find(ap => ap.name === pName)) // Hide used
                                        .map(p => {
                                            // Try to find full player object even in flat list mode if possible, but 'squad' is just names.
                                            // So we stick to name.
                                            return <option key={p} value={p}>{p}</option>;
                                        }))
                                }
                            </select>
                            <input
                                type="text"
                                placeholder="Or type new name..."
                                value={newPlayerName}
                                onChange={(e) => setNewPlayerName(e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', backgroundColor: '#2d2d2d', color: 'white', border: '1px solid #555' }}
                            />
                        </div>
                        <button
                            id="btn-add-player-hidden"
                            onClick={handleAddPlayer}
                            style={{ display: 'none' }}
                        >Add</button>
                        <button
                            onClick={handleAddPlayer}
                            style={{
                                backgroundColor: '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0 20px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                height: 'fit-content',
                                alignSelf: 'flex-end'
                            }}
                        >
                            <Plus size={16} /> Add Row
                        </button>
                    </div>
                )}

                {/* Data Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #555', color: '#b0b0b0' }}>
                                <th style={{ textAlign: 'left', padding: '10px' }}>Player Name</th>
                                <th style={{ textAlign: 'center', padding: '10px' }}>Minutes ({PRESET_TABS.find(t => t.id === selectedQuarter)?.label})</th>
                                <th style={{ textAlign: 'center', padding: '10px' }}>Pressures</th>
                                <th style={{ textAlign: 'center', padding: '10px' }}>Free Conceded</th>
                                <th style={{ textAlign: 'center', padding: '10px' }}>Turnovers Won</th>
                                <th style={{ textAlign: 'center', padding: '10px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activePlayerStats.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No player stats recorded via this table yet.</td>
                                </tr>
                            ) : (
                                activePlayerStats.map(stat => {
                                    // Calculate Display Values based on Selected Quarter
                                    const qs = stat.quarters || {};
                                    // Migration fallback: if no quarters, use root values for Q1 or Summary? 
                                    // Let's assume migration logic happens on edit or we interpret dynamically.
                                    // For display, if old structure:
                                    const oldPress = stat.quarters ? 0 : (stat.pressures || 0);

                                    let dPress = 0, dFree = 0, dTurn = 0, dMins = 0;
                                    let isReadOnly = !['q1', 'q2', 'q3', 'q4'].includes(selectedQuarter);

                                    const addQ = (q) => {
                                        const s = qs[q] || {};
                                        dPress += (s.pressures || 0);
                                        dFree += (s.freeConceded || 0);
                                        dTurn += (s.turnovers || 0);
                                        dMins += (parseInt(s.minutes) || 0);
                                    };

                                    if (selectedQuarter === 'summary') {
                                        ['q1', 'q2', 'q3', 'q4'].forEach(addQ);
                                        // Add old stats if any
                                        dPress += oldPress;
                                    } else if (selectedQuarter === 'firstHalf') {
                                        ['q1', 'q2'].forEach(addQ);
                                        // add old to Q1?
                                        dPress += oldPress;
                                    } else if (selectedQuarter === 'secondHalf') {
                                        ['q3', 'q4'].forEach(addQ);
                                    } else {
                                        // Single Quarter
                                        addQ(selectedQuarter);
                                        if (selectedQuarter === 'q1') dPress += oldPress;
                                    }

                                    return (
                                        <tr key={stat.id} style={{ borderBottom: '1px solid #333' }}>
                                            <td style={{ padding: '10px', color: '#fff', fontWeight: 'bold' }}>{stat.name}</td>

                                            {/* MINUTES */}
                                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                                {isReadOnly ? (
                                                    <span style={{ color: '#aaa' }}>{dMins}</span>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={qs[selectedQuarter]?.minutes || ''}
                                                        onChange={(e) => handleUpdatePlayerStat(stat.id, selectedQuarter, 'minutes', e.target.value)}
                                                        disabled={viewedMatchId && !isEditable}
                                                        style={{ width: '50px', padding: '6px', textAlign: 'center', backgroundColor: '#2d2d2d', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
                                                    />
                                                )}
                                            </td>

                                            {/* PRESSURES */}
                                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                                {isReadOnly ? (
                                                    <span style={{ color: '#aaa' }}>{dPress}</span>
                                                ) : (
                                                    <input
                                                        type="number"
                                                        value={qs[selectedQuarter]?.pressures === 0 ? '' : (qs[selectedQuarter]?.pressures || '')}
                                                        onChange={(e) => handleUpdatePlayerStat(stat.id, selectedQuarter, 'pressures', e.target.value)}
                                                        disabled={viewedMatchId && !isEditable}
                                                        style={{ width: '60px', padding: '6px', textAlign: 'center', backgroundColor: '#2d2d2d', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
                                                    />
                                                )}
                                            </td>

                                            {/* FREE CONCEDED */}
                                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                                {isReadOnly ? (
                                                    <span style={{ color: '#aaa' }}>{dFree}</span>
                                                ) : (
                                                    <input
                                                        type="number"
                                                        value={qs[selectedQuarter]?.freeConceded === 0 ? '' : (qs[selectedQuarter]?.freeConceded || '')}
                                                        onChange={(e) => handleUpdatePlayerStat(stat.id, selectedQuarter, 'freeConceded', e.target.value)}
                                                        disabled={viewedMatchId && !isEditable}
                                                        style={{ width: '60px', padding: '6px', textAlign: 'center', backgroundColor: '#2d2d2d', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
                                                    />
                                                )}
                                            </td>

                                            {/* TURNOVERS */}
                                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                                {isReadOnly ? (
                                                    <span style={{ color: '#aaa' }}>{dTurn}</span>
                                                ) : (
                                                    <input
                                                        type="number"
                                                        value={qs[selectedQuarter]?.turnovers === 0 ? '' : (qs[selectedQuarter]?.turnovers || '')}
                                                        onChange={(e) => handleUpdatePlayerStat(stat.id, selectedQuarter, 'turnovers', e.target.value)}
                                                        disabled={viewedMatchId && !isEditable}
                                                        style={{ width: '60px', padding: '6px', textAlign: 'center', backgroundColor: '#2d2d2d', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
                                                    />
                                                )}
                                            </td>

                                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => handleRemovePlayerStat(stat.id)}
                                                    disabled={viewedMatchId && !isEditable}
                                                    style={{ border: 'none', background: 'transparent', color: '#cf6679', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                        <tfoot>
                            {(() => {
                                let tMins = 0, tPress = 0, tFree = 0, tTurn = 0;
                                activePlayerStats.forEach(stat => {
                                    const qs = stat.quarters || {};
                                    const oldPress = stat.quarters ? 0 : (stat.pressures || 0);

                                    const addQ = (q) => {
                                        const s = qs[q] || {};
                                        tPress += (s.pressures || 0);
                                        tFree += (s.freeConceded || 0);
                                        tTurn += (s.turnovers || 0);
                                        tMins += (parseInt(s.minutes) || 0);
                                    };

                                    if (selectedQuarter === 'summary') {
                                        ['q1', 'q2', 'q3', 'q4'].forEach(addQ);
                                        tPress += oldPress;
                                    } else if (selectedQuarter === 'firstHalf') {
                                        ['q1', 'q2'].forEach(addQ);
                                        tPress += oldPress;
                                    } else if (selectedQuarter === 'secondHalf') {
                                        ['q3', 'q4'].forEach(addQ);
                                    } else {
                                        addQ(selectedQuarter);
                                        if (selectedQuarter === 'q1') tPress += oldPress;
                                    }
                                });

                                return (
                                    <tr style={{ borderTop: '2px solid #555', backgroundColor: '#333', fontWeight: 'bold' }}>
                                        <td style={{ padding: '10px', color: '#fff' }}>TOTALS</td>
                                        <td style={{ padding: '10px', textAlign: 'center', color: '#fff' }}>{tMins}</td>
                                        <td style={{ padding: '10px', textAlign: 'center', color: '#fff' }}>{tPress}</td>
                                        <td style={{ padding: '10px', textAlign: 'center', color: '#fff' }}>{tFree}</td>
                                        <td style={{ padding: '10px', textAlign: 'center', color: '#fff' }}>{tTurn}</td>
                                        <td></td>
                                    </tr>
                                );
                            })()}
                        </tfoot>
                    </table>
                </div>
            </div>
        </div >
    );
};

export default HeatMapView;
