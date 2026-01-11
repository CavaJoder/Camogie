import React, { createContext, useContext, useState, useEffect } from 'react';

const SquadContext = createContext();

export const useSquad = () => {
    const context = useContext(SquadContext);
    if (!context) {
        throw new Error('useSquad must be used within a SquadProvider');
    }
    return context;
};

export const SquadProvider = ({ children }) => {
    const [squads, setSquads] = useState(() => {
        const saved = localStorage.getItem('squads');
        return saved ? JSON.parse(saved) : [];
    });

    const [selectedSquadId, setSelectedSquadId] = useState(null);

    // Persist squads to localStorage
    useEffect(() => {
        localStorage.setItem('squads', JSON.stringify(squads));
    }, [squads]);

    // Valid positions
    const validPositions = [
        'Goalkeeper',
        'Left Corner Back',
        'Full Back',
        'Right Corner Back',
        'Left Half Back',
        'Center Back',
        'Right Half Back',
        'Midfield',
        'Left Half Forward',
        'Center Forward',
        'Right Half Forward',
        'Left Corner Forward',
        'Full Forward',
        'Right Corner Forward'
    ];

    // Squad CRUD operations
    const createSquad = (name, logo = null, themeColor = '#bb86fc') => {
        const newSquad = {
            id: crypto.randomUUID(),
            name,
            logo,
            themeColor,
            createdAt: Date.now(),
            players: []
        };
        setSquads(prev => [...prev, newSquad]);
        return newSquad.id;
    };

    const updateSquad = (squadId, updates) => {
        setSquads(prev => prev.map(squad =>
            squad.id === squadId ? { ...squad, ...updates } : squad
        ));
    };

    const deleteSquad = (squadId) => {
        setSquads(prev => prev.filter(squad => squad.id !== squadId));
        if (selectedSquadId === squadId) {
            setSelectedSquadId(null);
        }
    };

    const getSquad = (squadId) => {
        return squads.find(squad => squad.id === squadId);
    };

    // Player CRUD operations
    const addPlayer = (squadId, playerData) => {
        const newPlayer = {
            id: crypto.randomUUID(),
            name: playerData.name,
            number: playerData.number,
            club: playerData.club || '',
            positions: playerData.positions || []
        };

        setSquads(prev => prev.map(squad =>
            squad.id === squadId
                ? { ...squad, players: [...squad.players, newPlayer] }
                : squad
        ));
        return newPlayer.id;
    };

    const updatePlayer = (squadId, playerId, updates) => {
        setSquads(prev => prev.map(squad =>
            squad.id === squadId
                ? {
                    ...squad,
                    players: squad.players.map(player =>
                        player.id === playerId ? { ...player, ...updates } : player
                    )
                }
                : squad
        ));
    };

    const deletePlayer = (squadId, playerId) => {
        setSquads(prev => prev.map(squad =>
            squad.id === squadId
                ? { ...squad, players: squad.players.filter(p => p.id !== playerId) }
                : squad
        ));
    };

    const getPlayer = (squadId, playerId) => {
        const squad = getSquad(squadId);
        return squad?.players.find(p => p.id === playerId);
    };

    const value = {
        squads,
        selectedSquadId,
        setSelectedSquadId,
        validPositions,
        // Squad operations
        createSquad,
        updateSquad,
        deleteSquad,
        getSquad,
        // Player operations
        addPlayer,
        updatePlayer,
        deletePlayer,
        getPlayer
    };

    return (
        <SquadContext.Provider value={value}>
            {children}
        </SquadContext.Provider>
    );
};

export default SquadContext;
