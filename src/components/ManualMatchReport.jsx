import React from 'react';
import { useMatch } from '../context/MatchContext';
import { PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import PitchSummary from './PitchSummary';

const ManualMatchReport = ({ isPdfMode, periodMode = 'quarters' }) => {
    const { manualStats, matchInfo, manualPitchEvents } = useMatch();

    // --- Helper Functions ---

    // Aggregate stats based on period mode
    const getPeriods = () => {
        if (periodMode === 'halves') {
            return [
                { id: 'h1', label: '1st Half', quarters: ['q1', 'q2'] },
                { id: 'h2', label: '2nd Half', quarters: ['q3', 'q4'] }
            ];
        }
        return [
            { id: 'q1', label: 'Q1', quarters: ['q1'] },
            { id: 'q2', label: 'Q2', quarters: ['q2'] },
            { id: 'q3', label: 'Q3', quarters: ['q3'] },
            { id: 'q4', label: 'Q4', quarters: ['q4'] }
        ];
    };

    const periods = getPeriods();
    const periodIds = periods.map(p => p.id); // ['q1', 'q2', 'q3', 'q4'] or ['h1', 'h2']

    const sumStats = (statId, quarters = ['q1', 'q2', 'q3', 'q4']) => {
        return quarters.reduce((total, q) => {
            return total + (manualStats[q]?.[statId] || 0);
        }, 0);
    };

    const getTeamScore = (team) => {
        const scores = [
            ...manualPitchEvents.q1.scores,
            ...manualPitchEvents.q2.scores,
            ...manualPitchEvents.q3.scores,
            ...manualPitchEvents.q4.scores
        ].filter(s => s.team === team);
        const goals = scores.filter(s => s.type === 'goal' || s.type === 'penalty').length;
        const points = scores.filter(s => s.type === 'point' || s.type === 'free' || s.type === '45').length;
        const total = (goals * 3) + points;
        return { goals, points, total };
    };

    const homeScore = getTeamScore('home');
    const awayScore = getTeamScore('away');

    const getQuarterColor = (q) => '#4caf50';

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = date.getDate();
        const ordinal = (day > 3 && day < 21) ? 'th' : ['th', 'st', 'nd', 'rd'][day % 10] || 'th';
        const month = date.toLocaleString('en-GB', { month: 'short' });
        const year = date.getFullYear();
        return `${day}${ordinal} ${month} ${year}`;
    };

    const getStats = (quarters, type) => {
        let value = 0;
        let total = 0;

        quarters.forEach(q => {
            if (type === 'rucks') {
                const rucks = (manualStats[q]?.defRuck || 0) + (manualStats[q]?.midRuck || 0) + (manualStats[q]?.offRuck || 0);
                const won = (manualStats[q]?.defRuckWon || 0) + (manualStats[q]?.midRuckWon || 0) + (manualStats[q]?.offRuckWon || 0);
                value += won;
                total += rucks;
            } else if (type === 'possession') {
                const oppPoss = manualStats[q]?.oppPossessions || 0;
                const pressures = manualStats[q]?.pressures || 0;
                value += pressures;
                total += oppPoss;
            } else if (type === 'attack') {
                const shots = manualStats[q]?.shotTaken || 0;
                const score = manualStats[q]?.score || 0;
                value += score;
                total += shots;
            } else if (type === 'puckouts') {
                const tot = (manualStats[q]?.oppPuckout || 0) + (manualStats[q]?.ownPuckout || 0);
                const won = (manualStats[q]?.oppPuckoutWon || 0) + (manualStats[q]?.ownPuckoutWon || 0);
                value += won;
                total += tot;
            } else if (type === 'conversion') {
                const entries = manualStats[q]?.ballInside65 || 0;
                const shots = manualStats[q]?.shotTaken || 0;
                value += shots;
                total += entries;
            } else if (type === 'efficiency') {
                const shots = manualStats[q]?.shotTaken || 0;
                const score = manualStats[q]?.score || 0;
                value += score;
                total += shots;
            } else if (type === 'scoring') {
                const shots = manualStats[q]?.shotTaken || 0;
                const scores = manualStats[q]?.score || 0;
                value += scores;
                total += shots;
            } else if (type === 'freeRate') {
                const frees = manualStats[q]?.freesAgainst || 0;
                const pressures = manualStats[q]?.pressures || 0;
                value += frees;
                total += pressures;
            }
        });

        return { value, total, pct: total ? Math.round((value / total) * 100) : 0 };
    };

    const getPctColor = (val) => {
        if (val === null) return 'inherit';
        if (val <= 45) return '#cf6679'; // Red
        if (val < 60) return '#ff9800'; // Amber
        return '#4caf50'; // Green
    };

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 25;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill={isPdfMode ? "#333" : "#fff"}
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize="12px"
                fontWeight="bold"
            >
                {`${name}: ${value}`}
            </text>
        );
    };

    // --- Components ---

    const KPICard = ({ title, value, sub, color = '#fff', bgColor = '#1e1e1e', titleColor = '#b0b0b0' }) => (
        <div className="kpi-card" style={{
            backgroundColor: bgColor,
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '100px',
            flex: 1,
            border: '1px solid #333'
        }}>
            <div className="kpi-title" style={{ fontSize: '0.8rem', color: titleColor, marginBottom: '4px' }}>{title}</div>
            <div className="kpi-value" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: color }}>{value}</div>
            {sub && <div style={{ fontSize: '0.75rem', color: '#666' }}>{sub}</div>}
        </div>
    );

    const StatRow = ({ label, statId }) => {
        const values = periods.map(p => sumStats(statId, p.quarters));
        const total = values.reduce((a, b) => a + b, 0);

        return (
            <div className="stat-row" style={{
                display: 'grid',
                gridTemplateColumns: `2fr repeat(${periods.length}, 1fr) 1fr`,
                padding: '12px 0',
                borderBottom: '1px solid #333',
                fontSize: '0.9rem'
            }}>
                <span className="stat-label" style={{ color: '#fff' }}>{label}</span>
                {values.map((v, i) => (
                    <span key={i} className="stat-value" style={{ textAlign: 'center', color: getQuarterColor(periods[i].label) }}>{v}</span>
                ))}
                <span className="stat-value" style={{ textAlign: 'center', fontWeight: 'bold', color: '#03dac6' }}>{total}</span>
            </div>
        );
    };

    const CalculatedRow = ({ label, numeratorId, denominatorId }) => {
        const getPctValue = (quarters) => {
            const num = sumStats(numeratorId, quarters);
            const den = sumStats(denominatorId, quarters);
            return den > 0 ? Math.round((num / den) * 100) : null;
        };

        const values = periods.map(p => getPctValue(p.quarters));

        const totalNum = sumStats(numeratorId);
        const totalDen = sumStats(denominatorId);
        const totalVal = totalDen > 0 ? Math.round((totalNum / totalDen) * 100) : null;

        return (
            <div className="stat-row" style={{
                display: 'grid',
                gridTemplateColumns: `2fr repeat(${periods.length}, 1fr) 1fr`,
                padding: '12px 0',
                borderBottom: '1px solid #333',
                fontSize: '0.9rem',
                backgroundColor: 'rgba(255,255,255,0.02)'
            }}>
                <span className="stat-label" style={{ color: '#b0b0b0', paddingLeft: '16px', fontStyle: 'italic' }}>{label}</span>
                {values.map((v, i) => (
                    <span key={i} className="stat-value" style={{ textAlign: 'center', color: getPctColor(v) }}>{v !== null ? v + '%' : '-'}</span>
                ))}
                <span className="stat-value" style={{ textAlign: 'center', fontWeight: 'bold', color: getPctColor(totalVal) }}>{totalVal !== null ? totalVal + '%' : '-'}</span>
            </div>
        );
    };

    const SummaryCard = ({ title, type }) => {
        const rows = [
            ...periods.map(p => ({ label: p.label + ':', quarters: p.quarters })),
            ...(periodMode === 'quarters' ? [
                { label: '1st Half:', quarters: ['q1', 'q2'], isHalf: true },
                { label: '2nd Half:', quarters: ['q3', 'q4'], isHalf: true }
            ] : []), // Don't duplicates halves if already in halves mode
            { label: 'Overall:', quarters: ['q1', 'q2', 'q3', 'q4'], isTotal: true },
        ];

        return (
            <div className="summary-card" style={{
                backgroundColor: '#1e1e1e',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #333',
                height: '100%'
            }}>
                <h3 style={{ color: '#03dac6', fontSize: '1rem', marginBottom: '12px' }}>{title}</h3>
                {rows.map((row, idx) => {
                    const { value, total, pct } = getStats(row.quarters, type);

                    let rowColorStyle = { color: 'inherit' };
                    let rowClass = '';

                    if (row.isHalf) {
                        rowClass = 'half-row';
                    } else if (row.isTotal) {
                        rowColorStyle = { color: '#03dac6' };
                    }

                    const pctColor = total > 0 ? getPctColor(pct) : 'inherit';
                    const isHigh = total > 0 && pct >= 60;

                    const showSeparatorBefore = row.isHalf && row.label === '1st Half';
                    const showSeparatorBeforeTotal = row.isTotal;

                    return (
                        <React.Fragment key={idx}>
                            {showSeparatorBefore && <div style={{ borderTop: '1px dashed #333', margin: '8px 0' }} />}
                            {showSeparatorBeforeTotal && <div style={{ borderTop: '1px solid #333', margin: '8px 0' }} />}
                            <div className={rowClass} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.9rem',
                                marginBottom: '4px',
                                ...rowColorStyle,
                                fontWeight: 'normal'
                            }}>
                                <span>{row.label}</span>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <span className={isHigh ? 'pct-high' : ''} style={{ fontWeight: 'normal', width: '40px', textAlign: 'right', color: pctColor }}>{pct}%</span>
                                    <span style={{ width: '50px', textAlign: 'right', opacity: 0.8, color: row.isHalf ? (isPdfMode ? '#000' : '#fff') : 'inherit' }}>({value}/{total})</span>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    // --- Chart Data Preparation ---

    const shotData = [
        { name: 'Scores', value: sumStats('score'), color: '#4caf50' },
        { name: 'Wides', value: sumStats('wide'), color: '#cf6679' },
        { name: 'Short', value: sumStats('short'), color: '#ff9800' },
        { name: 'Saved', value: sumStats('saved'), color: '#ff9800' },
    ].filter(d => d.value > 0);

    const pressureBarData = periods.map(p => ({
        name: p.label.toUpperCase(),
        Possessions: sumStats('oppPossessions', p.quarters),
        Pressures: sumStats('pressures', p.quarters)
    }));

    const ruckBarData = periods.map(p => {
        const total = sumStats('defRuck', p.quarters) + sumStats('midRuck', p.quarters) + sumStats('offRuck', p.quarters);
        const won = sumStats('defRuckWon', p.quarters) + sumStats('midRuckWon', p.quarters) + sumStats('offRuckWon', p.quarters);
        return {
            name: p.label.toUpperCase(),
            Total: total,
            Won: won
        };
    });

    const zoneRuckData = periods.map(p => ({
        name: p.label.toUpperCase(),
        defWon: sumStats('defRuckWon', p.quarters),
        defLost: sumStats('defRuck', p.quarters) - sumStats('defRuckWon', p.quarters),
        midWon: sumStats('midRuckWon', p.quarters),
        midLost: sumStats('midRuck', p.quarters) - sumStats('midRuckWon', p.quarters),
        offWon: sumStats('offRuckWon', p.quarters),
        offLost: sumStats('offRuck', p.quarters) - sumStats('offRuckWon', p.quarters),
    }));

    const ownPuckoutData = [
        { name: 'Won', value: sumStats('ownPuckoutWon'), color: '#4caf50' },
        { name: 'Lost', value: Math.max(0, sumStats('ownPuckout') - sumStats('ownPuckoutWon')), color: '#cf6679' },
    ].filter(d => d.value > 0);

    const oppPuckoutData = [
        { name: 'Won', value: sumStats('oppPuckoutWon'), color: '#03dac6' },
        { name: 'Lost', value: Math.max(0, sumStats('oppPuckout') - sumStats('oppPuckoutWon')), color: '#bb86fc' },
    ].filter(d => d.value > 0);

    // --- Event Data for Maps ---
    // Flatten and tag events
    const scores = [
        ...manualPitchEvents.q1.scores.map(s => ({ ...s, quarter: 'Q1' })),
        ...manualPitchEvents.q2.scores.map(s => ({ ...s, quarter: 'Q2' })),
        ...manualPitchEvents.q3.scores.map(s => ({ ...s, quarter: 'Q3' })),
        ...manualPitchEvents.q4.scores.map(s => ({ ...s, quarter: 'Q4' }))
    ];

    const puckouts = [
        ...manualPitchEvents.q1.puckouts.map(p => ({ ...p, quarter: 'Q1' })),
        ...manualPitchEvents.q2.puckouts.map(p => ({ ...p, quarter: 'Q2' })),
        ...manualPitchEvents.q3.puckouts.map(p => ({ ...p, quarter: 'Q3' })),
        ...manualPitchEvents.q4.puckouts.map(p => ({ ...p, quarter: 'Q4' }))
    ];

    const firstHalfScores = scores.filter(s => ['Q1', 'Q2'].includes(s.quarter));
    const secondHalfScores = scores.filter(s => ['Q3', 'Q4'].includes(s.quarter));
    const firstHalfPuckouts = puckouts.filter(p => ['Q1', 'Q2'].includes(p.quarter));
    const secondHalfPuckouts = puckouts.filter(p => ['Q3', 'Q4'].includes(p.quarter));


    // KPI Values
    const totalAttacks = sumStats('ballInside65');
    const totalShots = sumStats('shotTaken');
    const totalScores = sumStats('score');
    const totalFreesWon = sumStats('freeWon');
    const territorialEffectiveness = totalAttacks > 0 ? Math.round((totalShots / totalAttacks) * 100) : 0;
    const shotEfficiency = totalShots > 0 ? Math.round((totalScores / totalShots) * 100) : 0;

    const totalPossessions = sumStats('oppPossessions');
    const totalPressures = sumStats('pressures');
    const totalFreesAgainst = sumStats('freesAgainst');
    const totalTurnovers = sumStats('turnovers');
    const pressureEfficiency = totalPossessions > 0 ? Math.round((totalPressures / totalPossessions) * 100) : 0;
    const freeRate = totalPressures > 0 ? Math.round((totalFreesAgainst / totalPressures) * 100) : 0;
    const successRate = totalPressures > 0 ? Math.round((totalTurnovers / totalPressures) * 100) : 0;

    const totalRucks = sumStats('defRuck') + sumStats('midRuck') + sumStats('offRuck');
    const rucksWon = sumStats('defRuckWon') + sumStats('midRuckWon') + sumStats('offRuckWon');
    const ruckEfficiency = totalRucks > 0 ? Math.round((rucksWon / totalRucks) * 100) : 0;

    const defRuckTotal = sumStats('defRuck');
    const defRuckWonValue = sumStats('defRuckWon');
    const defRuckPct = defRuckTotal > 0 ? Math.round((defRuckWonValue / defRuckTotal) * 100) : 0;

    const midRuckTotal = sumStats('midRuck');
    const midRuckWonValue = sumStats('midRuckWon');
    const midRuckPct = midRuckTotal > 0 ? Math.round((midRuckWonValue / midRuckTotal) * 100) : 0;

    const offRuckTotal = sumStats('offRuck');
    const offRuckWonValue = sumStats('offRuckWon');
    const offRuckPct = offRuckTotal > 0 ? Math.round((offRuckWonValue / offRuckTotal) * 100) : 0;

    // Puckout Analysis Hero Stats
    const ownPuckoutTotal = sumStats('ownPuckout');
    const ownPuckoutWon = sumStats('ownPuckoutWon');
    const ownPuckoutWonPct = ownPuckoutTotal > 0 ? Math.round((ownPuckoutWon / ownPuckoutTotal) * 100) : 0;
    const oppPuckoutTotal = sumStats('oppPuckout');
    const oppPuckoutWon = sumStats('oppPuckoutWon');
    const oppPuckoutWonPct = oppPuckoutTotal > 0 ? Math.round((oppPuckoutWon / oppPuckoutTotal) * 100) : 0;

    return (
        <div id="printableStats" className={isPdfMode ? 'pdf-mode' : ''}>
            {/* PDF Header - Only visible in PDF Mode */}
            {isPdfMode && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '20px' }}>
                    {matchInfo.homeCrest ? <img src={matchInfo.homeCrest} style={{ width: '80px', height: '80px', objectFit: 'contain' }} alt="Home Crest" /> : <div></div>}
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#000' }}>{matchInfo.homeTeam || 'HOME'} vs {matchInfo.awayTeam || 'AWAY'}</h1>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50', marginBottom: '8px' }}>
                            {homeScore.goals}-{homeScore.points} ({homeScore.total})
                            <span style={{ margin: '0 15px', color: '#666', fontWeight: 'normal' }}> — </span>
                            {awayScore.goals}-{awayScore.points} ({awayScore.total})
                        </div>
                        <p style={{ color: '#666', margin: '0' }}>{[formatDate(matchInfo.date), matchInfo.competition, matchInfo.venue].filter(Boolean).join(' • ')}</p>
                    </div>
                    {matchInfo.awayCrest ? <img src={matchInfo.awayCrest} style={{ width: '80px', height: '80px', objectFit: 'contain' }} alt="Away Crest" /> : <div></div>}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isPdfMode ? '#000' : '#fff' }}>Manual Match Dashboard</h2>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards-container">
                <SummaryCard title="Pressures (Won/Total)" type="possession" />

                <SummaryCard title="Rucks (Won/Total)" type="rucks" />
                <SummaryCard title="Puckouts (Won/Total)" type="puckouts" />
                <SummaryCard title="Shot Attempts (Entries to Shots)" type="conversion" />
                <SummaryCard title="Scoring Efficiency (Shots to Scores)" type="attack" />
                <SummaryCard title="Free Rate (Frees/Pressures)" type="freeRate" />
            </div>

            {/* Detailed Statistics */}
            <h2 className="detailed-stats-header" style={{ fontSize: '1.2rem', margin: '24px 0 16px', color: isPdfMode ? '#000' : '#bb86fc', ...(!isPdfMode && { color: '#bb86fc' }) }}>Detailed Statistics</h2>

            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '8px', color: '#03dac6' }}>PUCKOUTS</h3>
                <div style={{ display: 'grid', gridTemplateColumns: `2fr repeat(${periods.length}, 1fr) 1fr`, marginBottom: '8px', color: '#03dac6', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    <span className="stat-label">Quarter</span>
                    {periods.map(p => <span key={p.id} style={{ textAlign: 'center' }}>{p.label}</span>)}
                    <span style={{ textAlign: 'center' }}>Total</span>
                </div>
                <StatRow label="Opp Puckouts" statId="oppPuckout" />
                <StatRow label="Opp Puckouts Won" statId="oppPuckoutWon" />
                <StatRow label="Own Puckouts" statId="ownPuckout" />
                <StatRow label="Own Puckouts Won" statId="ownPuckoutWon" />
            </div>

            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '8px', color: '#03dac6' }}>RUCKS</h3>
                <StatRow label="Defensive Rucks" statId="defRuck" />
                <StatRow label="Defensive Rucks Won" statId="defRuckWon" />
                <CalculatedRow label="Defensive Won %" numeratorId="defRuckWon" denominatorId="defRuck" />
                <div style={{ borderTop: '1px dashed #333', margin: '8px 0' }}></div>
                <StatRow label="Middle Third Rucks" statId="midRuck" />
                <StatRow label="Middle Third Rucks Won" statId="midRuckWon" />
                <CalculatedRow label="Middle Won %" numeratorId="midRuckWon" denominatorId="midRuck" />
                <div style={{ borderTop: '1px dashed #333', margin: '8px 0' }}></div>
                <StatRow label="Offensive Rucks" statId="offRuck" />
                <StatRow label="Offensive Rucks Won" statId="offRuckWon" />
                <CalculatedRow label="Offensive Won %" numeratorId="offRuckWon" denominatorId="offRuck" />
            </div>

            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '8px', color: '#03dac6' }}>PRESSURES</h3>
                <StatRow label="Opp Possessions" statId="oppPossessions" />
                <StatRow label="Pressures" statId="pressures" />
                <StatRow label="Turnovers" statId="turnovers" />
                <StatRow label="Frees Against" statId="freesAgainst" />
            </div>

            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '8px', color: '#03dac6' }}>ATTACK</h3>
                <StatRow label="Inside 65" statId="ballInside65" />
                <StatRow label="Shots" statId="shotTaken" />
                <StatRow label="Scores" statId="score" />
                <StatRow label="Wides" statId="wide" />
                <StatRow label="Short" statId="short" />
                <StatRow label="Saved" statId="saved" />
                <StatRow label="Off Post" statId="offPost" />
                <StatRow label="Frees Won Insid" statId="freeWon" />
                <StatRow label="45s Won" statId="45Won" />
                <StatRow label="Penalty Won" statId="penaltyWon" />
                <StatRow label="Score from Free" statId="scoreFree" />
                <StatRow label="Score from Penalty" statId="penalty" />
                <StatRow label="Score 45" statId="score45" />
                <StatRow label="Shot from > 65" statId="shot65" />
                <StatRow label="Wide from > 65" statId="wide65" />
                <StatRow label="Point from > 65" statId="point65" />
            </div>

            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '8px', color: '#03dac6' }}>FREES</h3>
                <StatRow label={`${matchInfo.homeTeam || 'Home'} Conceded`} statId="freeConcededHome" />
                <StatRow label={`${matchInfo.awayTeam || 'Away'} Conceded`} statId="freeConcededAway" />
            </div>

            {/* Visual Analysis Section - PDF Only or if Force Layout in Manual Dashboard? 
                 In ManualDashboardView it's always shown (no, only if PDF mode).
                 Wait, ManualDashboardView shows logic: {isPdfMode && ...}.
                 So we keep that logic.
             */}
            {isPdfMode && (
                <div style={{ marginTop: '40px', pageBreakBefore: 'always' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000', marginBottom: '20px', textAlign: 'center' }}>Visual Match Report</h2>

                    {/* Shot Analysis Hero Section */}
                    <div className="chart-container" style={{
                        marginBottom: '40px',
                        backgroundColor: '#f5f5f5',
                        padding: '30px',
                        borderRadius: '12px',
                        border: '1px solid #ccc',
                        pageBreakInside: 'avoid'
                    }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '25px', color: '#000', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Shot Analysis</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                            {/* Hero Metric: Shot Attempts */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.9rem', color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>Shot Attempts</div>
                                <div style={{ fontSize: '7.5rem', fontWeight: 'bold', color: getPctColor(territorialEffectiveness), lineHeight: '1.1' }}>
                                    {territorialEffectiveness}%
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>Territorial Effectiveness</div>
                            </div>

                            {/* Sub-Hero Row: Efficiency & Frees Won -> Scaled to 3.5rem */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '15px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Efficiency</div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: getPctColor(shotEfficiency) }}>{shotEfficiency}%</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Frees Won</div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 'bold' }}>{totalFreesWon}</div>
                                </div>
                            </div>

                            {/* Secondary Metrics -> Scaled to 1.8rem */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', width: '100%', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '15px 0' }}>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Played Inside 65</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{totalAttacks}</div>
                                </div>
                                <div style={{ borderLeft: '1px solid #ddd' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Shots Attempted</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{totalShots}</div>
                                </div>
                                <div style={{ borderLeft: '1px solid #ddd' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Scores</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4caf50' }}>{totalScores}</div>
                                </div>
                            </div>

                            {/* Pie Chart at the bottom */}
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <PieChart width={480} height={300}>
                                    <Pie
                                        data={shotData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        isAnimationActive={false}
                                        label={renderCustomLabel}
                                        labelLine={true}
                                    >
                                        {shotData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Legend layout="horizontal" verticalAlign="bottom" iconSize={10} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                </PieChart>
                            </div>
                        </div>
                    </div>

                    {/* Pressure Analysis */}
                    <div className="chart-container" style={{
                        marginTop: '60px',
                        marginBottom: '24px',
                        backgroundColor: '#f5f5f5',
                        padding: '24px',
                        borderRadius: '8px',
                        color: '#333',
                        pageBreakInside: 'avoid',
                        pageBreakBefore: 'always'
                    }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center', color: '#000' }}>Pressure Analysis</h3>

                        {/* Metrics at the top */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                            {/* Huge Efficiency Meter */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.9rem', color: '#666', textTransform: 'uppercase', marginBottom: '5px' }}>Efficiency / WorkRate</div>
                                <div style={{ fontSize: '7.5rem', fontWeight: 'bold', color: getPctColor(pressureEfficiency), lineHeight: '1' }}>
                                    {pressureEfficiency}%
                                </div>
                            </div>

                            {/* Possessions / Pressures (now above KPIs) -> Scaled to 3.5rem */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', width: '100%', maxWidth: '600px', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '15px 0' }}>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Possessions</div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 'bold' }}>{totalPossessions}</div>
                                </div>
                                <div style={{ borderLeft: '1px solid #ddd' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Pressures</div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#4caf50' }}>{totalPressures}</div>
                                </div>
                            </div>

                            {/* Secondary Metrics (KPIs) -> Scaled to 1.8rem */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', width: '100%', borderBottom: '1px solid #ddd', padding: '15px 0' }}>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Turnovers</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4caf50' }}>{totalTurnovers}</div>
                                </div>
                                <div style={{ borderLeft: '1px solid #ddd' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Success %</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{successRate}%</div>
                                </div>
                                <div style={{ borderLeft: '1px solid #ddd' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Free Rate %</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#cf6679' }}>{freeRate}%</div>
                                </div>
                                <div style={{ borderLeft: '1px solid #ddd' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Frees Against</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ff9800' }}>{totalFreesAgainst}</div>
                                </div>
                            </div>

                            {/* Smaller Chart at the bottom */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                                <BarChart width={450} height={250} data={pressureBarData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                    <XAxis dataKey="name" stroke="#333" fontSize={10} />
                                    <YAxis stroke="#333" fontSize={10} />
                                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                                    <Bar dataKey="Possessions" fill="#bb86fc" isAnimationActive={false} />
                                    <Bar dataKey="Pressures" fill="#4caf50" isAnimationActive={false} />
                                </BarChart>
                            </div>

                            {/* Standard Metrics - Removed and moved above chart */}

                            {/* KPI Guide */}
                            <div style={{
                                marginTop: '30px',
                                padding: '20px',
                                backgroundColor: '#f9f9f9',
                                borderRadius: '10px',
                                border: '1px solid #ddd',
                                fontSize: '0.85rem',
                                color: '#333',
                                lineHeight: '1.6',
                                pageBreakInside: 'avoid',
                                width: '100%',
                                maxWidth: '100%',
                                textAlign: 'center'
                            }}>
                                <h4 style={{ color: '#000', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>KPI: Pressure Efficiency</h4>
                                <p style={{ margin: '0 0 10px 0' }}><strong>What it measures:</strong> The percentage of opposition possessions met with an active "Pressure" (tackle, hook, block, or forced error).</p>

                                <div style={{ marginTop: '15px' }}>
                                    <strong>Why it matters:</strong>
                                    <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '5px 0' }}>
                                        <li><strong>Work Rate:</strong> Shows intensity in closing down space and disrupting opposition rhythm.</li>
                                        <li><strong>Quality of Defense:</strong> Focuses on how many times we allowed the opposition to play comfortably.</li>
                                    </ul>
                                </div>

                                <div style={{ marginTop: '15px' }}>
                                    <strong>The Goal:</strong> Aim for <strong>60% or higher</strong>. Low Efficiency (&lt;45%) means opposition is given too much time to pick out passes and set up scoring opportunities.
                                </div>

                                <div style={{ marginTop: '15px', backgroundColor: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #eee' }}>
                                    <strong>How to read it:</strong>
                                    <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '5px 0' }}>
                                        <li><strong>High Efficiency (&gt;60%):</strong> Suffocating the opposition, forcing panic passes and high turnover rates.</li>
                                        <li><strong>Low Efficiency (&lt;45%):</strong> Opposition has "easy ball" and plays without fear of being tackled.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ruck Analysis */}
                    <div className="chart-container" style={{
                        marginTop: '60px',
                        marginBottom: '40px',
                        backgroundColor: '#f5f5f5',
                        padding: '30px',
                        borderRadius: '12px',
                        border: '1px solid #ccc',
                        pageBreakInside: 'avoid',
                        color: '#333'
                    }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '25px', color: '#000', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Ruck Analysis</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                            {/* Hero Metric: Efficiency */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.9rem', color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Ruck Efficiency</div>
                                <div style={{ fontSize: '7.5rem', fontWeight: 'bold', color: getPctColor(ruckEfficiency), lineHeight: '1.1' }}>
                                    {ruckEfficiency}%
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>Possession Won from Rucks</div>
                            </div>

                            {/* Row 1: Basic Stats */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', width: '100%', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '20px 0' }}>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Total Rucks</div>
                                    <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#000' }}>{totalRucks}</div>
                                </div>
                                <div style={{ borderLeft: '1px solid #ddd' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Rucks Won</div>
                                    <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#4caf50' }}>{rucksWon}</div>
                                </div>
                                <div style={{ borderLeft: '1px solid #ddd' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Rucks Lost</div>
                                    <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#cf6679' }}>{Math.max(0, totalRucks - rucksWon)}</div>
                                </div>
                            </div>

                            {/* Row 2: Zone Efficiency */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', width: '100%', paddingBottom: '20px', borderBottom: '1px solid #ddd' }}>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Defensive %</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: getPctColor(defRuckPct) }}>{defRuckPct}%</div>
                                </div>
                                <div style={{ borderLeft: '1px solid #ddd' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Midfield %</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: getPctColor(midRuckPct) }}>{midRuckPct}%</div>
                                </div>
                                <div style={{ borderLeft: '1px solid #ddd' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Forwards %</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: getPctColor(offRuckPct) }}>{offRuckPct}%</div>
                                </div>
                            </div>

                            <div style={{ height: '300px', width: '100%', maxWidth: '500px', display: 'flex', justifyContent: 'center' }}>
                                <BarChart width={500} height={300} data={ruckBarData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" vertical={false} />
                                    <XAxis dataKey="name" stroke="#333" fontSize={12} />
                                    <YAxis stroke="#333" fontSize={12} />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                    <Bar dataKey="Total" fill="#bb86fc" isAnimationActive={false} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Won" fill="#00c853" isAnimationActive={false} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </div>

                            {/* KPI Guide */}
                            <div style={{
                                marginTop: '10px',
                                padding: '20px',
                                backgroundColor: '#f9f9f9',
                                borderRadius: '10px',
                                border: '1px solid #ddd',
                                fontSize: '0.85rem',
                                color: '#333',
                                lineHeight: '1.6',
                                pageBreakInside: 'avoid',
                                width: '100%',
                                maxWidth: '100%',
                                textAlign: 'center'
                            }}>
                                <h4 style={{ color: '#000', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>KPI: Ruck Efficiency</h4>
                                <p style={{ margin: '0 0 10px 0' }}><strong>What it measures:</strong> The percentage of contested "ruck" situations (loose ball contests) where our team emerged with possession.</p>

                                <div style={{ marginTop: '15px' }}>
                                    <strong>Why it matters:</strong>
                                    <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '5px 0' }}>
                                        <li><strong>Possession Control & Physical Dominance:</strong> It is a double-edged sword. Dominating rucks ensures we deprive opposition possession, giving us valuable ball to distribute to our inside line.</li>
                                        <li><strong>Consequences of Loss:</strong> Losing Rucks battle we burn energy winning ball back, gives oppositions a platform to attack us and denies us possession to feed our forwards.</li>
                                    </ul>
                                </div>

                                <div style={{ marginTop: '15px', backgroundColor: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #eee' }}>
                                    <strong>How to read it:</strong>
                                    <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '5px 0' }}>
                                        <li><strong>High Efficiency (&gt;60%):</strong> Total dominance in physical duels, sustaining pressure and keeping possession.</li>
                                        <li><strong>Low Efficiency (&lt;45%):</strong> Struggling to secure loose ball, allowing the opposition to break and transition easily.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Puckout Analysis */}
                    <div className="chart-container" style={{
                        marginTop: '60px',
                        marginBottom: '24px',
                        backgroundColor: '#f5f5f5',
                        padding: '16px',
                        borderRadius: '8px',
                        color: '#333',
                        pageBreakInside: 'avoid',
                        pageBreakBefore: 'always'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                            {/* Hero Metrics: % Won */}
                            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '40px', width: '100%', maxWidth: '800px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#666', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '5px' }}>Own Puckouts Won</div>
                                    <div style={{ fontSize: '7.5rem', fontWeight: 'bold', color: getPctColor(ownPuckoutWonPct), lineHeight: '1.1' }}>
                                        {ownPuckoutWonPct}%
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px', marginBottom: '15px' }}>Possession Retained</div>

                                    {/* Grouped Metrics */}
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                        <KPICard title="Own Won" value={sumStats('ownPuckoutWon')} color="#4caf50" bgColor="#fff" titleColor="#666" />
                                        <KPICard title="Own Lost" value={Math.max(0, sumStats('ownPuckout') - sumStats('ownPuckoutWon'))} color="#cf6679" bgColor="#fff" titleColor="#666" />
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#666', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '5px' }}>Opposition Puckouts Won</div>
                                    <div style={{ fontSize: '7.5rem', fontWeight: 'bold', color: getPctColor(oppPuckoutWonPct), lineHeight: '1.1' }}>
                                        {oppPuckoutWonPct}%
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px', marginBottom: '15px' }}>Possession Won</div>

                                    {/* Grouped Metrics */}
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                        <KPICard title="Opp Won" value={sumStats('oppPuckoutWon')} color="#03dac6" bgColor="#fff" titleColor="#666" />
                                        <KPICard title="Opp Lost" value={Math.max(0, sumStats('oppPuckout') - sumStats('oppPuckoutWon'))} color="#bb86fc" bgColor="#fff" titleColor="#666" />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', width: '100%' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <h4 style={{ color: '#666', marginBottom: '5px' }}>Own Puckouts</h4>
                                    <PieChart width={250} height={250}>
                                        <Pie
                                            data={ownPuckoutData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                            isAnimationActive={false}
                                            label={renderCustomLabel}
                                            labelLine={true}
                                        >
                                            {ownPuckoutData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <h4 style={{ color: '#666', marginBottom: '5px' }}>Opposition Puckouts</h4>
                                    <PieChart width={250} height={250}>
                                        <Pie
                                            data={oppPuckoutData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                            isAnimationActive={false}
                                            label={renderCustomLabel}
                                            labelLine={true}
                                        >
                                            {oppPuckoutData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pitch Summaries */}
                    <div style={{ marginTop: '60px', pageBreakInside: 'avoid' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000', marginBottom: '20px', textAlign: 'center' }}>Pitch Maps - 1st Half</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>HOME: {matchInfo.homeTeam} Scores</h3>
                                <PitchSummary data={firstHalfScores.filter(s => s.team === 'home')} type="scores" />
                            </div>
                            <div>
                                <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>AWAY: {matchInfo.awayTeam} Scores</h3>
                                <PitchSummary data={firstHalfScores.filter(s => s.team === 'away')} type="scores" />
                            </div>
                        </div>
                    </div>

                    <div className="html2pdf__page-break"></div>
                    <div style={{ marginTop: '40px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000', marginBottom: '20px', textAlign: 'center' }}>Pitch Maps - 2nd Half</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>HOME: {matchInfo.homeTeam} Scores</h3>
                                <PitchSummary data={secondHalfScores.filter(s => s.team === 'home')} type="scores" />
                            </div>
                            <div>
                                <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>AWAY: {matchInfo.awayTeam} Scores</h3>
                                <PitchSummary data={secondHalfScores.filter(s => s.team === 'away')} type="scores" />
                            </div>
                        </div>
                    </div>

                </div>
            )}

            <style>{`
                .summary-cards-container {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                @media (min-width: 768px) {
                    .summary-cards-container {
                        grid-template-columns: 1fr 1fr;
                    }
                }

                .half-row { color: #90caf9 !important; }
                
                .pdf-mode .half-row { color: #000000 !important; }
                .pdf-mode {
                    background-color: white !important;
                    color: black !important;
                }
                .pdf-mode .summary-card {
                    background-color: #f5f5f5 !important;
                    color: black !important;
                    border: 1px solid #ccc;
                    padding: 8px !important; /* Compact padding for PDF */
                }
                .pdf-mode .stat-row {
                    padding: 4px 0 !important; /* Compact padding for PDF */
                    font-size: 0.8rem !important;
                }
                .pdf-mode h2, .pdf-mode h3, .pdf-mode h4 {
                    color: black !important;
                }
            `}</style>
        </div>
    );
};

export default ManualMatchReport;
