import React, { useMemo } from 'react';
import { useMatch } from '../context/MatchContext';

const Header = () => {
    const { timer, matchInfo, pitchStats, startTimer, pauseTimer, endQuarter, resetMatch, isAdmin, isLive } = useMatch();

    const formatTime = (min, sec) => {
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const isAlert = useMemo(() => {
        const totalSeconds = timer.minutes * 60 + timer.seconds;
        // Alert at end of Q2 (15:00-16:59) only if we're in Q2
        if (timer.quarter === 'Q2' && totalSeconds >= 900 && totalSeconds < 1020) return true;
        // Alert at end of Q4/FT (30:00+) only if we're in Q4 or FT
        if ((timer.quarter === 'Q4' || timer.quarter === 'FT') && totalSeconds >= 1800) return true;
        return false;
    }, [timer.minutes, timer.seconds, timer.quarter]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = date.getDate();
        const ordinal = (day > 3 && day < 21) ? 'th' : ['th', 'st', 'nd', 'rd'][day % 10] || 'th';
        const month = date.toLocaleString('en-GB', { month: 'short' });
        const year = date.getFullYear();
        return `${day}${ordinal} ${month} ${year}`;
    };

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
                        {matchInfo.homeTeam || 'HOME'} <span style={{ color: '#4caf50', margin: '0 8px' }}>
                            {/* Home Score Calc */}
                            {(() => {
                                const allScores = [
                                    ...(pitchStats.q1?.scores || []),
                                    ...(pitchStats.q2?.scores || []),
                                    ...(pitchStats.q3?.scores || []),
                                    ...(pitchStats.q4?.scores || []),
                                    ...(pitchStats.ft?.scores || []),
                                    ...(Array.isArray(pitchStats.scores) ? pitchStats.scores : []) // Legacy Support
                                ];
                                const homeScores = allScores.filter(s => s.team === 'home');
                                const goals = homeScores.filter(s => s.type === 'goal' || s.type === 'penalty').length;
                                const points = homeScores.filter(s => s.type === 'point' || s.type === 'free' || s.type === '45').length;
                                const total = (goals * 3) + points;
                                return `${goals}-${points} (${total})`;
                            })()}
                        </span>
                        vs
                        <span style={{ color: '#4caf50', margin: '0 8px' }}>
                            {/* Away Score Calc */}
                            {(() => {
                                const allScores = [
                                    ...(pitchStats.q1?.scores || []),
                                    ...(pitchStats.q2?.scores || []),
                                    ...(pitchStats.q3?.scores || []),
                                    ...(pitchStats.q4?.scores || []),
                                    ...(pitchStats.ft?.scores || []),
                                    ...(Array.isArray(pitchStats.scores) ? pitchStats.scores : []) // Legacy Support
                                ];
                                const awayScores = allScores.filter(s => s.team === 'away');
                                const goals = awayScores.filter(s => s.type === 'goal' || s.type === 'penalty').length;
                                const points = awayScores.filter(s => s.type === 'point' || s.type === 'free' || s.type === '45').length;
                                const total = (goals * 3) + points;
                                return `${goals}-${points} (${total})`;
                            })()}
                        </span>{matchInfo.awayTeam || 'AWAY'}
                    </h1>
                    {matchInfo.awayCrest && (
                        <img src={matchInfo.awayCrest} alt="Away" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    )}
                </div>
                {(matchInfo.date || matchInfo.competition || matchInfo.venue) && (
                    <div style={{ color: '#b0b0b0', fontSize: '0.85rem' }}>
                        {[formatDate(matchInfo.date), matchInfo.competition, matchInfo.venue].filter(Boolean).join(' • ')}
                    </div>
                )}
            </div>

            <h1 style={{
                margin: 0,
                fontSize: '1.2rem',
                fontWeight: '800',
                letterSpacing: '-0.5px'
            }}>
                Perf Tracker <span style={{ fontSize: '0.8rem', color: '#4caf50', fontWeight: 'bold' }}>v2.7.12 (FULL SYNC)</span>
            </h1>
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

            {/* Controls - Only visible to Admin or if not Live */}
            {(!isLive || isAdmin) && (
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
            )}
        </header>
    );
};

export default Header;
