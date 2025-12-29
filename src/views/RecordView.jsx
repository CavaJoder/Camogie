import React from 'react';
import { useMatch } from '../context/MatchContext';
import StatButton from '../components/StatButton';

import ScoresView from './ScoresView';
import PuckoutsView from './PuckoutsView';

const RecordView = () => {
    const { stats, timer, updateStat, addPitchEvent, matchInfo } = useMatch();
    const [freeLocation, setFreeLocation] = React.useState('Middle');
    const [freeType, setFreeType] = React.useState('Other');

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

    return (
        <div style={{ padding: '16px', paddingTop: '32px', paddingBottom: '80px' }}>
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

            <hr style={{ borderColor: '#333', margin: '32px 0' }} />

            <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                    color: '#b0b0b0',
                    fontSize: '0.9rem',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    Total Frees
                </h3>

                {/* Shared Multi-dropdown controls */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                    <div>
                        <label style={{ display: 'block', color: '#888', fontSize: '0.7rem', marginBottom: '4px' }}>Location</label>
                        <select
                            value={freeLocation}
                            onChange={(e) => setFreeLocation(e.target.value)}
                            style={{ width: '100%', padding: '8px', backgroundColor: '#1e1e1e', color: '#fff', border: '1px solid #333', borderRadius: '4px', fontSize: '0.9rem' }}
                        >
                            <option>Defence</option>
                            <option>Middle</option>
                            <option>Offence</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#888', fontSize: '0.7rem', marginBottom: '4px' }}>Free Type</label>
                        <select
                            value={freeType}
                            onChange={(e) => setFreeType(e.target.value)}
                            style={{ width: '100%', padding: '8px', backgroundColor: '#1e1e1e', color: '#fff', border: '1px solid #333', borderRadius: '4px', fontSize: '0.9rem' }}
                        >
                            {['Other', 'Dropped Hurley', 'Trip', 'Catch', 'Hold', 'Strike', 'Charge', 'Equipment', 'Obstruct', 'Shoulder', 'Dissent', 'Persistant Fouling', 'Pick off Ground', 'Touch on Ground', 'Throw', 'Throw Foul', 'Steps', 'Over carry', 'Chop', 'Hold Hurley', 'Push', 'Lying on Ball', 'Sandwich', 'Dangerous Play'].map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {/* Team A (Home) */}
                    <div style={{ padding: '10px', backgroundColor: '#121212', borderRadius: '8px', border: '1px solid #333' }}>
                        <div style={{ color: matchInfo.homeTeamColor || '#bb86fc', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
                            {matchInfo.homeTeam || 'Home'}
                        </div>
                        <StatButton
                            label="Free Conceded"
                            count={getCount('freeConcededHome')}
                            color="#cf6679"
                            onIncrement={() => {
                                updateStat('freeConcededHome', 1);
                                addPitchEvent('frees', { team: 'home', location: freeLocation, type: freeType });
                            }}
                            onDecrement={() => updateStat('freeConcededHome', -1)}
                        />
                    </div>

                    {/* Team B (Away) */}
                    <div style={{ padding: '10px', backgroundColor: '#121212', borderRadius: '8px', border: '1px solid #333' }}>
                        <div style={{ color: matchInfo.awayTeamColor || '#bb86fc', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
                            {matchInfo.awayTeam || 'Away'}
                        </div>
                        <StatButton
                            label="Free Conceded"
                            count={getCount('freeConcededAway')}
                            color="#cf6679"
                            onIncrement={() => {
                                updateStat('freeConcededAway', 1);
                                addPitchEvent('frees', { team: 'away', location: freeLocation, type: freeType });
                            }}
                            onDecrement={() => updateStat('freeConcededAway', -1)}
                        />
                    </div>
                </div>
            </div>

            <hr style={{ borderColor: '#333', margin: '32px 0' }} />

            <ScoresView />

            <hr style={{ borderColor: '#333', margin: '32px 0' }} />

            <PuckoutsView />
        </div>
    );
};

export default RecordView;
