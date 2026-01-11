import React, { useState, useEffect, useRef } from 'react';
import { useSquad } from '../context/SquadContext';
import { Share2, Edit3, Save, Printer, Download, RotateCcw } from 'lucide-react';
import html2pdf from 'html2pdf.js';

// --- SUB-COMPONENTS (Moved outside to prevent re-render focus loss) ---

const RenderInput = ({ label, value, onChange, type = 'text' }) => (
    <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '5px', fontSize: '0.9rem' }}>{label}</label>
        <input
            type={type}
            value={value || ''}
            onChange={onChange}
            style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#2d2d2d',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff'
            }}
        />
    </div>
);

const EditView = ({ matchDetails, setMatchDetails, squads, selectedSquadId, setSelectedSquadId, selectedSquad, assignments, handleAssignment, getAvailablePlayers, setViewMode, handleReset }) => {
    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>
            <h2 style={{ color: '#bb86fc', marginBottom: '20px' }}>Create Team Sheet</h2>

            <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ color: '#fff', margin: 0 }}>1. Match Details</h3>
                    <button
                        onClick={handleReset}
                        style={{
                            backgroundColor: '#cf6679',
                            color: '#000',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <RotateCcw size={14} /> Reset
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <RenderInput
                        label="Opposition"
                        value={matchDetails.opposition}
                        onChange={e => setMatchDetails(prev => ({ ...prev, opposition: e.target.value }))}
                    />
                    <RenderInput
                        label="Match Type"
                        value={matchDetails.matchType}
                        onChange={e => setMatchDetails(prev => ({ ...prev, matchType: e.target.value }))}
                    />
                    <RenderInput
                        label="Date"
                        value={matchDetails.date}
                        type="date"
                        onChange={e => setMatchDetails(prev => ({ ...prev, date: e.target.value }))}
                    />
                    <RenderInput
                        label="Time"
                        value={matchDetails.time}
                        type="time"
                        onChange={e => setMatchDetails(prev => ({ ...prev, time: e.target.value }))}
                    />
                    <RenderInput
                        label="Venue"
                        value={matchDetails.venue}
                        onChange={e => setMatchDetails(prev => ({ ...prev, venue: e.target.value }))}
                    />
                </div>
            </div>

            <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                <h3 style={{ color: '#fff', marginTop: 0 }}>2. Select Squad</h3>
                <select
                    value={selectedSquadId}
                    onChange={e => setSelectedSquadId(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#2d2d2d',
                        border: '1px solid #444',
                        borderRadius: '4px',
                        color: '#fff',
                        marginBottom: '10px'
                    }}
                >
                    <option value="">Choose a Squad...</option>
                    {squads.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                {selectedSquad && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '15px' }}>
                        {selectedSquad.logo && <img src={selectedSquad.logo} alt="Crest" style={{ height: '50px' }} />}
                        <span style={{ color: '#b0b0b0' }}>{selectedSquad.players.length} Players Available</span>
                    </div>
                )}
            </div>

            <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                <h3 style={{ color: '#fff', marginTop: 0 }}>3. Starting Team (1-15)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                    {Array.from({ length: 15 }, (_, i) => i + 1).map(num => (
                        <div key={num} style={{
                            marginBottom: '10px',
                            padding: '10px',
                            backgroundColor: '#1e1e1e',
                            borderRadius: '8px',
                            border: '1px solid #333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <div style={{ fontWeight: 'bold', color: '#bb86fc', width: '30px', textAlign: 'center' }}>{num}</div>
                            <select
                                value={assignments[num]?.id || ''}
                                onChange={(e) => handleAssignment(num, e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    backgroundColor: '#2d2d2d',
                                    border: '1px solid #444',
                                    borderRadius: '4px',
                                    color: '#fff'
                                }}
                            >
                                <option value="">Select Player...</option>
                                {getAvailablePlayers(num).map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.number ? `${p.number}. ` : ''}{p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                <h3 style={{ color: '#fff', marginTop: 0 }}>4. Substitutions (16+)</h3>
                {/* <RenderInput label="Starting Sub Number" value={subStartNumber} onChange={...} /> */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                    {Array.from({ length: 11 }, (_, i) => i + 16).map(num => (
                        <div key={num} style={{
                            marginBottom: '10px',
                            padding: '10px',
                            backgroundColor: '#1e1e1e',
                            borderRadius: '8px',
                            border: '1px solid #333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <div style={{ fontWeight: 'bold', color: '#bb86fc', width: '30px', textAlign: 'center' }}>{num}</div>
                            <select
                                value={assignments[num]?.id || ''}
                                onChange={(e) => handleAssignment(num, e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    backgroundColor: '#2d2d2d',
                                    border: '1px solid #444',
                                    borderRadius: '4px',
                                    color: '#fff'
                                }}
                            >
                                <option value="">Select Player...</option>
                                {getAvailablePlayers(num).map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.number ? `${p.number}. ` : ''}{p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={() => setViewMode('sheet')}
                style={{
                    position: 'fixed',
                    bottom: '80px',
                    right: '20px',
                    backgroundColor: '#4caf50',
                    color: '#000',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '50px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    zIndex: 100
                }}
            >
                <Save size={20} />
                Generate Sheet
            </button>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const JerseyIcon = ({ number, color }) => (
    <div style={{ position: 'relative', width: '50px', height: '50px', display: 'flex', justifyContent: 'center' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.5))' }}>
            <path d="M20,20 L35,10 L65,10 L80,20 L80,40 L70,45 L70,85 L30,85 L30,45 L20,40 Z" fill={color || "#006400"} stroke="#fff" strokeWidth="2" />
        </svg>
        <span style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            marginTop: '2px'
        }}>
            {number}
        </span>
    </div>
);

const SheetView = ({ matchDetails, selectedSquad, assignments, setViewMode }) => {
    const sheetRef = useRef(null);
    const themeColor = selectedSquad?.color || '#006400';

    const handleDownloadPdf = () => {
        const element = sheetRef.current;
        const opt = {
            margin: 0,
            filename: `${matchDetails.teamName}_vs_${matchDetails.opposition || 'Opponent'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
        };
        html2pdf().set(opt).from(element).save();
    };

    const getPlayerDisplay = (pos) => {
        const player = assignments[pos];
        if (!player) return { name: '', club: '' };
        return {
            name: player.name,
            club: player.club || (player.number ? `(${player.number})` : '')
        };
    };

    const PlayerCard = ({ pos }) => {
        const p = getPlayerDisplay(pos);
        if (!p.name) return <div style={{ width: '100px', height: '100px' }}></div>;

        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: '#fff',
                width: '120px'
            }}>
                <JerseyIcon number={pos} color={themeColor} />
                <div style={{
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    marginTop: '2px',
                    textShadow: '1px 1px 2px #000',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                }}>{p.name}</div>
                {p.club && <div style={{ fontSize: '0.7rem', opacity: 0.9, textShadow: '1px 1px 2px #000' }}>{p.club}</div>}
            </div>
        );
    };

    const renderSubs = () => {
        const subs = [];
        for (let i = 16; i <= 26; i++) {
            if (assignments[i]) {
                subs.push({ pos: i, ...assignments[i] });
            }
        }

        if (subs.length === 0) return <div style={{ padding: '10px', color: '#555' }}></div>;

        return subs.map(sub => (
            <div key={sub.pos} style={{ marginBottom: '8px', fontSize: '0.9rem', color: themeColor, fontWeight: 'bold' }}>
                {sub.pos}. {sub.name.toUpperCase()}
            </div>
        ));
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1000,
            backgroundColor: '#525659', // Dark grey background for preview mode
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Toolbar */}
            <div style={{ padding: '10px', backgroundColor: '#333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', zIndex: 10 }} className="no-print">
                <button
                    onClick={() => setViewMode('edit')}
                    style={{
                        backgroundColor: '#555',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    <Edit3 size={16} /> Back to Edit
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handleDownloadPdf}
                        style={{
                            backgroundColor: '#bb86fc',
                            color: '#000',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontWeight: 'bold'
                        }}
                    >
                        <Download size={16} /> Download PDF
                    </button>
                </div>
            </div>

            {/* Scrollable Preview Area */}
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: '40px' }}>
                {/* Printable Area - Fixed A4 Landscape Dimensions (1122px x 793px approx) */}
                <div id="team-sheet-content" ref={sheetRef} style={{
                    width: '1122px',
                    height: '793px',
                    flexShrink: 0,
                    backgroundColor: '#fff',
                    boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>

                    {/* Header */}
                    <div style={{
                        backgroundColor: '#111',
                        color: '#fff',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        borderBottom: '2px solid #fff'
                    }}>
                        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            {matchDetails.teamName || 'HOME TEAM'}
                        </h1>
                    </div>

                    <div style={{ flex: 1, display: 'flex', position: 'relative' }}>

                        {/* Left Sidebar (Details & Crest) */}
                        <div style={{
                            width: '250px',
                            backgroundColor: '#f8f9fa',
                            color: '#000',
                            padding: '15px',
                            borderRight: `4px solid ${themeColor}`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            {selectedSquad?.logo && (
                                <img src={selectedSquad.logo} alt="Crest" style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '20px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />
                            )}

                            <div style={{ textAlign: 'center', width: '100%' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Opposition</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#000' }}>{matchDetails.opposition || 'Away Team'}</div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Competition</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#000' }}>{matchDetails.matchType}</div>
                                </div>

                                <div style={{ borderTop: '1px solid #ccc', margin: '15px 0' }}></div>

                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#333' }}>{matchDetails.venue}</div>
                                </div>

                                <div style={{ marginBottom: '5px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: themeColor }}>
                                        {matchDetails.date ? new Date(matchDetails.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                    </div>
                                </div>

                                <div style={{ border: '2px solid #000', borderRadius: '50px', padding: '5px 15px', display: 'inline-block', marginTop: '10px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{matchDetails.time}</div>
                                </div>
                            </div>
                        </div>

                        {/* Main Pitch Area */}
                        <div style={{
                            flex: 1,
                            background: `linear-gradient(to bottom, ${themeColor} 0%, #000 150%)`, // Gradient using theme color
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '20px'
                        }}>
                            {/* Pitch Lines (Subtle - Compacted) */}
                            <div style={{ position: 'absolute', top: '8%', left: '10%', right: '10%', height: '2px', backgroundColor: 'rgba(255,255,255,0.3)' }}></div>
                            <div style={{ position: 'absolute', top: '28%', left: '5%', right: '5%', height: '2px', backgroundColor: 'rgba(255,255,255,0.3)' }}></div>
                            <div style={{ position: 'absolute', top: '48%', left: '0', right: '0', height: '2px', backgroundColor: 'rgba(255,255,255,0.5)' }}></div>
                            <div style={{ position: 'absolute', top: '68%', left: '5%', right: '5%', height: '2px', backgroundColor: 'rgba(255,255,255,0.3)' }}></div>
                            <div style={{ position: 'absolute', top: '88%', left: '10%', right: '10%', height: '2px', backgroundColor: 'rgba(255,255,255,0.3)' }}></div>

                            {/* Formation Lines */}
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <PlayerCard pos={1} />
                            </div>
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                <PlayerCard pos={2} /> <PlayerCard pos={3} /> <PlayerCard pos={4} />
                            </div>
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                <PlayerCard pos={5} /> <PlayerCard pos={6} /> <PlayerCard pos={7} />
                            </div>
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '20%', alignItems: 'center' }}>
                                <PlayerCard pos={8} /> <PlayerCard pos={9} />
                            </div>
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                <PlayerCard pos={10} /> <PlayerCard pos={11} /> <PlayerCard pos={12} />
                            </div>
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                <PlayerCard pos={13} /> <PlayerCard pos={14} /> <PlayerCard pos={15} />
                            </div>
                        </div>

                        {/* Right Sidebar (Subs) */}
                        <div style={{
                            width: '250px',
                            backgroundColor: '#f8f9fa',
                            borderLeft: `4px solid ${themeColor}`,
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <h3 style={{ color: themeColor, margin: '0 0 15px 0', textTransform: 'uppercase', fontSize: '1.2rem', borderBottom: `2px solid ${themeColor}`, paddingBottom: '5px', textAlign: 'center' }}>Ionadaithe</h3>
                            <div style={{ flex: 1 }}>
                                {renderSubs()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const TeamSheetsView = () => {
    const { squads, getSquad } = useSquad();

    // View State
    const [viewMode, setViewMode] = useState('edit'); // 'edit', 'sheet'

    // Data State
    const [matchDetails, setMatchDetails] = useState({
        date: '',
        time: '',
        venue: '',
        opposition: '',
        matchType: '',
        teamName: ''
    });

    const [selectedSquadId, setSelectedSquadId] = useState('');
    const [assignments, setAssignments] = useState({}); // {1: {player}, 2: {player}... }

    // Load saved state on mount
    useEffect(() => {
        const savedMatchDetails = localStorage.getItem('teamSheet_matchDetails');
        if (savedMatchDetails) setMatchDetails(JSON.parse(savedMatchDetails));

        const savedSquadId = localStorage.getItem('teamSheet_selectedSquadId');
        if (savedSquadId) setSelectedSquadId(savedSquadId);

        const savedAssignments = localStorage.getItem('teamSheet_assignments');
        if (savedAssignments) setAssignments(JSON.parse(savedAssignments));
    }, []);

    // Save state on changes
    useEffect(() => {
        localStorage.setItem('teamSheet_matchDetails', JSON.stringify(matchDetails));
    }, [matchDetails]);

    useEffect(() => {
        localStorage.setItem('teamSheet_selectedSquadId', selectedSquadId);
    }, [selectedSquadId]);

    useEffect(() => {
        localStorage.setItem('teamSheet_assignments', JSON.stringify(assignments));
    }, [assignments]);

    // Derived state
    const selectedSquad = selectedSquadId ? getSquad(selectedSquadId) : null;

    // Initialize squad name when squad selected (only if empty)
    useEffect(() => {
        if (selectedSquad && !matchDetails.teamName) {
            setMatchDetails(prev => ({ ...prev, teamName: selectedSquad.name }));
        }
    }, [selectedSquad]);

    const handleReset = () => {
        if (window.confirm('Clear all Team Sheet data? This cannot be undone.')) {
            const emptyDetails = { date: '', time: '', venue: '', opposition: '', matchType: '', teamName: '' };
            setMatchDetails(emptyDetails);
            setSelectedSquadId('');
            setAssignments({});
            localStorage.removeItem('teamSheet_matchDetails');
            localStorage.removeItem('teamSheet_selectedSquadId');
            localStorage.removeItem('teamSheet_assignments');
        }
    };

    const handleAssignment = (position, playerId) => {
        if (!selectedSquad) return;
        const player = selectedSquad.players.find(p => p.id === playerId);

        setAssignments(prev => ({
            ...prev,
            [position]: player
        }));
    };

    const getAvailablePlayers = (currentPosition) => {
        if (!selectedSquad) return [];
        // Available players are those not assigned to OTHER positions
        // Or if the player is currently assigned to THIS position (so we can keep selected)
        return selectedSquad.players.filter(p => {
            const isAssigned = Object.entries(assignments).some(([pos, assignedPlayer]) => {
                return assignedPlayer.id === p.id && parseInt(pos) !== currentPosition;
            });
            return !isAssigned;
        }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    };

    return (
        <div style={{ height: '100%', overflow: 'hidden' }}>
            {viewMode === 'edit' ? (
                <div style={{ height: '100%', overflow: 'auto' }}>
                    <EditView
                        matchDetails={matchDetails}
                        setMatchDetails={setMatchDetails}
                        squads={squads}
                        selectedSquadId={selectedSquadId}
                        setSelectedSquadId={setSelectedSquadId}
                        selectedSquad={selectedSquad}
                        assignments={assignments}
                        handleAssignment={handleAssignment}
                        getAvailablePlayers={getAvailablePlayers}
                        setViewMode={setViewMode}
                        handleReset={handleReset}
                    />
                </div>
            ) : (
                <SheetView
                    matchDetails={matchDetails}
                    selectedSquad={selectedSquad}
                    assignments={assignments}
                    setViewMode={setViewMode}
                />
            )}
        </div>
    );
};

export default TeamSheetsView;
