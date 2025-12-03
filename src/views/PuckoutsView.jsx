import React, { useState } from 'react';
import { useMatch } from '../context/MatchContext';

const PuckoutsView = () => {
    const { matchInfo } = useMatch();
    const [selectedOutcome, setSelectedOutcome] = useState(null); // 'won' or 'lost'
    const [puckouts, setPuckouts] = useState({ teamA: [], teamB: [] });
    const [viewTeam, setViewTeam] = useState('teamA'); // Toggle between teams for viewing AND recording

    const handlePitchClick = (e) => {
        if (!selectedOutcome) {
            alert('Please select an outcome (Won or Lost) first');
            return;
        }

        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 400;
        const y = ((e.clientY - rect.top) / rect.height) * 250;

        const newPuckout = {
            x,
            y,
            outcome: selectedOutcome,
            team: viewTeam, // Use viewTeam instead of selectedTeam
            id: Date.now()
        };

        setPuckouts(prev => ({
            ...prev,
            [viewTeam]: [...prev[viewTeam], newPuckout] // Use viewTeam instead of selectedTeam
        }));
    };

    const currentPuckouts = puckouts[viewTeam];

    return (
        <div style={{ padding: '20px', paddingBottom: '80px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '20px' }}>Puckouts</h2>

            {/* Combined Outcome and Team Controls */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 2fr 2fr',
                gap: '10px',
                marginBottom: '20px'
            }}>
                {/* Team Buttons */}
                <button
                    onClick={() => setViewTeam('teamA')}
                    style={{
                        padding: '12px',
                        backgroundColor: viewTeam === 'teamA' ? (matchInfo.homeTeamColor || '#bb86fc') : '#2a2a2a',
                        color: '#fff',
                        border: viewTeam === 'teamA' ? `2px solid ${matchInfo.homeTeamColor || '#bb86fc'}` : '2px solid #444',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {matchInfo.homeTeam || 'Team A'}
                </button>
                <button
                    onClick={() => setViewTeam('teamB')}
                    style={{
                        padding: '12px',
                        backgroundColor: viewTeam === 'teamB' ? (matchInfo.awayTeamColor || '#bb86fc') : '#2a2a2a',
                        color: '#fff',
                        border: viewTeam === 'teamB' ? `2px solid ${matchInfo.awayTeamColor || '#bb86fc'}` : '2px solid #444',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {matchInfo.awayTeam || 'Team B'}
                </button>

                {/* Outcome Buttons */}
                <button
                    onClick={() => setSelectedOutcome('won')}
                    style={{
                        padding: '12px',
                        backgroundColor: selectedOutcome === 'won' ? '#4caf50' : '#2a2a2a',
                        color: '#fff',
                        border: selectedOutcome === 'won' ? '2px solid #4caf50' : '2px solid #444',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Puckout Won
                </button>
                <button
                    onClick={() => setSelectedOutcome('lost')}
                    style={{
                        padding: '12px',
                        backgroundColor: selectedOutcome === 'lost' ? '#f44336' : '#2a2a2a',
                        color: '#fff',
                        border: selectedOutcome === 'lost' ? '2px solid #f44336' : '2px solid #444',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Puckout Lost
                </button>
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
                        cursor: selectedOutcome ? 'crosshair' : 'not-allowed'
                    }}
                >
                    {/* Grass Stripes Pattern */}
                    <defs>
                        <pattern id="grassStripes" x="0" y="0" width="16" height="250" patternUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="8" height="250" fill="#1a5c1a" />
                            <rect x="8" y="0" width="8" height="250" fill="#1a4d1a" />
                        </pattern>
                    </defs>

                    {/* Grass Background with Stripes */}
                    <rect x="0" y="0" width="400" height="250" fill="url(#grassStripes)" />

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

                    {/* Puckout Markers */}
                    {currentPuckouts.map(puckout => (
                        <circle
                            key={puckout.id}
                            cx={puckout.x}
                            cy={puckout.y}
                            r="2"
                            fill={puckout.outcome === 'won' ? '#4caf50' : '#f44336'}
                            style={{ cursor: 'pointer' }}
                        />
                    ))}
                </svg>
            </div>

            <div style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#1e1e1e',
                borderRadius: '8px',
                border: '1px solid #333'
            }}>
                <p style={{ color: '#b0b0b0', fontSize: '0.9rem', textAlign: 'center' }}>
                    Select an outcome, choose a team view, then click on the pitch to record puckout locations
                </p>
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-around', fontSize: '0.85rem' }}>
                    <span style={{ color: '#b0b0b0' }}>
                        {matchInfo.homeTeam || 'Team A'}: <span style={{ color: '#4caf50' }}>{puckouts.teamA.filter(p => p.outcome === 'won').length} won</span> / <span style={{ color: '#f44336' }}>{puckouts.teamA.filter(p => p.outcome === 'lost').length} lost</span>
                    </span>
                    <span style={{ color: '#b0b0b0' }}>
                        {matchInfo.awayTeam || 'Team B'}: <span style={{ color: '#4caf50' }}>{puckouts.teamB.filter(p => p.outcome === 'won').length} won</span> / <span style={{ color: '#f44336' }}>{puckouts.teamB.filter(p => p.outcome === 'lost').length} lost</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PuckoutsView;
