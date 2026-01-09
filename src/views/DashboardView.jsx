import React from 'react';
import { useMatch } from '../context/MatchContext';

const DashboardView = () => {
    const { matchHistory, currentStats, quarterlyStats, matchInfo, currentQuarter, timer } = useMatch();

    const calculatePercentage = (num, den) => {
        if (!den || den === 0) return 0;
        return Math.round((num / den) * 100);
    };

    const MatchCard = ({ match }) => {
        const { stats, quarterlyStats, homeTeam, awayTeam, date, id, duration } = match;

        // Colors (mocking from context or using defaults if not saved in match history, ideally should be saved)
        const colorA = '#bb86fc';
        const colorB = '#03dac6';

        // Helper for Percents
        const calcPercentage = (val, total) => total > 0 ? Math.round((val / total) * 100) : 0;

        // --- Totals ---
        const totalPoss = (stats.possessionsA || 0) + (stats.possessionsB || 0);
        const possA = calcPercentage(stats.possessionsA || 0, totalPoss);
        const possB = calcPercentage(stats.possessionsB || 0, totalPoss);

        const totalRucks = (stats.rucksWonA || 0) + (stats.rucksWonB || 0);
        const rucksA = calcPercentage(stats.rucksWonA || 0, totalRucks);
        const rucksB = calcPercentage(stats.rucksWonB || 0, totalRucks);

        const totalPressures = (stats.pressuresA || 0) + (stats.pressuresB || 0);
        const pressA = calcPercentage(stats.pressuresA || 0, totalPressures);
        const pressB = calcPercentage(stats.pressuresB || 0, totalPressures);

        // --- Quarterly Data Preparation ---
        // Helper to safely get data for a quarter
        const getQData = (q, key) => (quarterlyStats && quarterlyStats[q] && quarterlyStats[q][key]) || 0;

        const quarters = [1, 2, 3, 4];

        return (
            <div style={{
                backgroundColor: '#1e1e1e',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                border: '1px solid #333'
            }}>
                {/* Header */}
                <div style={{
                    borderBottom: '1px solid #333',
                    paddingBottom: '12px',
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>
                            Match {id}: {homeTeam} vs {awayTeam}
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>
                            {new Date(date).toLocaleDateString()} • {duration}
                        </span>
                    </div>
                </div>

                {/* --- TOTALS SECTION (Progress Bar Style) --- */}

                {/* Possession Bar */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b0b0b0', marginBottom: '8px', fontSize: '0.9rem' }}>
                        <span>{homeTeam}</span>
                        <span>Possessions</span>
                        <span>{awayTeam}</span>
                    </div>
                    <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#333' }}>
                        <div style={{ width: `${possA}%`, backgroundColor: colorA }}></div>
                        <div style={{ width: `${possB}%`, backgroundColor: colorB }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        <span style={{ color: colorA }}>{stats.possessionsA || 0} ({possA}%)</span>
                        <span style={{ color: colorB }}>{stats.possessionsB || 0} ({possB}%)</span>
                    </div>
                </div>

                {/* Pressure Bar */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b0b0b0', marginBottom: '8px', fontSize: '0.9rem' }}>
                        <span>{homeTeam}</span>
                        <span>Pressures</span>
                        <span>{awayTeam}</span>
                    </div>
                    <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#333' }}>
                        <div style={{ width: `${pressA}%`, backgroundColor: colorA }}></div>
                        <div style={{ width: `${pressB}%`, backgroundColor: colorB }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        <span style={{ color: colorA }}>{stats.pressuresA || 0} ({pressA}%)</span>
                        <span style={{ color: colorB }}>{stats.pressuresB || 0} ({pressB}%)</span>
                    </div>
                </div>

                {/* Pressure Efficiency (Pressures / Opp Possessions) */}
                <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: '#333', borderRadius: '8px' }}>
                    <div style={{ textAlign: 'center', color: '#b0b0b0', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                        Pressure Efficiency
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colorA }}>
                                {calcPercentage(stats.pressuresA, stats.possessionsB)}%
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '2px' }}>
                                ({stats.pressuresA || 0}/{stats.possessionsB || 0})
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#b0b0b0', marginTop: '4px' }}>{homeTeam}</div>
                        </div>
                        <div style={{ color: '#666', fontSize: '0.8rem' }}>vs</div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colorB }}>
                                {calcPercentage(stats.pressuresB, stats.possessionsA)}%
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '2px' }}>
                                ({stats.pressuresB || 0}/{stats.possessionsA || 0})
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#b0b0b0', marginTop: '4px' }}>{awayTeam}</div>
                        </div>
                    </div>
                </div>

                {/* Rucks Won Bar */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b0b0b0', marginBottom: '8px', fontSize: '0.9rem' }}>
                        <span>{homeTeam}</span>
                        <span>Rucks Won</span>
                        <span>{awayTeam}</span>
                    </div>
                    <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#333' }}>
                        <div style={{ width: `${rucksA}%`, backgroundColor: colorA }}></div>
                        <div style={{ width: `${rucksB}%`, backgroundColor: colorB }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        <span style={{ color: colorA }}>{stats.rucksWonA || 0} ({rucksA}%)</span>
                        <span style={{ color: colorB }}>{stats.rucksWonB || 0} ({rucksB}%)</span>
                    </div>
                </div>

                {/* --- QUARTERLY BREAKDOWN TABLE --- */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#ccc' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #444' }}>
                                <th style={{ textAlign: 'left', padding: '8px 4px' }}>Metric</th>
                                {quarters.map(q => <th key={q} style={{ textAlign: 'center', padding: '8px 4px' }}>Q{q}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Possessions Row */}
                            <tr style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '8px 4px', color: '#fff' }}>Possessions</td>
                                {quarters.map(q => (
                                    <td key={q} style={{ textAlign: 'center' }}>
                                        <span style={{ color: colorA }}>{getQData(q, 'possessionsA')}</span>
                                        {' / '}
                                        <span style={{ color: colorB }}>{getQData(q, 'possessionsB')}</span>
                                    </td>
                                ))}
                            </tr>
                            {/* Pressures Row */}
                            <tr style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '8px 4px', color: '#fff' }}>Pressures</td>
                                {quarters.map(q => (
                                    <td key={q} style={{ textAlign: 'center' }}>
                                        <span style={{ color: colorA }}>{getQData(q, 'pressuresA')}</span>
                                        {' / '}
                                        <span style={{ color: colorB }}>{getQData(q, 'pressuresB')}</span>
                                    </td>
                                ))}
                            </tr>
                            {/* Pressure Efficiency Row */}
                            <tr style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '8px 4px', color: '#fff', fontSize: '0.8rem' }}>Press. Eff.</td>
                                {quarters.map(q => {
                                    const pA = getQData(q, 'pressuresA');
                                    const oPoss = getQData(q, 'possessionsB');
                                    const effA = calcPercentage(pA, oPoss);

                                    const pB = getQData(q, 'pressuresB');
                                    const hPoss = getQData(q, 'possessionsA');
                                    const effB = calcPercentage(pB, hPoss);

                                    return (
                                        <td key={q} style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                                            <span style={{ color: colorA }}>{effA}%</span>
                                            {' / '}
                                            <span style={{ color: colorB }}>{effB}%</span>
                                        </td>
                                    );
                                })}
                            </tr>
                            {/* Rucks Won Row */}
                            <tr style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '8px 4px', color: '#fff' }}>Rucks Won</td>
                                {quarters.map(q => (
                                    <td key={q} style={{ textAlign: 'center' }}>
                                        <span style={{ color: colorA }}>{getQData(q, 'rucksWonA')}</span>
                                        {' / '}
                                        <span style={{ color: colorB }}>{getQData(q, 'rucksWonB')}</span>
                                    </td>
                                ))}
                            </tr>
                            {/* Turnovers Row */}
                            <tr>
                                <td style={{ padding: '8px 4px', color: '#fff' }}>Turnovers</td>
                                {quarters.map(q => (
                                    <td key={q} style={{ textAlign: 'center' }}>
                                        <span style={{ color: colorA }}>{getQData(q, 'turnoversA')}</span>
                                        {' / '}
                                        <span style={{ color: colorB }}>{getQData(q, 'turnoversB')}</span>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        );
    };

    return (
        <div style={{ padding: '16px', paddingBottom: '80px', maxWidth: '600px', margin: '0 auto' }}>

            {/* Live Match Section */}
            {timer.minutes !== undefined && (currentQuarter > 1 || timer.isRunning || currentStats.possessionsA > 0 || currentStats.possessionsB > 0) && (
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ color: '#03dac6', marginBottom: '16px', fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#03dac6', borderRadius: '50%' }}></span>
                        Live Match
                    </h2>
                    <MatchCard match={{
                        id: 'LIVE',
                        homeTeam: matchInfo.homeTeam || 'Home',
                        awayTeam: matchInfo.awayTeam || 'Away',
                        date: new Date().toISOString(),
                        duration: `Q${currentQuarter}`,
                        stats: Object.values({ ...quarterlyStats, [currentQuarter]: currentStats }).reduce((acc, q) => ({
                            possessionsA: (acc.possessionsA || 0) + (q.possessionsA || 0),
                            possessionsB: (acc.possessionsB || 0) + (q.possessionsB || 0),
                            rucksWonA: (acc.rucksWonA || 0) + (q.rucksWonA || 0),
                            rucksWonB: (acc.rucksWonB || 0) + (q.rucksWonB || 0),
                            pressuresA: (acc.pressuresA || 0) + (q.pressuresA || 0),
                            pressuresB: (acc.pressuresB || 0) + (q.pressuresB || 0),
                            turnoversA: (acc.turnoversA || 0) + (q.turnoversA || 0),
                            turnoversB: (acc.turnoversB || 0) + (q.turnoversB || 0),
                        }), {}),
                        quarterlyStats: { ...quarterlyStats, [currentQuarter]: currentStats }
                    }} />
                </div>
            )}

            <h2 style={{ color: '#fff', marginBottom: '24px', fontSize: '1.5rem', fontWeight: 'bold' }}>Match History</h2>

            {matchHistory.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
                    <p>No matches recorded yet.</p>
                    <p style={{ fontSize: '0.8rem' }}>Go to the Record tab to start a match.</p>
                </div>
            ) : (
                matchHistory.map(match => (
                    <MatchCard key={match.id} match={match} />
                ))
            )}
        </div>
    );
};

export default DashboardView;
