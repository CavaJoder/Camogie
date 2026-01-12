import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { Download } from 'lucide-react';
import { useMatch } from '../context/MatchContext';
import ManualMatchReport from '../components/ManualMatchReport';

const ManualEntryView = () => {
    const { matchInfo, manualStats, manualPitchEvents, updateManualStat, addManualPitchEvent, undoManualPitchEvent } = useMatch();
    const [entryMode, setEntryMode] = useState('quarters'); // 'quarters' or 'halves'
    const [selectedQuarter, setSelectedQuarter] = useState('q1');
    const [activeSubTab, setActiveSubTab] = useState('stats'); // 'stats', 'scores', 'puckouts'
    const [isPdfMode, setIsPdfMode] = useState(false);

    // Score/Puckout Selection State
    const [selectedScoreType, setSelectedScoreType] = useState(null);
    const [selectedScoreTeam, setSelectedScoreTeam] = useState('home');
    const [selectedPuckoutOutcome, setSelectedPuckoutOutcome] = useState(null);
    const [selectedPuckoutTeam, setSelectedPuckoutTeam] = useState('home');

    const quarters = ['q1', 'q2', 'q3', 'q4'];
    const halves = [
        { id: 'q1', label: '1st Half' },
        { id: 'q3', label: '2nd Half' }
    ];

    const scoreTypes = [
        { id: 'point', label: 'Point', color: '#ffff00' },
        { id: 'goal', label: 'Goal', color: '#000000' },
        { id: 'wide', label: 'Wide', color: '#f44336' },
        { id: '45', label: '45', color: '#ff9800' },
        { id: 'free', label: 'Free', color: '#2196f3' },
        { id: 'penalty', label: 'Penalty', color: '#9c27b0' }
    ];

    const updateStat = (key, value) => {
        updateManualStat(selectedQuarter, key, value);
    };

    const handleScoreClick = (e, targetQuarter) => {
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
            quarter: targetQuarter
        };

        addManualPitchEvent(targetQuarter, 'scores', newScore);
    };

    const handlePuckoutClick = (e, targetQuarter) => {
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
            quarter: targetQuarter
        };

        addManualPitchEvent(targetQuarter, 'puckouts', newPuckout);
    };

    const generatePDF = () => {
        setIsPdfMode(true);
        setTimeout(() => {
            const element = document.getElementById('printableStats');
            const opt = {
                margin: 10,
                filename: `Manual_Match_Analysis_${matchInfo.homeTeam}_vs_${matchInfo.awayTeam}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };
            html2pdf().set(opt).from(element).save().then(() => setIsPdfMode(false));
        }, 500);
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
                { id: 'defRuck', label: 'Defensive Ruck' },
                { id: 'defRuckWon', label: 'Def Ruck Won' },
                { id: 'midRuck', label: 'Middle Third Ruck' },
                { id: 'midRuckWon', label: 'Mid Ruck Won' },
                { id: 'offRuck', label: 'Offensive Ruck' },
                { id: 'offRuckWon', label: 'Off Ruck Won' }
            ]
        },
        {
            title: 'Shots & Scores',
            fields: [
                { id: 'ballInside65', label: 'Ball Inside 65' },
                { id: 'shotTaken', label: 'Shot Taken' },
                { id: 'score', label: 'Score from Play' },
                { id: 'wide', label: 'Wide' },
                { id: 'short', label: 'Short' },
                { id: 'saved', label: 'Saved' },
                { id: 'offPost', label: 'Off Post' },
                { id: 'freeWon', label: 'Free Won' },
                { id: '45Won', label: '45 Won' },
                { id: 'penaltyWon', label: 'Penalty Won' },
                { id: 'scoreFree', label: 'Score from Free' },
                { id: 'penalty', label: 'Score from Penalty' },
                { id: 'score45', label: 'Score 45' },
                { id: 'shot65', label: 'Shot from > 65' },
                { id: 'wide65', label: 'Wide from > 65' },
                { id: 'point65', label: 'Point from > 65' }
            ]
        },
        {
            title: 'Puckouts',
            fields: [
                { id: 'oppPuckout', label: 'Opp Puckout' },
                { id: 'oppPuckoutWon', label: 'Opp Puckout Won' },
                { id: 'ownPuckout', label: 'Own Puckout' },
                { id: 'ownPuckoutWon', label: 'Own Puckout Won' }
            ]
        },
        {
            title: 'Frees Conceded',
            fields: [
                { id: 'freeConcededHome', label: `${matchInfo.homeTeam || 'Home'} Conceded` },
                { id: 'freeConcededAway', label: `${matchInfo.awayTeam || 'Away'} Conceded` }
            ]
        }
    ];

    if (!matchInfo) return <div style={{ padding: '20px', color: '#fff' }}>Loading match info...</div>;

    const PitchMap = ({ type, quarterId, onClick, children }) => (
        <svg viewBox="0 0 400 250" onClick={(e) => onClick(e, quarterId)} style={{ width: '100%', border: '2px solid #333', borderRadius: '8px', backgroundColor: '#1a4d1a', cursor: (type === 'scores' ? selectedScoreType : selectedPuckoutOutcome) ? 'crosshair' : 'not-allowed' }}>
            <defs>
                <pattern id={`grassStripes-${type}-${quarterId}`} x="0" y="0" width="16" height="250" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="8" height="250" fill="#1a5c1a" />
                    <rect x="8" y="0" width="8" height="250" fill="#1a4d1a" />
                </pattern>
            </defs>
            <rect x="0" y="0" width="400" height="250" fill={`url(#grassStripes-${type}-${quarterId})`} />
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
            {children}
        </svg>
    );

    return (
        <div style={{ padding: '20px', paddingBottom: '80px', color: '#fff' }}>
            <h2 style={{ color: '#bb86fc', fontSize: '1.2rem', marginBottom: '20px' }}>Manual Entry</h2>

            {/* Entry Mode Toggle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', backgroundColor: '#1e1e1e', borderRadius: '8px', padding: '4px', gap: '4px' }}>
                    <button
                        onClick={() => { setEntryMode('quarters'); setSelectedQuarter('q1'); }}
                        style={{
                            padding: '8px 24px',
                            backgroundColor: entryMode === 'quarters' ? '#bb86fc' : 'transparent',
                            color: entryMode === 'quarters' ? '#000' : '#b0b0b0',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Quarters
                    </button>
                    <button
                        onClick={() => { setEntryMode('halves'); setSelectedQuarter('q1'); }}
                        style={{
                            padding: '8px 24px',
                            backgroundColor: entryMode === 'halves' ? '#bb86fc' : 'transparent',
                            color: entryMode === 'halves' ? '#000' : '#b0b0b0',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Halves
                    </button>
                </div>
            </div>

            {/* Period Selection */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {entryMode === 'quarters' ? (
                    quarters.map(q => (
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
                    ))
                ) : (
                    halves.map(h => (
                        <button
                            key={h.id}
                            onClick={() => setSelectedQuarter(h.id)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                backgroundColor: selectedQuarter === h.id ? '#bb86fc' : '#2d2d2d',
                                color: selectedQuarter === h.id ? '#000' : '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}
                        >
                            {h.label}
                        </button>
                    ))
                )}
            </div>

            {/* Sub Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #333', marginBottom: '20px', overflowX: 'auto' }}>
                {['stats', 'scores', 'puckouts'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'transparent',
                            color: activeSubTab === tab ? '#03dac6' : '#b0b0b0',
                            borderBottom: activeSubTab === tab ? '2px solid #03dac6' : 'none',
                            border: 'none',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab === 'stats' ? 'Stats Form' : tab === 'scores' ? 'Score Map' : 'Puckout Map'}
                    </button>
                ))}
            </div>

            {/* Stats Content Area */}
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

            {/* Scores Content Area */}
            {activeSubTab === 'scores' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4 style={{ color: '#b0b0b0', margin: 0 }}>Score Recording</h4>
                        <button
                            onClick={() => undoManualPitchEvent(selectedQuarter, 'scores')}
                            style={{ padding: '6px 12px', backgroundColor: '#cf6679', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}
                        >
                            Undo Last
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                        <button onClick={() => setSelectedScoreTeam('home')} style={{ padding: '10px', backgroundColor: selectedScoreTeam === 'home' ? (matchInfo.homeTeamColor || '#bb86fc') : '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}>{matchInfo.homeTeam || 'Home'}</button>
                        {scoreTypes.map(type => (
                            <button key={type.id} onClick={() => setSelectedScoreType(type.id)} style={{ padding: '10px', backgroundColor: selectedScoreType === type.id ? type.color : '#2a2a2a', color: selectedScoreType === type.id && type.id === 'point' ? '#000' : '#fff', border: '1px solid #444', borderRadius: '4px' }}>{type.label}</button>
                        ))}
                        <button onClick={() => setSelectedScoreTeam('away')} style={{ padding: '10px', backgroundColor: selectedScoreTeam === 'away' ? (matchInfo.awayTeamColor || '#bb86fc') : '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}>{matchInfo.awayTeam || 'Away'}</button>
                    </div>

                    <div style={{ display: entryMode === 'quarters' ? 'block' : 'grid', gridTemplateColumns: entryMode === 'quarters' ? '1fr' : '1fr 1fr', gap: '20px' }}>
                        {entryMode === 'quarters' ? (
                            <PitchMap type="scores" quarterId={selectedQuarter} onClick={handleScoreClick}>
                                {manualPitchEvents[selectedQuarter].scores.filter(s => s && s.team === selectedScoreTeam).map(score => {
                                    const typeConfig = scoreTypes.find(t => t.id === score.type);
                                    return <circle key={score.id} cx={score.x} cy={score.y} r="3" fill={typeConfig ? typeConfig.color : '#fff'} stroke="black" strokeWidth="0.5" />;
                                })}
                            </PitchMap>
                        ) : (
                            <>
                                <div>
                                    <h4 style={{ textAlign: 'center', marginBottom: '10px', color: '#b0b0b0' }}>1st Half</h4>
                                    <PitchMap type="scores" quarterId="q1" onClick={handleScoreClick}>
                                        {manualPitchEvents.q1.scores.filter(s => s && s.team === selectedScoreTeam).map(score => {
                                            const typeConfig = scoreTypes.find(t => t.id === score.type);
                                            return <circle key={score.id} cx={score.x} cy={score.y} r="3" fill={typeConfig ? typeConfig.color : '#fff'} stroke="black" strokeWidth="0.5" />;
                                        })}
                                    </PitchMap>
                                </div>
                                <div>
                                    <h4 style={{ textAlign: 'center', marginBottom: '10px', color: '#b0b0b0' }}>2nd Half</h4>
                                    <PitchMap type="scores" quarterId="q3" onClick={handleScoreClick}>
                                        {manualPitchEvents.q3.scores.filter(s => s && s.team === selectedScoreTeam).map(score => {
                                            const typeConfig = scoreTypes.find(t => t.id === score.type);
                                            return <circle key={score.id} cx={score.x} cy={score.y} r="3" fill={typeConfig ? typeConfig.color : '#fff'} stroke="black" strokeWidth="0.5" />;
                                        })}
                                    </PitchMap>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Puckouts Content Area */}
            {activeSubTab === 'puckouts' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4 style={{ color: '#b0b0b0', margin: 0 }}>Puckout Recording</h4>
                        <button
                            onClick={() => undoManualPitchEvent(selectedQuarter, 'puckouts')}
                            style={{ padding: '6px 12px', backgroundColor: '#cf6679', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}
                        >
                            Undo Last
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                        <button onClick={() => setSelectedPuckoutTeam('home')} style={{ padding: '10px', backgroundColor: selectedPuckoutTeam === 'home' ? (matchInfo.homeTeamColor || '#bb86fc') : '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}>{matchInfo.homeTeam || 'Home'}</button>
                        <button onClick={() => setSelectedPuckoutTeam('away')} style={{ padding: '10px', backgroundColor: selectedPuckoutTeam === 'away' ? (matchInfo.awayTeamColor || '#bb86fc') : '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}>{matchInfo.awayTeam || 'Away'}</button>
                        <button onClick={() => setSelectedPuckoutOutcome('won')} style={{ padding: '10px', backgroundColor: selectedPuckoutOutcome === 'won' ? '#4caf50' : '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}>Won</button>
                        <button onClick={() => setSelectedPuckoutOutcome('lost')} style={{ padding: '10px', backgroundColor: selectedPuckoutOutcome === 'lost' ? '#f44336' : '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}>Lost</button>
                    </div>

                    <div style={{ display: entryMode === 'quarters' ? 'block' : 'grid', gridTemplateColumns: entryMode === 'quarters' ? '1fr' : '1fr 1fr', gap: '20px' }}>
                        {entryMode === 'quarters' ? (
                            <PitchMap type="puckouts" quarterId={selectedQuarter} onClick={handlePuckoutClick}>
                                {manualPitchEvents[selectedQuarter].puckouts.filter(p => p && p.team === selectedPuckoutTeam).map(puckout => (
                                    <circle key={puckout.id} cx={puckout.x} cy={puckout.y} r="3" fill={puckout.outcome === 'won' ? '#4caf50' : '#f44336'} stroke="black" strokeWidth="0.5" />
                                ))}
                            </PitchMap>
                        ) : (
                            <>
                                <div>
                                    <h4 style={{ textAlign: 'center', marginBottom: '10px', color: '#b0b0b0' }}>1st Half</h4>
                                    <PitchMap type="puckouts" quarterId="q1" onClick={handlePuckoutClick}>
                                        {manualPitchEvents.q1.puckouts.filter(p => p && p.team === selectedPuckoutTeam).map(puckout => (
                                            <circle key={puckout.id} cx={puckout.x} cy={puckout.y} r="3" fill={puckout.outcome === 'won' ? '#4caf50' : '#f44336'} stroke="black" strokeWidth="0.5" />
                                        ))}
                                    </PitchMap>
                                </div>
                                <div>
                                    <h4 style={{ textAlign: 'center', marginBottom: '10px', color: '#b0b0b0' }}>2nd Half</h4>
                                    <PitchMap type="puckouts" quarterId="q3" onClick={handlePuckoutClick}>
                                        {manualPitchEvents.q3.puckouts.filter(p => p && p.team === selectedPuckoutTeam).map(puckout => (
                                            <circle key={puckout.id} cx={puckout.x} cy={puckout.y} r="3" fill={puckout.outcome === 'won' ? '#4caf50' : '#f44336'} stroke="black" strokeWidth="0.5" />
                                        ))}
                                    </PitchMap>
                                </div>
                            </>
                        )}
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
            <ManualMatchReport isPdfMode={isPdfMode} periodMode={entryMode} />
        </div>
    );
};

export default ManualEntryView;
