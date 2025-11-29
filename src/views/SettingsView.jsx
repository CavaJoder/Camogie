import React from 'react';
import { useMatch } from '../context/MatchContext';

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
                padding: '12px',
                backgroundColor: disabled ? '#121212' : '#1e1e1e',
                border: '1px solid #333',
                borderRadius: '6px',
                color: disabled ? '#666' : 'white',
                fontSize: '1rem',
                cursor: disabled ? 'not-allowed' : 'text'
            }}
        />
    </div>
);

const SettingsView = () => {
    const { matchInfo, updateMatchInfo, timer, resetMatch } = useMatch();
    const isMatchComplete = timer.quarter === 'FT';

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

        </div>
    );
};

export default SettingsView;
