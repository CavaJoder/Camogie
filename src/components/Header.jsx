import React, { useMemo } from 'react';
import { useMatch } from '../context/MatchContext';

const Header = () => {
    const { stats, timer, matchInfo, pitchStats, startTimer, pauseTimer, endQuarter, resetMatch, isAdmin, isLive } = useMatch();

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
                color: '#fff',
                fontSize: '1.4rem',
                margin: '0 0 5px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontWeight: '800',
                letterSpacing: '-0.5px'
            }}>
                Perf Tracker <span style={{ fontSize: '0.8rem', color: '#4caf50', fontWeight: 'bold' }}>v2.21.0</span>
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

            {/* Live Half Metrics */}
            <div style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '15px',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                textTransform: 'uppercase'
            }}>
                {(() => {
                    const currentHalfQs = ['Q1', 'Q2'].includes(timer.quarter) ? ['q1', 'q2'] : ['q3', 'q4', 'ft'];
                    const label = ['Q1', 'Q2'].includes(timer.quarter) ? '1ST HALF' : '2ND HALF';

                    const getStatValue = (q, statId) => {
                        const val = (stats && stats[q]) ? stats[q][statId] || 0 : 0;
                        return typeof val === 'object' ? (val.home || 0) : val;
                    };

                    const sumHalfStat = (statId) => {
                        return currentHalfQs.reduce((sum, q) => sum + getStatValue(q, statId), 0);
                    };

                    const sumTotalStat = (statId) => {
                        return ['q1', 'q2', 'q3', 'q4', 'ft'].reduce((sum, q) => sum + getStatValue(q, statId), 0);
                    };

                    // Ruck Rate
                    const totalRucks = sumHalfStat('defRuck') + sumHalfStat('midRuck') + sumHalfStat('offRuck');
                    const wonRucks = sumHalfStat('defRuckWon') + sumHalfStat('midRuckWon') + sumHalfStat('offRuckWon');
                    const ruckRate = totalRucks > 0 ? Math.round((wonRucks / totalRucks) * 100) : 0;

                    // Pressure Rate
                    const totalOppPoss = sumHalfStat('oppPossessions');
                    const totalPressures = sumHalfStat('pressures');
                    const pressureRate = totalOppPoss > 0 ? Math.round((totalPressures / totalOppPoss) * 100) : 0;

                    // Free Count - User wants total running count of 'freeConcededHome'
                    const freeCount = sumTotalStat('freeConcededHome');

                    return (
                        <>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: '#b0b0b0' }}>Ruck Rate</div>
                                <div>{ruckRate}%</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: '#b0b0b0' }}>Pressure</div>
                                <div>{pressureRate}%</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: '#b0b0b0' }}>Free</div>
                                <div>{freeCount}</div>
                            </div>
                        </>
                    );
                })()}
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
