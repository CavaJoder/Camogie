import React from 'react';
import { useMatch } from '../context/MatchContext';

const SettingsView = () => {
    const { matchInfo, updateMatchInfo } = useMatch();

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
                    padding: '12px',
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '1rem'
                }}
            />
        </div>
    );

    return (
        <div style={{ padding: '16px', paddingBottom: '80px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', color: '#bb86fc' }}>Match Configuration</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '8px' }}>Home Crest</label>
                    <div style={{
                        width: '100%',
                        aspectRatio: '1',
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
                            <span style={{ color: '#666' }}>Upload</span>
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
                <div>
                    <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '8px' }}>Away Crest</label>
                    <div style={{
                        width: '100%',
                        aspectRatio: '1',
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
                            <span style={{ color: '#666' }}>Upload</span>
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
            </div>

            <InputGroup
                label="Home Team Name"
                value={matchInfo.homeTeam}
                onChange={(v) => updateMatchInfo('homeTeam', v)}
            />
            <InputGroup
                label="Away Team Name"
                value={matchInfo.awayTeam}
                onChange={(v) => updateMatchInfo('awayTeam', v)}
            />
            <InputGroup
                label="Date"
                type="date"
                value={matchInfo.date}
                onChange={(v) => updateMatchInfo('date', v)}
            />
            <InputGroup
                label="Competition"
                value={matchInfo.competition}
                onChange={(v) => updateMatchInfo('competition', v)}
            />
            <InputGroup
                label="Venue"
                value={matchInfo.venue}
                onChange={(v) => updateMatchInfo('venue', v)}
            />

        </div>
    );
};

export default SettingsView;
