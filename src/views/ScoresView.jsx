import React, { useState } from 'react';
import { useMatch } from '../context/MatchContext';

const ScoresView = () => {
    const { matchInfo } = useMatch();
    const [selectedType, setSelectedType] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState('home');
    const [scores, setScores] = useState([]);

    const scoreTypes = [
        { id: 'point', label: 'Point', color: '#fff' }, // White
        { id: 'goal', label: 'Goal', color: '#000000' }, // Black
        { id: 'wide', label: 'Wide', color: '#f44336' }, // Red
        { id: '45', label: '45', color: '#ff9800' }, // Orange
        { id: 'free', label: 'Free', color: '#2196f3' }, // Blue
        { id: 'penalty', label: 'Penalty', color: '#9c27b0' } // Purple
    ];

    const handlePitchClick = (e) => {
        if (!selectedType) {
            alert('Please select a score type first');
            return;
        }

        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 400;
        const y = ((e.clientY - rect.top) / rect.height) * 250;

        const newScore = {
            id: Date.now(),
            x,
            y,
            type: selectedType,
            team: selectedTeam
        };

        setScores(prev => [...prev, newScore]);
    };

    const currentScores = scores.filter(s => s.team === selectedTeam);

    return (
        <div style={{ padding: '20px', paddingBottom: '80px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '20px' }}>Scores</h2>

            {/* Combined Score and Team Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {/* Row 1: Team 1, Point, Goal, Wide */}
                <button
                    onClick={() => setSelectedTeam('home')}
                    style={{
                        padding: '12px',
                        backgroundColor: selectedTeam === 'home' ? (matchInfo.homeTeamColor || '#bb86fc') : '#2a2a2a',
                        color: '#fff',
                        border: selectedTeam === 'home' ? `2px solid ${matchInfo.homeTeamColor || '#bb86fc'}` : '2px solid #444',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {matchInfo.homeTeam || 'Team A'}
                </button>

                {scoreTypes.slice(0, 3).map(type => (
                    <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        style={{
                            padding: '12px',
                            backgroundColor: selectedType === type.id ? type.color : '#2a2a2a',
                            color: selectedType === type.id && type.id === 'point' ? '#000' : '#fff',
                            border: selectedType === type.id ? `2px solid ${type.color}` : '2px solid #444',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {type.label}
                    </button>
                ))}

                {/* Row 2: Team 2, 45, Free, Penalty */}
                <button
                    onClick={() => setSelectedTeam('away')}
                    style={{
                        padding: '12px',
                        backgroundColor: selectedTeam === 'away' ? (matchInfo.awayTeamColor || '#bb86fc') : '#2a2a2a',
                        color: '#fff',
                        border: selectedTeam === 'away' ? `2px solid ${matchInfo.awayTeamColor || '#bb86fc'}` : '2px solid #444',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {matchInfo.awayTeam || 'Team B'}
                </button>

                {scoreTypes.slice(3).map(type => (
                    <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        style={{
                            padding: '12px',
                            backgroundColor: selectedType === type.id ? type.color : '#2a2a2a',
                            color: selectedType === type.id && type.id === 'point' ? '#000' : '#fff',
                            border: selectedType === type.id ? `2px solid ${type.color}` : '2px solid #444',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            {/* GAA Pitch Diagram */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                <svg
                    viewBox="0 0 400 250"
                    onClick={handlePitchClick}
                    style={{
                        width: '100%',
                        height: 'auto',
                        border: '2px solid #333',
                        borderRadius: '8px',
                        backgroundColor: '#1a4d1a',
                        cursor: selectedType ? 'crosshair' : 'not-allowed'
                    }}
                >
                    {/* Grass Stripes Pattern */}
                    <defs>
                        <pattern id="grassStripesScores" x="0" y="0" width="16" height="250" patternUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="8" height="250" fill="#1a5c1a" />
                            <rect x="8" y="0" width="8" height="250" fill="#1a4d1a" />
                        </pattern>
                    </defs>

                    {/* Grass Background with Stripes */}
                    <rect x="0" y="0" width="400" height="250" fill="url(#grassStripesScores)" />

                    {/* Outer Boundary */}
                    <rect x="15" y="15" width="370" height="220" fill="none" stroke="white" strokeWidth="2.5" />

                    {/* Left Goal Area (Small Rectangle) */}
                    <rect x="15" y="100" width="12" height="50" fill="none" stroke="white" strokeWidth="2" />

                    {/* Left Outer D-Area (Large semi-circle starting at 20m line) */}
                    <path
                        d="M 70 55 C 110 55, 110 125, 110 125 C 110 125, 110 195, 70 195"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                    />

                    {/* Left Inner Semi-circle (Small, curves outward) */}
                    <path
                        d="M 70 85 Q 90 85 90 125 Q 90 165 70 165"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                    />

                    {/* Right Goal Area (Small Rectangle) */}
                    <rect x="373" y="100" width="12" height="50" fill="none" stroke="white" strokeWidth="2" />

                    {/* Right Outer D-Area (Large semi-circle starting at 20m line) */}
                    <path
                        d="M 330 55 C 290 55, 290 125, 290 125 C 290 125, 290 195, 330 195"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                    />

                    {/* Right Inner Semi-circle (Small, curves outward) */}
                    <path
                        d="M 330 85 Q 310 85 310 125 Q 310 165 330 165"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                    />

                    {/* Vertical Lines - Left to Right */}
                    {/* 13m line - left */}
                    <line x1="55" y1="15" x2="55" y2="235" stroke="white" strokeWidth="2" />

                    {/* 20m line - left */}
                    <line x1="70" y1="15" x2="70" y2="235" stroke="white" strokeWidth="2" />

                    {/* 45m line - left */}
                    <line x1="130" y1="15" x2="130" y2="235" stroke="white" strokeWidth="2" />

                    {/* 65m line - left (solid) */}
                    <line x1="165" y1="15" x2="165" y2="235" stroke="white" strokeWidth="2" />

                    {/* Center line (dashed) */}
                    <line x1="200" y1="15" x2="200" y2="235" stroke="white" strokeWidth="2" strokeDasharray="6,4" />

                    {/* 65m line - right (solid) */}
                    <line x1="235" y1="15" x2="235" y2="235" stroke="white" strokeWidth="2" />

                    {/* 45m line - right */}
                    <line x1="270" y1="15" x2="270" y2="235" stroke="white" strokeWidth="2" />

                    {/* 20m line - right */}
                    <line x1="330" y1="15" x2="330" y2="235" stroke="white" strokeWidth="2" />

                    {/* 13m line - right */}
                    <line x1="345" y1="15" x2="345" y2="235" stroke="white" strokeWidth="2" />

                    {/* Small horizontal lines next to goal area */}
                    {/* Left side - top horizontal line (from 13m to goal line) */}
                    <line x1="15" y1="92" x2="55" y2="92" stroke="white" strokeWidth="2" />

                    {/* Left side - bottom horizontal line (from 13m to goal line) */}
                    <line x1="15" y1="158" x2="55" y2="158" stroke="white" strokeWidth="2" />

                    {/* Right side - top horizontal line (from 13m to goal line) */}
                    <line x1="345" y1="92" x2="385" y2="92" stroke="white" strokeWidth="2" />

                    {/* Right side - bottom horizontal line (from 13m to goal line) */}
                    <line x1="345" y1="158" x2="385" y2="158" stroke="white" strokeWidth="2" />

                    {/* Left Goal Posts */}
                    <rect x="10" y="115" width="5" height="5" fill="white" />
                    <rect x="10" y="130" width="5" height="5" fill="white" />

                    {/* Right Goal Posts */}
                    <rect x="385" y="115" width="5" height="5" fill="white" />
                    <rect x="385" y="130" width="5" height="5" fill="white" />

                    {/* Score Markers */}
                    {currentScores.map(score => {
                        const typeConfig = scoreTypes.find(t => t.id === score.type);
                        return (
                            <circle
                                key={score.id}
                                cx={score.x}
                                cy={score.y}
                                r="2"
                                fill={typeConfig ? typeConfig.color : '#fff'}
                                style={{ cursor: 'pointer' }}
                            />
                        );
                    })}
                </svg>
            </div>

            <div style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#1e1e1e',
                borderRadius: '8px',
                border: '1px solid #333'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
                    {scoreTypes.map(type => (
                        <div key={type.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: type.color }}></div>
                            <span style={{ color: '#b0b0b0', fontSize: '0.8rem' }}>{type.label}</span>
                        </div>
                    ))}
                </div>

                <p style={{ color: '#b0b0b0', fontSize: '0.9rem', textAlign: 'center' }}>
                    Select a score type and team, then click on the pitch to record
                </p>
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-around', fontSize: '0.85rem' }}>
                    <span style={{ color: '#b0b0b0' }}>
                        {matchInfo.homeTeam || 'Team A'}: <span style={{ color: '#4caf50' }}>{scores.filter(s => s.team === 'home').length} events</span>
                    </span>
                    <span style={{ color: '#b0b0b0' }}>
                        {matchInfo.awayTeam || 'Team B'}: <span style={{ color: '#4caf50' }}>{scores.filter(s => s.team === 'away').length} events</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ScoresView;
