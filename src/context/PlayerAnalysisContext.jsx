import React, { createContext, useContext, useState, useEffect } from 'react';

const PlayerAnalysisContext = createContext();

export const usePlayerAnalysis = () => {
    const context = useContext(PlayerAnalysisContext);
    if (!context) {
        throw new Error('usePlayerAnalysis must be used within a PlayerAnalysisProvider');
    }
    return context;
};

export const PlayerAnalysisProvider = ({ children }) => {
    const [selectedSquadId, setSelectedSquadId] = useState(() => {
        const saved = localStorage.getItem('playerAnalysisSquadId');
        return saved || null;
    });
    const [playerStats, setPlayerStats] = useState(() => {
        const saved = localStorage.getItem('playerAnalysisStats');
        return saved ? JSON.parse(saved) : {};
    });
    const [selectedPlayers, setSelectedPlayers] = useState(() => {
        const saved = localStorage.getItem('playerAnalysisSelectedPlayers');
        return saved ? JSON.parse(saved) : [];
    });

    // Persist squad selection to localStorage
    useEffect(() => {
        if (selectedSquadId) {
            localStorage.setItem('playerAnalysisSquadId', selectedSquadId);
        } else {
            localStorage.removeItem('playerAnalysisSquadId');
        }
    }, [selectedSquadId]);

    // Persist stats to localStorage
    useEffect(() => {
        localStorage.setItem('playerAnalysisStats', JSON.stringify(playerStats));
    }, [playerStats]);

    // Persist selected players to localStorage
    useEffect(() => {
        localStorage.setItem('playerAnalysisSelectedPlayers', JSON.stringify(selectedPlayers));
    }, [selectedPlayers]);

    // Metrics to track
    const metrics = [
        { id: 'effort', label: 'Effort' },
        { id: 'possession', label: 'Possession' },
        { id: 'goodPass', label: 'Good Pass' },
        { id: 'shotTaken', label: 'Shot Taken' },
        { id: 'scoreFromPlay', label: 'Score from Play' },
        { id: 'scoreFromFree', label: 'Score from Free' },
        { id: 'freeWon', label: 'Free Won' },
        { id: 'turnoverByPass', label: 'Turnover by Pass' },
        { id: 'turnoverInPossession', label: 'Turnover in Possession' },
        { id: 'noScoreWide', label: 'No Score/Wide' },
        { id: 'noScoreDropped', label: 'No Score Dropped' },
        { id: 'freeAgainst', label: 'Free Against' }
    ];

    // Initialize player stats if not exists
    const initializePlayer = (playerId) => {
        if (!playerStats[playerId]) {
            const initialStats = {};
            metrics.forEach(metric => {
                initialStats[metric.id] = 0;
            });
            setPlayerStats(prev => ({
                ...prev,
                [playerId]: initialStats
            }));
        }
    };

    // Get player stats
    const getPlayerStats = (playerId) => {
        if (!playerStats[playerId]) {
            initializePlayer(playerId);
            return metrics.reduce((acc, metric) => {
                acc[metric.id] = 0;
                return acc;
            }, {});
        }
        return playerStats[playerId];
    };

    // Increment stat
    const incrementStat = (playerId, metricId) => {
        initializePlayer(playerId);
        setPlayerStats(prev => ({
            ...prev,
            [playerId]: {
                ...prev[playerId],
                [metricId]: (prev[playerId]?.[metricId] || 0) + 1
            }
        }));
    };

    // Decrement stat
    const decrementStat = (playerId, metricId) => {
        initializePlayer(playerId);
        setPlayerStats(prev => ({
            ...prev,
            [playerId]: {
                ...prev[playerId],
                [metricId]: Math.max(0, (prev[playerId]?.[metricId] || 0) - 1)
            }
        }));
    };

    // Reset all stats
    const resetAllStats = () => {
        if (window.confirm('Are you sure you want to reset all player statistics?')) {
            setPlayerStats({});
        }
    };

    // Reset stats for specific squad
    const resetSquadStats = (squadId, playerIds) => {
        if (window.confirm('Are you sure you want to reset statistics for this squad?')) {
            setPlayerStats(prev => {
                const newStats = { ...prev };
                playerIds.forEach(playerId => {
                    delete newStats[playerId];
                });
                return newStats;
            });
        }
    };

    const value = {
        selectedSquadId,
        setSelectedSquadId,
        selectedPlayers,
        setSelectedPlayers,
        playerStats,
        metrics,
        getPlayerStats,
        incrementStat,
        decrementStat,
        resetAllStats,
        resetSquadStats
    };

    return (
        <PlayerAnalysisContext.Provider value={value}>
            {children}
        </PlayerAnalysisContext.Provider>
    );
};

export default PlayerAnalysisContext;
