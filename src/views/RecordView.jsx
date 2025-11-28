import React from 'react';
import { useMatch } from '../context/MatchContext';
import StatButton from '../components/StatButton';

const RecordView = () => {
    const { stats, timer, updateStat } = useMatch();

    // Helper to get current count safely
    const getCount = (id) => {
        const currentQStats = stats[timer.quarter.toLowerCase()] || {};
        return currentQStats[id] || 0;
    };

    const categories = [
        {
            title: 'Possession & Pressure',
            items: [
                { id: 'oppPossessions', label: 'Opp Possessions', color: '#bb86fc' },
                { id: 'pressures', label: 'Pressures', color: '#bb86fc' },
                { id: 'freesAgainst', label: 'Frees Against', color: '#bb86fc' },
                { id: 'turnovers', label: 'Turnovers', color: '#bb86fc' },
            ]
        },
        {
            title: 'Shots & Scores',
            items: [
                { id: 'ballInside65', label: 'Ball Inside 65', color: '#bb86fc' },
                { id: 'shotTaken', label: 'Shot Taken', color: '#bb86fc' },
                { id: 'score', label: 'Score', color: '#4caf50' },
                { id: 'wide', label: 'Wide', color: '#cf6679' },
                { id: 'short', label: 'Short', color: '#ff9800' },
                { id: 'saved', label: 'Saved', color: '#ff9800' },
                { id: 'freeWon', label: 'Free Won', color: '#4caf50' },
                { id: '45Won', label: '45 Won', color: '#4caf50' },
            ]
        },
        {
            title: 'Rucks',
            items: [
                { id: 'defRuck', label: 'Defensive Ruck', color: '#bb86fc' },
                { id: 'defRuckWon', label: 'Def Ruck Won', color: '#4caf50' },
                { id: 'midRuck', label: 'Middle Third Ruck', color: '#bb86fc' },
                { id: 'midRuckWon', label: 'Mid Ruck Won', color: '#4caf50' },
                { id: 'offRuck', label: 'Offensive Ruck', color: '#bb86fc' },
                { id: 'offRuckWon', label: 'Off Ruck Won', color: '#4caf50' },
            ]
        },
        {
            title: 'Puckouts',
            items: [
                { id: 'oppPuckout', label: 'Opp Puckout', color: '#bb86fc' },
                { id: 'oppPuckoutWon', label: 'Opp Puckout Won', color: '#4caf50' },
                { id: 'ownPuckout', label: 'Own Puckout', color: '#bb86fc' },
                { id: 'ownPuckoutWon', label: 'Own Puckout Won', color: '#4caf50' },
            ]
        }
    ];

    return (
        <div style={{ padding: '16px', paddingBottom: '80px' }}>
            {categories.map((cat, index) => (
                <div key={index} style={{ marginBottom: '24px' }}>
                    <h3 style={{
                        color: '#b0b0b0',
                        fontSize: '0.9rem',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        {cat.title}
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px'
                    }}>
                        {cat.items.map(item => (
                            <StatButton
                                key={item.id}
                                label={item.label}
                                count={getCount(item.id)}
                                color={item.color}
                                onIncrement={() => updateStat(item.id, 1)}
                                onDecrement={() => updateStat(item.id, -1)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecordView;
