import React, { useMemo } from 'react';
import { useMatch } from '../context/MatchContext';

const Header = () => {
    const { timer, matchInfo, startTimer, pauseTimer, endQuarter, resetMatch } = useMatch();

    const formatTime = (min, sec) => {
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const isAlert = useMemo(() => {
        const totalSeconds = timer.minutes * 60 + timer.seconds;
        // 15:00 to 16:59 (15*60 = 900s)
        if (totalSeconds >= 900 && totalSeconds < 1020) return true;
        // 30:00 onwards (30*60 = 1800s)
        if (totalSeconds >= 1800) return true;
        return false;
    }, [timer.minutes, timer.seconds]);

    return (
        <header style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: '#121212',
            borderBottom: '1px solid #333',
            zIndex: 100,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            {/* Match Info */}
            <div style={{ marginBottom: '15px', textAlign: 'center', width: '100%' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '5px'
                }}>
                    {matchInfo.homeCrest && (
                        <img src={matchInfo.homeCrest} alt="Home" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    )}
                    <h1 style={{
                        color: '#bb86fc',
                        fontSize: '1rem',
                        fontWeight: 'normal',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        margin: 0
                    }}>
                        {matchInfo.homeTeam || 'HOME'} vs {matchInfo.awayTeam || 'AWAY'}
                    </h1>
                    {matchInfo.awayCrest && (
                        <img src={matchInfo.awayCrest} alt="Away" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    )}
                </div>
                {(matchInfo.date || matchInfo.competition || matchInfo.venue) && (
                    <div style={{ color: '#b0b0b0', fontSize: '0.85rem' }}>
                        {[matchInfo.date, matchInfo.competition, matchInfo.venue].filter(Boolean).join(' • ')}
                    </div>
                )}
            </div>

            {/* Timer Display */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
            }}>
                <span style={{
                    backgroundColor: '#2d2d2d',
                    color: '#03dac6',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    marginRight: '15px'
                }}>
                    {timer.quarter}
                </span>
                <span style={{
                    fontSize: '3.5rem',
                    fontWeight: 'bold',
                    color: isAlert ? '#cf6679' : '#ffffff',
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1
                }}>
                    {formatTime(timer.minutes, timer.seconds)}
                </span>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '10px' }}>
                {!timer.isRunning && timer.quarter !== 'FT' && (
                    <button onClick={startTimer} style={{
                        backgroundColor: '#4caf50',
                        color: 'black',
                        padding: '8px 24px',
                        borderRadius: '20px',
                        fontWeight: '600',
                        minWidth: '80px'
                    }}>
                        Start
                    </button>
                )}

                {timer.isRunning && (
                    <button onClick={pauseTimer} style={{
                        backgroundColor: '#ff9800',
                        color: 'black',
                        padding: '8px 24px',
                        borderRadius: '20px',
                        fontWeight: '600',
                        minWidth: '80px'
                    }}>
                        Pause
                    </button>
                )}

                {timer.quarter !== 'FT' && (
                    <button onClick={endQuarter} style={{
                        backgroundColor: '#bb86fc',
                        color: 'black',
                        padding: '8px 24px',
                        borderRadius: '20px',
                        fontWeight: '600',
                        minWidth: '80px'
                    }}>
                        End Q
                    </button>
                )}

                <button onClick={() => {
                    if (window.confirm('Are you sure you want to reset the match? This cannot be undone.')) {
                        resetMatch();
                    }
                }} style={{
                    backgroundColor: '#333',
                    color: 'white',
                    padding: '8px 24px',
                    borderRadius: '20px',
                    fontWeight: '600',
                    minWidth: '80px'
                }}>
                    Reset
                </button>
            </div>
        </header>
    );
};

export default Header;
