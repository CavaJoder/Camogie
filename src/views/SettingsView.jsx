import React from 'react';
import { useMatch } from '../context/MatchContext';

const InputGroup = ({ label, value, onChange, type = 'text' }) => (
    <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '8px', fontSize: '0.9rem' }}>
            {label}
        </label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                width: '100%',
                padding: type === 'color' ? '4px' : '12px',
                height: type === 'color' ? '48px' : 'auto',
                backgroundColor: type === 'color' ? value : '#1e1e1e',
                border: '1px solid #333',
                borderRadius: '6px',
                color: 'white',
                fontSize: '1rem',
                cursor: type === 'color' ? 'pointer' : 'text'
            }}
        />
    </div>
);

const SettingsView = () => {
    const { matchInfo, updateMatchInfo, resetApp } = useMatch();

    const handleImageUpload = (e, field) => {
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
        <div style={{ padding: '16px', paddingBottom: '80px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: '#fff', fontWeight: 'bold' }}>Settings</h2>

            <div style={{ marginBottom: '32px' }}>
                <h3 style={{ color: '#bb86fc', fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                    Team Configuration
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Home Team */}
                    <div>
                        <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                margin: '0 auto',
                                backgroundColor: '#1e1e1e',
                                border: '1px dashed #333',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                {matchInfo.homeCrest ? (
                                    <img src={matchInfo.homeCrest} alt="Home" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <span style={{ color: '#666', fontSize: '0.8rem' }}>Upload Crest</span>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'homeCrest')}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        opacity: 0,
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>
                        </div>
                        <InputGroup
                            label="Home Team"
                            value={matchInfo.homeTeam}
                            onChange={(v) => updateMatchInfo('homeTeam', v)}
                        />
                        <InputGroup
                            label="Color"
                            type="color"
                            value={matchInfo.homeTeamColor || '#bb86fc'}
                            onChange={(v) => updateMatchInfo('homeTeamColor', v)}
                        />
                    </div>

                    {/* Away Team */}
                    <div>
                        <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                margin: '0 auto',
                                backgroundColor: '#1e1e1e',
                                border: '1px dashed #333',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                {matchInfo.awayCrest ? (
                                    <img src={matchInfo.awayCrest} alt="Away" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <span style={{ color: '#666', fontSize: '0.8rem' }}>Upload Crest</span>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'awayCrest')}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        opacity: 0,
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>
                        </div>
                        <InputGroup
                            label="Away Team"
                            value={matchInfo.awayTeam}
                            onChange={(v) => updateMatchInfo('awayTeam', v)}
                        />
                        <InputGroup
                            label="Color"
                            type="color"
                            value={matchInfo.awayTeamColor || '#03dac6'}
                            onChange={(v) => updateMatchInfo('awayTeamColor', v)}
                        />
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ color: '#bb86fc', fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                    Default Match Info
                </h3>
                <InputGroup
                    label="Competition"
                    value={matchInfo.competition || ''}
                    onChange={(v) => updateMatchInfo('competition', v)}
                />
                <InputGroup
                    label="Venue"
                    value={matchInfo.venue || ''}
                    onChange={(v) => updateMatchInfo('venue', v)}
                />
            </div>

            <div style={{ borderTop: '1px solid #333', paddingTop: '24px' }}>
                <h3 style={{ color: '#cf6679', fontSize: '1.1rem', marginBottom: '16px' }}>Danger Zone</h3>
                <button
                    onClick={resetApp}
                    style={{
                        width: '100%',
                        backgroundColor: 'transparent',
                        border: '1px solid #cf6679',
                        color: '#cf6679',
                        padding: '16px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Factory Reset App
                </button>
                <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '8px', textAlign: 'center' }}>
                    This will delete all match history and settings.
                </p>
            </div>

        </div>
    );
};

export default SettingsView;
