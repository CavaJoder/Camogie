import React from 'react';
import { useMatch } from '../context/MatchContext';
import StatButton from '../components/StatButton';

import ScoresView from './ScoresView';
import PuckoutsView from './PuckoutsView';

const RecordView = () => {
    const { stats, timer, updateStat, addPitchEvent, matchInfo, setQuarter } = useMatch();
    const [selectedZone, setSelectedZone] = React.useState(null);

    // Helper to get current count safely
    const getCount = (id) => {
        if (timer.quarter === 'FT') {
            // Sum all quarters for FT view
            return ['q1', 'q2', 'q3', 'q4'].reduce((total, q) => {
                const qStats = stats[q] || {};
                const statVal = qStats[id] || { home: 0, away: 0 };
                const val = typeof statVal === 'object' ? (statVal.home || 0) : statVal;
                return total + val;
            }, 0);
        }
        const currentQStats = stats[timer.quarter.toLowerCase()] || {};
        const statVal = currentQStats[id] || { home: 0, away: 0 };
        return typeof statVal === 'object' ? (statVal.home || 0) : statVal;
    };

    const getTotalCount = (id) => {
        return ['q1', 'q2', 'q3', 'q4', 'ft'].reduce((total, q) => {
            const qStats = stats[q] || {};
            const statVal = qStats[id] || { home: 0, away: 0 };
            const val = typeof statVal === 'object' ? (statVal.home || 0) : statVal;
            return total + val;
        }, 0);
    };

    const categories = [
        {
            title: 'Possession & Pressure',
            items: [
                { id: 'oppPossessions', label: 'Opp Possessions', color: '#bb86fc' },
                { id: 'pressures', label: 'Pressures', color: '#bb86fc' },
                { id: 'freesAgainst', label: 'Free Due To Pressure', color: '#bb86fc' },
                { id: 'turnovers', label: 'Turnovers', color: '#bb86fc' },
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
            title: 'Shots & Scores',
            items: [
                { id: 'ballInside65', label: 'Ball Inside 65', color: '#bb86fc' },
                { id: 'shotTaken', label: 'Shot Taken', color: '#bb86fc' },
                { id: 'score', label: 'Score', color: '#4caf50' },
                { id: 'wide', label: 'Wide', color: '#cf6679' },
                { id: 'short', label: 'Short', color: '#ff9800' },
                { id: 'saved', label: 'Saved', color: '#ff9800' },
                { id: 'offPost', label: 'Off Post', color: '#ff9800' },
                { id: 'freeWon', label: 'Free Won', color: '#4caf50' },
                { id: 'scoreFree', label: 'Score from Free', color: '#4caf50' },
                { id: '45Won', label: '45 Won', color: '#4caf50' },
                { id: 'score45', label: 'Score 45', color: '#ff9800' },
                { id: 'penaltyWon', label: 'Penalty Won', color: '#4caf50' },
                { id: 'penalty', label: 'Score from Penalty', color: '#9c27b0' },
                { id: 'shot65', label: 'Shot from > 65', color: '#bb86fc' },
                { id: 'wide65', label: 'Wide from > 65', color: '#cf6679' },
                { id: 'point65', label: 'Point from > 65', color: '#4caf50' },
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

    // Add Read-Only Mode Check
    const isReadOnly = timer.quarter === 'FT';

    return (
        <div style={{ padding: '16px', paddingTop: '80px', paddingBottom: '80px' }}>
            {/* Quarter Selector for Editing */}
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#1e1e1e', borderRadius: '8px', border: '1px solid #333' }}>
                <label style={{ color: '#b0b0b0', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
                    Active Quarter (Editing Record)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['Q1', 'Q2', 'Q3', 'Q4', 'FT'].map(q => (
                        <button
                            key={q}
                            onClick={() => {
                                if (timer.quarter !== q) {
                                    setQuarter(q);
                                }
                            }}
                            style={{
                                flex: 1,
                                padding: '8px',
                                backgroundColor: timer.quarter === q ? '#bb86fc' : '#333',
                                color: timer.quarter === q ? '#000' : '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>

            {/* Read-Only Warning Banner */}
            {isReadOnly && (
                <div style={{
                    backgroundColor: 'rgba(207, 102, 121, 0.1)',
                    border: '1px solid #cf6679',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <div style={{ color: '#cf6679' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <div>
                        <div style={{ color: '#cf6679', fontWeight: 'bold', fontSize: '0.9rem' }}>Read-Only View</div>
                        <div style={{ color: '#b0b0b0', fontSize: '0.8rem' }}>
                            Select a specific quarter (Q1-Q4) above to edit statistics for that period.
                        </div>
                    </div>
                </div>
            )}
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
                                disabled={isReadOnly}
                                onIncrement={() => !isReadOnly && updateStat(timer.quarter.toLowerCase(), item.id, 'home', 1)}
                                onDecrement={() => !isReadOnly && updateStat(timer.quarter.toLowerCase(), item.id, 'home', -1)}
                            />
                        ))}
                    </div>
                </div>
            ))}

            <hr style={{ borderColor: '#333', margin: '32px 0' }} />

            <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                    color: '#b0b0b0',
                    fontSize: '0.9rem',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    Free Section
                </h3>

                <div style={{ padding: '10px', backgroundColor: '#121212', borderRadius: '8px', border: '1px solid #333' }}>
                    <StatButton
                        label="Total Free Conceded"
                        count={getCount('freeConcededHome')}
                        color="#cf6679"
                        disabled={isReadOnly}
                        onIncrement={() => {
                            if (!isReadOnly) {
                                updateStat(timer.quarter.toLowerCase(), 'freeConcededHome', 'home', 1);
                                addPitchEvent(timer.quarter.toLowerCase(), 'frees', { team: 'home', quarter: timer.quarter, location: selectedZone }, true);
                            }
                        }}
                        onDecrement={() => !isReadOnly && updateStat(timer.quarter.toLowerCase(), 'freeConcededHome', 'home', -1)}
                    />
                    {/* Zone Selector */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {['Defence', 'Middle', 'Offence'].map(zone => (
                            <label key={zone} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: isReadOnly ? 'not-allowed' : 'pointer',
                                color: selectedZone === zone ? '#cf6679' : '#b0b0b0',
                                fontSize: '0.85rem',
                                fontWeight: selectedZone === zone ? 'bold' : 'normal',
                                opacity: isReadOnly ? 0.5 : 1
                            }}>
                                <input
                                    type="checkbox"
                                    checked={selectedZone === zone}
                                    disabled={isReadOnly}
                                    onChange={() => setSelectedZone(prev => prev === zone ? null : zone)}
                                    style={{ accentColor: '#cf6679', transform: 'scale(1.2)', cursor: isReadOnly ? 'not-allowed' : 'pointer' }}
                                />
                                {zone}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <hr style={{ borderColor: '#333', margin: '32px 0' }} />

            <ScoresView readOnly={isReadOnly} />

            <hr style={{ borderColor: '#333', margin: '32px 0' }} />

            <PuckoutsView readOnly={isReadOnly} />
        </div>
    );
};

export default RecordView;
