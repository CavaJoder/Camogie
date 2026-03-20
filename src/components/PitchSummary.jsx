import React from 'react';

const PitchSummary = ({ data, type, title }) => {
    // Score Types Configuration
    const scoreTypes = [
        { id: 'point', label: 'Point', color: '#4caf50' },   // Green
        { id: 'goal', label: 'Goal', color: '#ffeb3b' },    // Yellow/Gold
        { id: 'wide', label: 'Wide', color: '#ff5252' },    // Bright Red
        { id: '45', label: '45', color: '#ff9800' },        // Orange
        { id: 'free', label: 'Free', color: '#03dac6' },     // Teal
        { id: 'penalty', label: 'Penalty', color: '#e91e63' } // Pink
    ];

    // Calculate event summaries
    const getEventSummary = () => {
        if (type === 'scores') {
            const homeScores = data.filter(s => s.team === 'home');
            const awayScores = data.filter(s => s.team === 'away');

            const homeSummary = scoreTypes.map(st => ({
                type: st.label,
                count: homeScores.filter(s => s.type === st.id).length
            })).filter(s => s.count > 0);

            const awaySummary = scoreTypes.map(st => ({
                type: st.label,
                count: awayScores.filter(s => s.type === st.id).length
            })).filter(s => s.count > 0);

            return { home: homeSummary, away: awaySummary, homeTotal: homeScores.length, awayTotal: awayScores.length };
        } else if (type === 'puckouts') {
            const homePuckouts = data.filter(p => p.team === 'home');
            const awayPuckouts = data.filter(p => p.team === 'away');

            return {
                home: [
                    { type: 'Won', count: homePuckouts.filter(p => p.outcome === 'won').length },
                    { type: 'Lost', count: homePuckouts.filter(p => p.outcome === 'lost').length }
                ].filter(p => p.count > 0),
                away: [
                    { type: 'Won', count: awayPuckouts.filter(p => p.outcome === 'won').length },
                    { type: 'Lost', count: awayPuckouts.filter(p => p.outcome === 'lost').length }
                ].filter(p => p.count > 0),
                homeTotal: homePuckouts.length,
                awayTotal: awayPuckouts.length
            };
        }
        return { home: [], away: [], homeTotal: 0, awayTotal: 0 };
    };

    const summary = getEventSummary();

    return (
        <div style={{ width: '100%', marginBottom: '10px', pageBreakInside: 'avoid' }}>
            <h4 style={{ textAlign: 'center', marginBottom: '6px', color: '#333', fontSize: '0.95rem', fontWeight: 'bold' }}>{title}</h4>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                maxWidth: '500px',
                margin: '0 auto'
            }}>
                <svg
                    viewBox="0 0 400 250"
                    style={{
                        width: '100%',
                        height: 'auto',
                        border: '1px solid #333',
                        borderRadius: '4px',
                        backgroundColor: '#2d7a2d'
                    }}
                >
                    {/* Solid Grass Background - Better for PDF rendering */}
                    <rect x="0" y="0" width="400" height="250" fill="#2d7a2d" />

                    {/* Outer Boundary */}
                    <rect x="15" y="15" width="370" height="220" fill="none" stroke="white" strokeWidth="2.5" />

                    {/* Left Goal Area */}
                    <rect x="15" y="100" width="12" height="50" fill="none" stroke="white" strokeWidth="2" />

                    {/* Left Outer D-Area */}
                    <path d="M 70 55 C 110 55, 110 125, 110 125 C 110 125, 110 195, 70 195" fill="none" stroke="white" strokeWidth="2" />

                    {/* Left Inner Semi-circle */}
                    <path d="M 70 85 Q 90 85 90 125 Q 90 165 70 165" fill="none" stroke="white" strokeWidth="2" />

                    {/* Right Goal Area */}
                    <rect x="373" y="100" width="12" height="50" fill="none" stroke="white" strokeWidth="2" />

                    {/* Right Outer D-Area */}
                    <path d="M 330 55 C 290 55, 290 125, 290 125 C 290 125, 290 195, 330 195" fill="none" stroke="white" strokeWidth="2" />

                    {/* Right Inner Semi-circle */}
                    <path d="M 330 85 Q 310 85 310 125 Q 310 165 330 165" fill="none" stroke="white" strokeWidth="2" />

                    {/* Vertical Lines */}
                    <line x1="55" y1="15" x2="55" y2="235" stroke="white" strokeWidth="2" />
                    <line x1="70" y1="15" x2="70" y2="235" stroke="white" strokeWidth="2" />
                    <line x1="130" y1="15" x2="130" y2="235" stroke="white" strokeWidth="2" />
                    <line x1="165" y1="15" x2="165" y2="235" stroke="white" strokeWidth="2" />
                    <line x1="200" y1="15" x2="200" y2="235" stroke="white" strokeWidth="2" strokeDasharray="6,4" />
                    <line x1="235" y1="15" x2="235" y2="235" stroke="white" strokeWidth="2" />
                    <line x1="270" y1="15" x2="270" y2="235" stroke="white" strokeWidth="2" />
                    <line x1="330" y1="15" x2="330" y2="235" stroke="white" strokeWidth="2" />
                    <line x1="345" y1="15" x2="345" y2="235" stroke="white" strokeWidth="2" />

                    {/* Small horizontal lines */}
                    <line x1="15" y1="92" x2="55" y2="92" stroke="white" strokeWidth="2" />
                    <line x1="15" y1="158" x2="55" y2="158" stroke="white" strokeWidth="2" />
                    <line x1="345" y1="92" x2="385" y2="92" stroke="white" strokeWidth="2" />
                    <line x1="345" y1="158" x2="385" y2="158" stroke="white" strokeWidth="2" />

                    {/* Goal Posts */}
                    <rect x="10" y="115" width="5" height="5" fill="white" />
                    <rect x="10" y="130" width="5" height="5" fill="white" />
                    <rect x="385" y="115" width="5" height="5" fill="white" />
                    <rect x="385" y="130" width="5" height="5" fill="white" />

                    {/* Data Points */}
                    {data.map((item, index) => {
                        let fillColor = '#fff';
                        if (type === 'scores') {
                            const typeConfig = scoreTypes.find(t => t.id === item.type);
                            fillColor = typeConfig ? typeConfig.color : '#fff';
                        } else if (type === 'puckouts') {
                            fillColor = item.outcome === 'won' ? '#4caf50' : '#ff5252';
                        }

                        return (
                            <circle
                                key={index}
                                cx={item.x}
                                cy={item.y}
                                r="4"
                                fill={fillColor}
                                stroke="black"
                                strokeWidth="0.8"
                            />
                        );
                    })}
                </svg>
            </div>

            {/* Event Summary */}
            {data.length > 0 && (
                <div style={{ marginTop: '8px', padding: '6px 8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <h5 style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#333', marginBottom: '4px', textAlign: 'center' }}>
                        Summary
                    </h5>
                    <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.7rem' }}>
                        {/* Home Team Summary */}
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '2px', fontSize: '0.72rem' }}>Home ({summary.homeTotal})</div>
                            {summary.home.map((item, idx) => (
                                <div key={idx} style={{ color: '#666', lineHeight: '1.3' }}>
                                    {item.type}: {item.count}
                                </div>
                            ))}
                            {summary.homeTotal === 0 && <div style={{ color: '#999', fontSize: '0.65rem' }}>No events</div>}
                        </div>

                        {/* Away Team Summary */}
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '2px', fontSize: '0.72rem' }}>Away ({summary.awayTotal})</div>
                            {summary.away.map((item, idx) => (
                                <div key={idx} style={{ color: '#666', lineHeight: '1.3' }}>
                                    {item.type}: {item.count}
                                </div>
                            ))}
                            {summary.awayTotal === 0 && <div style={{ color: '#999', fontSize: '0.65rem' }}>No events</div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PitchSummary;
