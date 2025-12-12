import React from 'react';
import { useMatch } from '../context/MatchContext';

const DashboardView = () => {
    const { matchHistory } = useMatch();

    const calculatePercentage = (num, den) => {
        if (!den || den === 0) return 0;
        return Math.round((num / den) * 100);
    };

    const MatchCard = ({ match }) => {
        const { stats, homeTeam, awayTeam, date, id } = match;

        // Calculations
        const pressEffA = calculatePercentage(stats.pressuresA, stats.possessionsB);
        const pressEffB = calculatePercentage(stats.pressuresB, stats.possessionsA);

        const ruckWinPctA = calculatePercentage(stats.rucksWonA, stats.rucksTotal);
        const ruckWinPctB = calculatePercentage(stats.rucksWonB, stats.rucksTotal);

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
                    marginBottom: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>
                            Match {id}: {homeTeam} vs {awayTeam}
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>
                            {new Date(date).toLocaleDateString()} • {match.duration}
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gap: '12px' }}>

                    {/* Row 1: Team A Poss vs Team B Press */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                        <span style={{ color: '#b0b0b0' }}>
                            {homeTeam} Poss ({stats.possessionsA}) vs {awayTeam} Press ({stats.pressuresB})
                        </span>
                        <span style={{ fontWeight: 'bold', color: pressEffB >= 60 ? '#4caf50' : '#cf6679' }}>
                            {pressEffB}%
                        </span>
                    </div>

                    {/* Row 2: Team B Poss vs Team A Press */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                        <span style={{ color: '#b0b0b0' }}>
                            {awayTeam} Poss ({stats.possessionsB}) vs {homeTeam} Press ({stats.pressuresA})
                        </span>
                        <span style={{ fontWeight: 'bold', color: pressEffA >= 60 ? '#4caf50' : '#cf6679' }}>
                            {pressEffA}%
                        </span>
                    </div>

                    {/* Row 3: Turnovers */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                        <span style={{ color: '#b0b0b0' }}>Turnovers</span>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <span style={{ color: '#bb86fc' }}>{homeTeam}: {stats.turnoversA || 0}</span>
                            <span style={{ color: '#03dac6' }}>{awayTeam}: {stats.turnoversB || 0}</span>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px dashed #333', margin: '4px 0' }}></div>

                    {/* Row 4: Ruck Win % */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                        <span style={{ color: '#b0b0b0' }}>Ruck Win %</span>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <span style={{ color: '#bb86fc' }}>{homeTeam}: {ruckWinPctA}%</span>
                            <span style={{ color: '#03dac6' }}>{awayTeam}: {ruckWinPctB}%</span>
                        </div>
                    </div>

                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: '16px', paddingBottom: '80px', maxWidth: '600px', margin: '0 auto' }}>
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
