import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { Download } from 'lucide-react';
import { useMatch } from '../context/MatchContext';
import PitchSummary from '../components/PitchSummary';

const ManualEntryView = () => {
    const { matchInfo, manualStats, manualPitchEvents, updateManualStat, addManualPitchEvent } = useMatch();
    const [selectedQuarter, setSelectedQuarter] = useState('q1');
    const [activeSubTab, setActiveSubTab] = useState('stats'); // 'stats', 'scores', 'puckouts'
    const [isPdfMode, setIsPdfMode] = useState(false);

    // Score/Puckout Selection State
    const [selectedScoreType, setSelectedScoreType] = useState(null);
    const [selectedScoreTeam, setSelectedScoreTeam] = useState('home');
    const [selectedPuckoutOutcome, setSelectedPuckoutOutcome] = useState(null);
    const [selectedPuckoutTeam, setSelectedPuckoutTeam] = useState('home');

    const quarters = ['q1', 'q2', 'q3', 'q4'];

    const scoreTypes = [
        { id: 'point', label: 'Point', color: '#fff' },
        { id: 'goal', label: 'Goal', color: '#000000' },
        { id: 'wide', label: 'Wide', color: '#f44336' },
        { id: '45', label: '45', color: '#ff9800' },
        { id: 'free', label: 'Free', color: '#2196f3' },
        { id: 'penalty', label: 'Penalty', color: '#9c27b0' }
    ];

    const updateStat = (key, value) => {
        updateManualStat(selectedQuarter, key, value);
    };

    const getStat = (q, key) => manualStats[q]?.[key] || 0;

    const handleScoreClick = (e) => {
        if (!selectedScoreType) {
            alert('Please select a score type first');
            return;
        }
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 400;
        const y = ((e.clientY - rect.top) / rect.height) * 250;

        const newScore = {
            id: Date.now(),
            x, y,
            type: selectedScoreType,
            team: selectedScoreTeam,
            quarter: selectedQuarter
        };

        addManualPitchEvent(selectedQuarter, 'scores', newScore);
    };

    const handlePuckoutClick = (e) => {
        if (!selectedPuckoutOutcome) {
            alert('Please select an outcome first');
            return;
        }
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 400;
        const y = ((e.clientY - rect.top) / rect.height) * 250;

        const newPuckout = {
            id: Date.now(),
            x, y,
            outcome: selectedPuckoutOutcome,
            team: selectedPuckoutTeam,
            quarter: selectedQuarter
        };

        addManualPitchEvent(selectedQuarter, 'puckouts', newPuckout);
    };

    // Configuration of fields to enter
    const sections = [
        {
            title: 'Possession & Pressure',
            fields: [
                { id: 'oppPossessions', label: 'Opp Possessions' },
                { id: 'pressures', label: 'Pressures' },
                { id: 'freesAgainst', label: 'Frees Against' },
                { id: 'turnovers', label: 'Turnovers' }
            ]
        },
        {
            title: 'Rucks',
            fields: [
                { id: 'defRuck', label: 'Defensive Ruck Total' },
                { id: 'defRuckWon', label: 'Defensive Ruck Won' },
                { id: 'midRuck', label: 'Middle Ruck Total' },
                { id: 'midRuckWon', label: 'Middle Ruck Won' },
                { id: 'offRuck', label: 'Offensive Ruck Total' },
                { id: 'offRuckWon', label: 'Offensive Ruck Won' }
            ]
        },
        {
            title: 'Shots & Scores',
            fields: [
                { id: 'ballInside65', label: 'Ball Inside 65' },
                { id: 'shotTaken', label: 'Shot Taken' },
                { id: 'score', label: 'Score' },
                { id: 'wide', label: 'Wide' },
                { id: 'short', label: 'Short' },
                { id: 'saved', label: 'Saved' },
                { id: 'freeWon', label: 'Free Won' },
                { id: '45Won', label: '45 Won' }
            ]
        },
        {
            title: 'Puckouts',
            fields: [
                { id: 'oppPuckout', label: 'Opp Puckout Total' },
                { id: 'oppPuckoutWon', label: 'Opp Puckout Won' },
                { id: 'ownPuckout', label: 'Own Puckout Total' },
                { id: 'ownPuckoutWon', label: 'Own Puckout Won' }
            ]
        }
    ];

    // --- PDF Generation Logic ---
    const generatePDF = () => {
        setIsPdfMode(true);
        setTimeout(() => {
            const element = document.getElementById('manual-pdf-content');
            const opt = {
                margin: 10,
                filename: `Manual_Match_Analysis.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };
            html2pdf().set(opt).from(element).save().then(() => setIsPdfMode(false));
        }, 500);
    };

    // Helper for PDF rendering
    const sumStats = (statId) => {
        return quarters.reduce((total, q) => total + getStat(q, statId), 0);
    };

    const StatRow = ({ label, statId }) => {
        const q1 = getStat('q1', statId);
        const q2 = getStat('q2', statId);
        const q3 = getStat('q3', statId);
        const q4 = getStat('q4', statId);
        const total = q1 + q2 + q3 + q4;

        return (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '8px 0', borderBottom: '1px solid #ddd', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 'bold' }}>{label}</span>
                <span style={{ textAlign: 'center' }}>{q1}</span>
                <span style={{ textAlign: 'center' }}>{q2}</span>
                <span style={{ textAlign: 'center' }}>{q3}</span>
                <span style={{ textAlign: 'center' }}>{q4}</span>
                <span style={{ textAlign: 'center', fontWeight: 'bold' }}>{total}</span>
            </div>
        );
    };

    // Split for Half-time summaries
    const firstHalfScores = [...manualPitchEvents.q1.scores, ...manualPitchEvents.q2.scores];
    const secondHalfScores = [...manualPitchEvents.q3.scores, ...manualPitchEvents.q4.scores];
    const firstHalfPuckouts = [...manualPitchEvents.q1.puckouts, ...manualPitchEvents.q2.puckouts];
    const secondHalfPuckouts = [...manualPitchEvents.q3.puckouts, ...manualPitchEvents.q4.puckouts];

    if (!matchInfo) return <div style={{ padding: '20px', color: '#fff' }}>Loading match info...</div>;

    return (
        <div style={{ padding: '20px', paddingBottom: '80px', color: '#fff' }}>
            <h2 style={{ color: '#bb86fc', fontSize: '1.2rem', marginBottom: '20px' }}>Manual Entry</h2>

            {/* Quarter Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {quarters.map(q => (
                    <button
                        key={q}
                        onClick={() => setSelectedQuarter(q)}
                        style={{
                            flex: 1,
                            padding: '10px',
                            backgroundColor: selectedQuarter === q ? '#bb86fc' : '#2d2d2d',
                            color: selectedQuarter === q ? '#000' : '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                        }}
                    >
                        {q}
                    </button>
                ))}
            </div>

            {/* Sub Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #333', marginBottom: '20px' }}>
                <button
                    onClick={() => setActiveSubTab('stats')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: 'transparent',
                        color: activeSubTab === 'stats' ? '#03dac6' : '#b0b0b0',
                        borderBottom: activeSubTab === 'stats' ? '2px solid #03dac6' : 'none',
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Stats Form
                </button>
                <button
                    onClick={() => setActiveSubTab('scores')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: 'transparent',
                        color: activeSubTab === 'scores' ? '#03dac6' : '#b0b0b0',
                        borderBottom: activeSubTab === 'scores' ? '2px solid #03dac6' : 'none',
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Score Map
                </button>
                <button
                    onClick={() => setActiveSubTab('puckouts')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: 'transparent',
                        color: activeSubTab === 'puckouts' ? '#03dac6' : '#b0b0b0',
                        borderBottom: activeSubTab === 'puckouts' ? '2px solid #03dac6' : 'none',
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Puckout Map
                </button>
            </div>

            {/* Content Area */}
            {activeSubTab === 'stats' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {sections.map(section => (
                        <div key={section.title} style={{ backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '8px' }}>
                            <h3 style={{ color: '#03dac6', fontSize: '1rem', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
                                {section.title}
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                {section.fields.map(field => (
                                    <div key={field.id}>
                                        <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.8rem', marginBottom: '5px' }}>
                                            {field.label}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={manualStats[selectedQuarter][field.id] || ''}
                                            onChange={(e) => updateStat(field.id, e.target.value)}
                                            placeholder="0"
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                backgroundColor: '#2d2d2d',
                                                border: '1px solid #444',
                                                borderRadius: '4px',
                                                color: '#fff',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeSubTab === 'scores' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                        <button onClick={() => setSelectedScoreTeam('home')} style={{ padding: '10px', backgroundColor: selectedScoreTeam === 'home' ? (matchInfo.homeTeamColor || '#bb86fc') : '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}>{matchInfo.homeTeam || 'Home'}</button>
                        {scoreTypes.slice(0, 3).map(type => (
                            <button key={type.id} onClick={() => setSelectedScoreType(type.id)} style={{ padding: '10px', backgroundColor: selectedScoreType === type.id ? type.color : '#2a2a2a', color: selectedScoreType === type.id && type.id === 'point' ? '#000' : '#fff', border: '1px solid #444', borderRadius: '4px' }}>{type.label}</button>
                        ))}
                        <button onClick={() => setSelectedScoreTeam('away')} style={{ padding: '10px', backgroundColor: selectedScoreTeam === 'away' ? (matchInfo.awayTeamColor || '#bb86fc') : '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}>{matchInfo.awayTeam || 'Away'}</button>
                        {scoreTypes.slice(3).map(type => (
                            <button key={type.id} onClick={() => setSelectedScoreType(type.id)} style={{ padding: '10px', backgroundColor: selectedScoreType === type.id ? type.color : '#2a2a2a', color: selectedScoreType === type.id && type.id === 'point' ? '#000' : '#fff', border: '1px solid #444', borderRadius: '4px' }}>{type.label}</button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <svg viewBox="0 0 400 250" onClick={handleScoreClick} style={{ width: '100%', maxWidth: '600px', border: '2px solid #333', borderRadius: '8px', backgroundColor: '#1a4d1a', cursor: selectedScoreType ? 'crosshair' : 'not-allowed' }}>
                            {/* Grass Stripes Pattern */}
                            <defs>
                                <pattern id="grassStripesScores" x="0" y="0" width="16" height="250" patternUnits="userSpaceOnUse">
                                    <rect x="0" y="0" width="8" height="250" fill="#1a5c1a" />
                                    <rect x="8" y="0" width="8" height="250" fill="#1a4d1a" />
                                </pattern>
                            </defs>
                            <rect x="0" y="0" width="400" height="250" fill="url(#grassStripesScores)" />
                            <rect x="15" y="15" width="370" height="220" fill="none" stroke="white" strokeWidth="2.5" />
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
                            {manualPitchEvents[selectedQuarter].scores.filter(s => s.team === selectedScoreTeam).map(score => {
                                const typeConfig = scoreTypes.find(t => t.id === score.type);
                                return <circle key={score.id} cx={score.x} cy={score.y} r="3" fill={typeConfig ? typeConfig.color : '#fff'} stroke="black" strokeWidth="0.5" />;
                            })}
                        </svg>
                    </div>
                </div>
            )}

            {activeSubTab === 'puckouts' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 2fr', gap: '10px', marginBottom: '20px' }}>
                        <button onClick={() => setSelectedPuckoutTeam('home')} style={{ padding: '10px', backgroundColor: selectedPuckoutTeam === 'home' ? (matchInfo.homeTeamColor || '#bb86fc') : '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}>{matchInfo.homeTeam || 'Home'}</button>
                        <button onClick={() => setSelectedPuckoutTeam('away')} style={{ padding: '10px', backgroundColor: selectedPuckoutTeam === 'away' ? (matchInfo.awayTeamColor || '#bb86fc') : '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}>{matchInfo.awayTeam || 'Away'}</button>
                        <button onClick={() => setSelectedPuckoutOutcome('won')} style={{ padding: '10px', backgroundColor: selectedPuckoutOutcome === 'won' ? '#4caf50' : '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}>Won</button>
                        <button onClick={() => setSelectedPuckoutOutcome('lost')} style={{ padding: '10px', backgroundColor: selectedPuckoutOutcome === 'lost' ? '#f44336' : '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}>Lost</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <svg viewBox="0 0 400 250" onClick={handlePuckoutClick} style={{ width: '100%', maxWidth: '600px', border: '2px solid #333', borderRadius: '8px', backgroundColor: '#1a4d1a', cursor: selectedPuckoutOutcome ? 'crosshair' : 'not-allowed' }}>
                            <defs>
                                <pattern id="grassStripesPuckouts" x="0" y="0" width="16" height="250" patternUnits="userSpaceOnUse">
                                    <rect x="0" y="0" width="8" height="250" fill="#1a5c1a" />
                                    <rect x="8" y="0" width="8" height="250" fill="#1a4d1a" />
                                </pattern>
                            </defs>
                            <rect x="0" y="0" width="400" height="250" fill="url(#grassStripesPuckouts)" />
                            <rect x="15" y="15" width="370" height="220" fill="none" stroke="white" strokeWidth="2.5" />
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
                            {manualPitchEvents[selectedQuarter].puckouts.filter(p => p.team === selectedPuckoutTeam).map(puckout => (
                                <circle key={puckout.id} cx={puckout.x} cy={puckout.y} r="3" fill={puckout.outcome === 'won' ? '#4caf50' : '#f44336'} stroke="black" strokeWidth="0.5" />
                            ))}
                        </svg>
                    </div>
                </div>
            )}

            <button
                onClick={generatePDF}
                style={{
                    width: '100%',
                    backgroundColor: '#bb86fc',
                    color: 'black',
                    padding: '16px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    marginTop: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                }}
            >
                <Download size={20} />
                {isPdfMode ? 'Generating...' : 'Download Manual Report PDF'}
            </button>

            {/* Hidden PDF Content */}
            {isPdfMode && (
                <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                    <div id="manual-pdf-content" style={{
                        padding: '20px',
                        backgroundColor: 'white',
                        color: 'black',
                        width: '210mm',
                        minHeight: '297mm'
                    }}>
                        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Manual Match Analysis</h1>

                        {/* Summary Cards Section (Simplified for PDF) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                <h3>Pressures</h3>
                                <div>Total: {sumStats('pressures')}</div>
                                <div>Turnovers: {sumStats('turnovers')}</div>
                            </div>
                            <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                <h3>Shots</h3>
                                <div>Total: {sumStats('shotTaken')}</div>
                                <div>Scores: {sumStats('score')}</div>
                            </div>
                        </div>

                        {/* Detailed Stats Tables */}
                        <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '5px', marginTop: '20px' }}>Detailed Statistics</h2>

                        {sections.map(section => (
                            <div key={section.title} style={{ marginBottom: '20px' }}>
                                <h3 style={{ color: '#333', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>{section.title}</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '5px' }}>
                                    <span>Metric</span>
                                    <span style={{ textAlign: 'center' }}>Q1</span>
                                    <span style={{ textAlign: 'center' }}>Q2</span>
                                    <span style={{ textAlign: 'center' }}>Q3</span>
                                    <span style={{ textAlign: 'center' }}>Q4</span>
                                    <span style={{ textAlign: 'center' }}>Total</span>
                                </div>
                                {section.fields.map(field => (
                                    <StatRow key={field.id} label={field.label} statId={field.id} />
                                ))}
                            </div>
                        ))}

                        {/* Pitch Summaries for PDF */}
                        <div style={{ marginTop: '40px', pageBreakBefore: 'always' }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Pitch Maps - 1st Half</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>HOME: {matchInfo.homeTeam} Scores</h3>
                                    <PitchSummary data={firstHalfScores.filter(s => s.team === 'home')} type="scores" />
                                </div>
                                <div>
                                    <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>AWAY: {matchInfo.awayTeam} Scores</h3>
                                    <PitchSummary data={firstHalfScores.filter(s => s.team === 'away')} type="scores" />
                                </div>
                                <div>
                                    <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>HOME: {matchInfo.homeTeam} Puckouts</h3>
                                    <PitchSummary data={firstHalfPuckouts.filter(p => p.team === 'home')} type="puckouts" />
                                </div>
                                <div>
                                    <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>AWAY: {matchInfo.awayTeam} Puckouts</h3>
                                    <PitchSummary data={firstHalfPuckouts.filter(p => p.team === 'away')} type="puckouts" />
                                </div>
                            </div>
                        </div>

                        <div className="html2pdf__page-break"></div>
                        <div style={{ marginTop: '40px' }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Pitch Maps - 2nd Half</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>HOME: {matchInfo.homeTeam} Scores</h3>
                                    <PitchSummary data={secondHalfScores.filter(s => s.team === 'home')} type="scores" />
                                </div>
                                <div>
                                    <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>AWAY: {matchInfo.awayTeam} Scores</h3>
                                    <PitchSummary data={secondHalfScores.filter(s => s.team === 'away')} type="scores" />
                                </div>
                                <div>
                                    <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>HOME: {matchInfo.homeTeam} Puckouts</h3>
                                    <PitchSummary data={secondHalfPuckouts.filter(p => p.team === 'home')} type="puckouts" />
                                </div>
                                <div>
                                    <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>AWAY: {matchInfo.awayTeam} Puckouts</h3>
                                    <PitchSummary data={secondHalfPuckouts.filter(p => p.team === 'away')} type="puckouts" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManualEntryView;
