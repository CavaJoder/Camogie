import React, { useEffect } from 'react';
import { useMatch } from '../context/MatchContext';
import { db } from '../firebase';
import { ref, set, get, child } from 'firebase/database';

const InputGroup = ({ label, value, onChange, type = 'text', disabled }) => (
    <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '8px', fontSize: '0.9rem' }}>
            {label}
        </label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            style={{
                width: '100%',
                padding: type === 'color' ? '4px' : '12px',
                height: type === 'color' ? '48px' : 'auto',
                backgroundColor: type === 'color' ? value : (disabled ? '#121212' : '#1e1e1e'),
                border: '1px solid #333',
                borderRadius: '6px',
                color: disabled ? '#666' : 'white',
                fontSize: '1rem',
                cursor: disabled ? 'not-allowed' : (type === 'color' ? 'pointer' : 'text')
            }}
        />
    </div>
);

const SettingsView = () => {
    const { matchInfo, updateMatchInfo, timer, resetMatch, goLive, stopLive, matchId, isAdmin, matchList, loadMatchList, loadMatch } = useMatch();
    const isMatchComplete = timer.quarter === 'FT';

    useEffect(() => {
        loadMatchList();
    }, []);

    const inspectDatabase = async () => {
        try {
            alert(`Inspecting Master Database root 'matches'...`);
            const snapshot = await get(child(ref(db), 'matches'));
            if (snapshot.exists()) {
                const keys = Object.keys(snapshot.val());
                const preview = keys.map(k => {
                    const m = snapshot.val()[k];
                    return `${k}: ${m.matchInfo?.homeTeam} vs ${m.matchInfo?.awayTeam} `;
                }).join('\n');
                alert(`MATCHES FOUND(${keys.length}): \n\n${preview} `);
                console.log(`MATCHES: `, snapshot.val());
            } else {
                alert(`DATABASE: No 'matches' node found(Empty).`);
            }
        } catch (error) {
            alert(`Error inspecting DB: ${error.message} `);
        }
    };

    const handleImageUpload = (e, field) => {
        if (isMatchComplete) return;
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateMatchInfo(field, reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div style={{ padding: '16px', paddingBottom: '80px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', color: '#bb86fc' }}>Match Configuration</h2>

            {isMatchComplete && (
                <div style={{
                    backgroundColor: 'rgba(207, 102, 121, 0.1)',
                    border: '1px solid #cf6679',
                    color: '#cf6679',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    fontSize: '0.9rem'
                }}>
                    Match is complete. Settings are locked until you reset the match.
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '8px' }}>Home Crest</label>
                    <div style={{
                        width: '150px',
                        height: '150px',
                        backgroundColor: isMatchComplete ? '#121212' : '#1e1e1e',
                        border: '1px dashed #333',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                        opacity: isMatchComplete ? 0.5 : 1
                    }}>
                        {matchInfo.homeCrest ? (
                            <img src={matchInfo.homeCrest} alt="Home" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                            <span style={{ color: '#666' }}>Upload</span>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'homeCrest')}
                            disabled={isMatchComplete}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: isMatchComplete ? 'not-allowed' : 'pointer'
                            }}
                        />
                    </div>
                </div>
                <div>
                    <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '8px' }}>Away Crest</label>
                    <div style={{
                        width: '150px',
                        height: '150px',
                        backgroundColor: isMatchComplete ? '#121212' : '#1e1e1e',
                        border: '1px dashed #333',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                        opacity: isMatchComplete ? 0.5 : 1
                    }}>
                        {matchInfo.awayCrest ? (
                            <img src={matchInfo.awayCrest} alt="Away" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                            <span style={{ color: '#666' }}>Upload</span>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'awayCrest')}
                            disabled={isMatchComplete}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: isMatchComplete ? 'not-allowed' : 'pointer'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <InputGroup
                    label="Home Team Color"
                    type="color"
                    value={matchInfo.homeTeamColor || '#bb86fc'}
                    onChange={(v) => updateMatchInfo('homeTeamColor', v)}
                    disabled={isMatchComplete}
                />
                <InputGroup
                    label="Away Team Color"
                    type="color"
                    value={matchInfo.awayTeamColor || '#bb86fc'}
                    onChange={(v) => updateMatchInfo('awayTeamColor', v)}
                    disabled={isMatchComplete}
                />
            </div>

            <InputGroup
                label="Home Team Name"
                value={matchInfo.homeTeam}
                onChange={(v) => updateMatchInfo('homeTeam', v)}
                disabled={isMatchComplete}
            />
            <InputGroup
                label="Away Team Name"
                value={matchInfo.awayTeam}
                onChange={(v) => updateMatchInfo('awayTeam', v)}
                disabled={isMatchComplete}
            />
            <InputGroup
                label="Date"
                type="date"
                value={matchInfo.date}
                onChange={(v) => updateMatchInfo('date', v)}
                disabled={isMatchComplete}
            />
            <InputGroup
                label="Competition"
                value={matchInfo.competition}
                onChange={(v) => updateMatchInfo('competition', v)}
                disabled={isMatchComplete}
            />
            <InputGroup
                label="Venue"
                value={matchInfo.venue}
                onChange={(v) => updateMatchInfo('venue', v)}
                disabled={isMatchComplete}
            />

            <button
                onClick={() => {
                    if (isMatchComplete) {
                        if (window.confirm('Are you sure you want to reset the match? This will clear all data.')) {
                            resetMatch();
                        }
                    } else {
                        alert('Settings saved successfully!');
                    }
                }}
                style={{
                    width: '100%',
                    backgroundColor: isMatchComplete ? '#cf6679' : '#bb86fc',
                    color: 'black',
                    padding: '16px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    marginTop: '20px',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                {isMatchComplete ? 'Reset Match' : 'Save Settings'}
            </button>

            <hr style={{ borderColor: '#333', margin: '32px 0' }} />

            {/* Load Saved Match Section */}
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#bb86fc' }}>Load Saved Match</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <select
                    id="savedMatchSelect"
                    style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#1e1e1e',
                        border: '1px solid #333',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '1rem'
                    }}
                >
                    <option value="">-- Select a Match to Load --</option>
                    {matchList.map(m => (
                        <option key={m.id} value={m.id}>
                            {m.homeTeam} vs {m.awayTeam} ({m.date}) - {m.id}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => {
                        const selected = document.getElementById('savedMatchSelect').value;
                        if (selected) {
                            if (window.confirm('Load this match? Current unsaved data will be lost.')) {
                                loadMatch(selected);
                            }
                        }
                    }}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#bb86fc',
                        color: 'black',
                        fontWeight: 'bold',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Load
                </button>
                <button
                    onClick={async () => {
                        const testId = "debug_" + Math.floor(Math.random() * 10000);
                        try {
                            if (window.confirm("Create a test match to verify database connection?")) {
                                await set(ref(db, `matches / ${testId} `), {
                                    matchInfo: {
                                        homeTeam: "Debug Home",
                                        awayTeam: "Debug Away",
                                        date: new Date().toISOString().split('T')[0]
                                    },
                                    timestamp: Date.now()
                                });
                                alert(`Success! Created match ${testId}. Refreshing list...`);
                                loadMatchList();
                            }
                        } catch (e) {
                            alert("Firebase Error: " + e.message);
                            console.error(e);
                        }
                    }}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#03dac6',
                        color: 'black',
                        fontWeight: 'bold',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Create Test Match
                </button>
            </div>

            <hr style={{ borderColor: '#333', margin: '32px 0' }} />

            {/* Real-Time Sync Section */}
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#03dac6' }}>Real-Time Sync (Beta)</h3>

            {!matchId ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <button
                        onClick={() => {
                            const newId = Math.random().toString(36).substr(2, 6).toUpperCase();
                            if (window.confirm(`Go Live with Match ID: ${newId}?`)) {
                                goLive(newId, true);
                            }
                        }}
                        style={{
                            padding: '16px',
                            backgroundColor: '#03dac6',
                            color: '#000',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Go Live (Host)
                    </button>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            placeholder="Enter Match ID"
                            id="joinMatchInput"
                            style={{
                                flex: 2,
                                padding: '12px',
                                backgroundColor: '#1e1e1e',
                                border: '1px solid #333',
                                borderRadius: '6px',
                                color: 'white'
                            }}
                        />
                        <button
                            onClick={() => {
                                const id = document.getElementById('joinMatchInput').value.trim();
                                if (id) goLive(id, false);
                            }}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: '#1e1e1e',
                                border: '1px solid #333',
                                color: '#03dac6',
                                fontWeight: 'bold',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            Join
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ backgroundColor: '#1e1e1e', padding: '16px', borderRadius: '8px', border: '1px solid #03dac6' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <span style={{ color: '#b0b0b0' }}>Status: </span>
                        <span style={{ color: '#03dac6', fontWeight: 'bold' }}>● {isAdmin ? 'Broadcasting' : 'Watching'}</span>
                    </div>
                    <div style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>
                        Match ID: <span style={{ fontFamily: 'monospace', backgroundColor: '#333', padding: '4px 8px', borderRadius: '4px' }}>{matchId}</span>
                    </div>
                    <button
                        onClick={() => {
                            if (window.confirm('Disconnect from live session?')) {
                                stopLive();
                            }
                        }}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#cf6679',
                            color: '#000',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Disconnect
                    </button>
                </div>
            )}

            {/* Connection Status Debug */}
            <div style={{ padding: '10px', backgroundColor: '#333', marginBottom: '20px', borderRadius: '8px', fontSize: '0.9rem', color: '#b0b0b0' }}>
                <strong style={{ color: 'white' }}>Connection Status:</strong>
                <div style={{ marginLeft: '10px', marginTop: '5px' }}>
                    <div>Matches Loaded: <span style={{ color: '#03dac6', fontWeight: 'bold' }}>{matchList.length}</span></div>
                    <div>Source: <span style={{ color: '#bb86fc', fontWeight: 'bold' }}>Master Database</span></div>
                </div>
            </div>


            <div style={{ padding: '15px', backgroundColor: '#333', borderRadius: '8px', marginBottom: '20px', border: '1px solid #555' }}>
                <h3 style={{ marginTop: 0, color: '#ff9800' }}>Database Inspector (Advanced)</h3>
                <p style={{ fontSize: '0.8rem', color: '#ccc' }}>Directly check what matches exist in the Master database.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={inspectDatabase}
                        style={{ padding: '10px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1, fontWeight: 'bold' }}
                    >
                        List Matches
                    </button>
                </div>
            </div>

            {/* Match Diagnostics Section */}
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#ffb74d', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Match Diagnostics
                <button
                    onClick={loadMatchList}
                    style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        backgroundColor: '#333',
                        color: 'white',
                        border: '1px solid #555',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Refresh List
                </button>
            </h3>
            <div style={{ padding: '16px', backgroundColor: '#2d2d2d', borderRadius: '8px', border: '1px solid #ffb74d' }}>
                <select
                    id="diagMatchSelect"
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#1e1e1e',
                        border: '1px solid #333',
                        borderRadius: '6px',
                        color: 'white',
                        marginBottom: '10px'
                    }}
                >
                    <option value="">-- Select Match to Diagnose --</option>
                    {matchList.map(m => (
                        <option key={m.id} value={m.id}>
                            {m.homeTeam} vs {m.awayTeam} ({m.date}) - {m.id}
                        </option>
                    ))}
                </select>
                <button
                    onClick={async () => {
                        const id = document.getElementById('diagMatchSelect').value;
                        if (!id) return;
                        const output = document.getElementById('diagOutput');
                        output.innerHTML = "Analyzing...";
                        try {
                            const snapshot = await get(child(ref(db), `matches / ${id} `));
                            if (snapshot.exists()) {
                                const data = snapshot.val();
                                const report = [
                                    `SOURCE: Master DB`,
                                    `Match ID: ${id} `,
                                    `Match Info: ${data.matchInfo ? `Present (${data.matchInfo.homeTeam} vs ${data.matchInfo.awayTeam})` : 'MISSING'} `,
                                    `Stats: ${data.stats ? `Present (Scores: ${Object.keys(data.stats).length} qtrs)` : 'MISSING'} `,
                                    `Pitch Events: ${data.pitchStats ? `Present` : 'MISSING'} `,
                                    `Player Pressure(Heatmap): ${data.playerPressureStats ? `Present (${Array.isArray(data.playerPressureStats) ? data.playerPressureStats.length : Object.keys(data.playerPressureStats).length} players)` : 'MISSING'} `,
                                    `Analysis Data: ${data.playerAnalysis ? 'Present (playerAnalysis)' : (data.playAnalysis ? 'Present (playAnalysis)' : 'MISSING')} `,
                                    `Heatmap: ${data.heatMapEvents ? `Present (Q1:${(data.heatMapEvents.q1 || []).length}, Q2:${(data.heatMapEvents.q2 || []).length}, Q3:${(data.heatMapEvents.q3 || []).length}, Q4:${(data.heatMapEvents.q4 || []).length})` : 'MISSING'} `,
                                    `Timer: ${data.timer ? `Present (${data.timer.quarter})` : 'MISSING'} `
                                ];
                                output.innerHTML = report.join('<br/>');
                            } else {
                                output.innerHTML = "Match ID not found in database.";
                            }
                        } catch (err) {
                            output.innerHTML = "Error: " + err.message;
                        }
                    }}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#ffb74d',
                        color: 'black',
                        fontWeight: 'bold',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Run Diagnostic
                </button>
                <div id="diagOutput" style={{ marginTop: '10px', color: '#ccc', fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.4' }}></div>
            </div>
        </div >
    );
};

export default SettingsView;
