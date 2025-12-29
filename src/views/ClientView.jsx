import React from 'react';
import { useMatch } from '../context/MatchContext';
import PitchSummary from '../components/PitchSummary';

const ClientView = () => {
    const { matchInfo, pitchStats, stats, timer } = useMatch();

    // Helper to sum stats
    const sumStats = (statId) => {
        return ['q1', 'q2', 'q3', 'q4'].reduce((total, q) => {
            return total + (stats[q]?.[statId] || 0);
        }, 0);
    };

    // Calculate Key Stats
    const totalPossessions = sumStats('oppPossessions');
    const totalPressures = sumStats('pressures');
    const pressureEfficiency = totalPossessions > 0 ? Math.round((totalPressures / totalPossessions) * 100) : 0;

    const totalShots = sumStats('shotTaken');
    const totalScores = sumStats('score');
    const shotEfficiency = totalShots > 0 ? Math.round((totalScores / totalShots) * 100) : 0;

    const totalRucks = sumStats('defRuck') + sumStats('midRuck') + sumStats('offRuck');
    const rucksWon = sumStats('defRuckWon') + sumStats('midRuckWon') + sumStats('offRuckWon');
    const ruckEfficiency = totalRucks > 0 ? Math.round((rucksWon / totalRucks) * 100) : 0;

    const KPICard = ({ title, value, sub, color = '#03dac6' }) => (
        <div style={{
            backgroundColor: '#1e1e1e',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center',
            flex: 1,
            border: '1px solid #333'
        }}>
            <div style={{ fontSize: '0.8rem', color: '#b0b0b0', marginBottom: '4px' }}>{title}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: color }}>{value}</div>
            {sub && <div style={{ fontSize: '0.75rem', color: '#666' }}>{sub}</div>}
        </div>
    );

    // Recent Activity Feed (Last 10 Scores)
    const recentScores = [...pitchStats.scores].sort((a, b) => b.id - a.id).slice(0, 5);

    return (
        <div style={{ padding: '16px', paddingBottom: '80px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{
                    backgroundColor: '#03dac6',
                    color: '#000',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                }}>
                    ● LIVE FEED
                </span>
            </div>

            {/* Key Stats Row */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <KPICard title="Pressure Eff" value={`${pressureEfficiency}%`} color="#bb86fc" />
                <KPICard title="Shot Eff" value={`${shotEfficiency}%`} color="#4caf50" />
                <KPICard title="Rucks Won" value={`${rucksWon}/${totalRucks}`} color="#03dac6" />
            </div>

            {/* Pitch Map - Shots */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '12px', color: '#fff', fontSize: '1.1rem' }}>Match Shot Map</h3>
                <PitchSummary data={pitchStats.scores} type="scores" title="All Shots & Scores" />
            </div>

            {/* Recent Activity */}
            <div>
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '12px', color: '#fff', fontSize: '1.1rem' }}>Recent Scores</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {recentScores.length === 0 ? (
                        <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No scores recorded yet</div>
                    ) : (
                        recentScores.map(score => {
                            const isHome = score.team === 'home';
                            const teamName = isHome ? (matchInfo.homeTeam || 'Home') : (matchInfo.awayTeam || 'Away');
                            const color = isHome ? (matchInfo.homeTeamColor || '#bb86fc') : (matchInfo.awayTeamColor || '#bb86fc');

                            return (
                                <div key={score.id} style={{
                                    backgroundColor: '#1e1e1e',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${color}`,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#fff' }}>{teamName}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#b0b0b0' }}>{score.quarter}</div>
                                    </div>
                                    <div style={{
                                        fontWeight: 'bold',
                                        color: score.type === 'goal' ? '#4caf50' : (
                                            score.type === 'wide' ? '#cf6679' : '#03dac6'
                                        ),
                                        fontSize: '1.1rem',
                                        textTransform: 'capitalize'
                                    }}>
                                        {score.type}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientView;
