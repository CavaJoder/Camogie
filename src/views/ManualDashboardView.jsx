import React, { useState } from 'react';
import { useMatch } from '../context/MatchContext';
import html2pdf from 'html2pdf.js';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import PitchSummary from '../components/PitchSummary';

const ManualDashboardView = () => {
    const { manualStats, matchInfo, manualPitchEvents } = useMatch();
    const [isPdfMode, setIsPdfMode] = useState(false);

    // Flatten manual pitch events to match DashboardView expectations
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

    // Filter Pitch Stats by Half
    const firstHalfScores = scores.filter(s => ['Q1', 'Q2'].includes(s.quarter));
    const secondHalfScores = scores.filter(s => ['Q3', 'Q4'].includes(s.quarter));
    const firstHalfPuckouts = puckouts.filter(p => ['Q1', 'Q2'].includes(p.quarter));
    const secondHalfPuckouts = puckouts.filter(p => ['Q3', 'Q4'].includes(p.quarter));

    // Helper to sum stats across specific quarters
    const sumStats = (statId, quarters = ['q1', 'q2', 'q3', 'q4']) => {
        return quarters.reduce((total, q) => {
            return total + (manualStats[q]?.[statId] || 0);
        }, 0);
    };

    // Helper to determine color based on quarter status (Simplified for Manual View - assume all active/past)
    const getQuarterColor = (q) => {
        return '#4caf50'; // Always green for manual view as data is entered manually
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = date.getDate();
        const ordinal = (day > 3 && day < 21) ? 'th' : ['th', 'st', 'nd', 'rd'][day % 10] || 'th';
        const month = date.toLocaleString('en-GB', { month: 'short' });
        const year = date.getFullYear();
        return `${day}${ordinal} ${month} ${year}`;
    };

    // --- Chart Data Preparation ---

    // Shot Analysis Data
    const shotData = [
        { name: 'Scores', value: sumStats('score'), color: '#4caf50' },
        { name: 'Wides', value: sumStats('wide'), color: '#cf6679' },
        { name: 'Short', value: sumStats('short'), color: '#ff9800' },
        { name: 'Saved', value: sumStats('saved'), color: '#ff9800' },
    ].filter(d => d.value > 0);

    // Pressure Bar Chart Data (Quarterly)
    const pressureBarData = ['q1', 'q2', 'q3', 'q4'].map(q => ({
        name: q.toUpperCase(),
        Possessions: manualStats[q]?.oppPossessions || 0,
        Pressures: manualStats[q]?.pressures || 0
    }));

    // Ruck Bar Chart Data (Quarterly)
    const ruckBarData = ['q1', 'q2', 'q3', 'q4'].map(q => {
        const total = (manualStats[q]?.defRuck || 0) + (manualStats[q]?.midRuck || 0) + (manualStats[q]?.offRuck || 0);
        const won = (manualStats[q]?.defRuckWon || 0) + (manualStats[q]?.midRuckWon || 0) + (manualStats[q]?.offRuckWon || 0);
        return {
            name: q.toUpperCase(),
            Total: total,
            Won: won
        };
    });

    // Zone Ruck Data (New Chart)
    const zoneRuckData = ['q1', 'q2', 'q3', 'q4'].map(q => ({
        name: q.toUpperCase(),
        defWon: manualStats[q]?.defRuckWon || 0,
        defLost: (manualStats[q]?.defRuck || 0) - (manualStats[q]?.defRuckWon || 0),
        midWon: manualStats[q]?.midRuckWon || 0,
        midLost: (manualStats[q]?.midRuck || 0) - (manualStats[q]?.midRuckWon || 0),
        offWon: manualStats[q]?.offRuckWon || 0,
        offLost: (manualStats[q]?.offRuck || 0) - (manualStats[q]?.offRuckWon || 0),
    }));

    // Puckout Data
    const ownPuckoutData = [
        { name: 'Won', value: sumStats('ownPuckoutWon'), color: '#4caf50' },
        { name: 'Lost', value: Math.max(0, sumStats('ownPuckout') - sumStats('ownPuckoutWon')), color: '#cf6679' },
    ].filter(d => d.value > 0);

    const oppPuckoutData = [
        { name: 'Won', value: sumStats('oppPuckoutWon'), color: '#03dac6' },
        { name: 'Lost', value: Math.max(0, sumStats('oppPuckout') - sumStats('oppPuckoutWon')), color: '#bb86fc' },
    ].filter(d => d.value > 0);

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

    const generatePDF = () => {
        setIsPdfMode(true);

        setTimeout(() => {
            const element = document.getElementById('printableStats');
            const opt = {
                margin: 10,
                filename: `Manual_Match_Analysis_${matchInfo.homeTeam}_vs_${matchInfo.awayTeam}_${matchInfo.date}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            html2pdf().set(opt).from(element).save().then(() => {
                setIsPdfMode(false);
            });
        }, 500);
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

    const getPctValue = (quarters, type) => {
        const { pct } = getStats(quarters, type);
        return pct;
    };

    const getPctColor = (val) => {
        if (val === null) return 'inherit';
        if (val <= 45) return '#cf6679'; // Red
        if (val < 60) return '#ff9800'; // Amber
        return '#4caf50'; // Green
    };

    const SummaryCard = ({ title, type }) => {
        const rows = [
            { label: 'Q1:', quarters: ['q1'] },
            { label: 'Q2:', quarters: ['q2'] },
            { label: 'Q3:', quarters: ['q3'] },
            { label: 'Q4:', quarters: ['q4'] },
            { label: '1st Half:', quarters: ['q1', 'q2'], isHalf: true },
            { label: '2nd Half:', quarters: ['q3', 'q4'], isHalf: true },
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

    const StatRow = ({ label, statId }) => {
        const q1 = manualStats.q1[statId] || 0;
        const q2 = manualStats.q2[statId] || 0;
        const q3 = manualStats.q3[statId] || 0;
        const q4 = manualStats.q4[statId] || 0;
        const total = q1 + q2 + q3 + q4;

        return (
            <div className="stat-row" style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                padding: '12px 0',
                borderBottom: '1px solid #333',
                fontSize: '0.9rem'
            }}>
                <span className="stat-label" style={{ color: '#fff' }}>{label}</span>
                <span className="stat-value" style={{ textAlign: 'center', color: getQuarterColor('Q1') }}>{q1}</span>
                <span className="stat-value" style={{ textAlign: 'center', color: getQuarterColor('Q2') }}>{q2}</span>
                <span className="stat-value" style={{ textAlign: 'center', color: getQuarterColor('Q3') }}>{q3}</span>
                <span className="stat-value" style={{ textAlign: 'center', color: getQuarterColor('Q4') }}>{q4}</span>
                <span className="stat-value" style={{ textAlign: 'center', fontWeight: 'bold', color: '#03dac6' }}>{total}</span>
            </div>
        );
    };

    const CalculatedRow = ({ label, numeratorId, denominatorId }) => {
        const getPctValue = (q) => {
            const num = manualStats[q]?.[numeratorId] || 0;
            const den = manualStats[q]?.[denominatorId] || 0;
            return den > 0 ? Math.round((num / den) * 100) : null;
        };

        const q1Val = getPctValue('q1');
        const q2Val = getPctValue('q2');
        const q3Val = getPctValue('q3');
        const q4Val = getPctValue('q4');

        const totalNum = (manualStats.q1?.[numeratorId] || 0) + (manualStats.q2?.[numeratorId] || 0) + (manualStats.q3?.[numeratorId] || 0) + (manualStats.q4?.[numeratorId] || 0);
        const totalDen = (manualStats.q1?.[denominatorId] || 0) + (manualStats.q2?.[denominatorId] || 0) + (manualStats.q3?.[denominatorId] || 0) + (manualStats.q4?.[denominatorId] || 0);
        const totalVal = totalDen > 0 ? Math.round((totalNum / totalDen) * 100) : null;

        return (
            <div className="stat-row" style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                padding: '12px 0',
                borderBottom: '1px solid #333',
                fontSize: '0.9rem',
                backgroundColor: 'rgba(255,255,255,0.02)'
            }}>
                <span className="stat-label" style={{ color: '#b0b0b0', paddingLeft: '16px', fontStyle: 'italic' }}>{label}</span>
                <span className="stat-value" style={{ textAlign: 'center', color: getPctColor(q1Val) }}>{q1Val !== null ? q1Val + '%' : '-'}</span>
                <span className="stat-value" style={{ textAlign: 'center', color: getPctColor(q2Val) }}>{q2Val !== null ? q2Val + '%' : '-'}</span>
                <span className="stat-value" style={{ textAlign: 'center', color: getPctColor(q3Val) }}>{q3Val !== null ? q3Val + '%' : '-'}</span>
                <span className="stat-value" style={{ textAlign: 'center', color: getPctColor(q4Val) }}>{q4Val !== null ? q4Val + '%' : '-'}</span>
                <span className="stat-value" style={{ textAlign: 'center', fontWeight: 'bold', color: getPctColor(totalVal) }}>{totalVal !== null ? totalVal + '%' : '-'}</span>
            </div>
        );
    };

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

    // --- New Stats Calculations for Visual Analysis ---

    // Shooting Analysis
    const totalAttacks = sumStats('ballInside65');
    const totalShots = sumStats('shotTaken');
    const totalScores = sumStats('score');
    const territorialEffectiveness = totalAttacks > 0 ? Math.round((totalShots / totalAttacks) * 100) : 0;
    const shotEfficiency = totalShots > 0 ? Math.round((totalScores / totalShots) * 100) : 0;

    // Pressure Analysis
    const totalPossessions = sumStats('oppPossessions');
    const totalPressures = sumStats('pressures');
    const totalFreesAgainst = sumStats('freesAgainst');
    const totalTurnovers = sumStats('turnovers');
    const pressureEfficiency = totalPossessions > 0 ? Math.round((totalPressures / totalPossessions) * 100) : 0;
    const freeRate = totalPressures > 0 ? Math.round((totalFreesAgainst / totalPressures) * 100) : 0;
    const successRate = totalPressures > 0 ? Math.round((totalTurnovers / totalPressures) * 100) : 0;

    // Ruck Analysis
    const totalRucks = sumStats('defRuck') + sumStats('midRuck') + sumStats('offRuck');
    const rucksWon = sumStats('defRuckWon') + sumStats('midRuckWon') + sumStats('offRuckWon');
    const ruckEfficiency = totalRucks > 0 ? Math.round((rucksWon / totalRucks) * 100) : 0;

    return (
        <div style={{ padding: '20px', paddingBottom: '80px' }}>
            <div id="printableStats" className={isPdfMode ? 'pdf-mode' : ''}>

                {/* PDF Header - Only visible in PDF Mode */}
                {isPdfMode && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '20px' }}>
                        {matchInfo.homeCrest ? <img src={matchInfo.homeCrest} style={{ width: '80px', height: '80px', objectFit: 'contain' }} alt="Home Crest" /> : <div></div>}
                        <div style={{ textAlign: 'center' }}>
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#000' }}>{matchInfo.homeTeam || 'HOME'} vs {matchInfo.awayTeam || 'AWAY'}</h1>
                            <p style={{ color: '#666', margin: '5px 0' }}>{[formatDate(matchInfo.date), matchInfo.competition, matchInfo.venue].filter(Boolean).join(' • ')}</p>
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
                <h2 className="detailed-stats-header" style={{ fontSize: '1.2rem', margin: '24px 0 16px', color: '#bb86fc' }}>Detailed Statistics</h2>

                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '8px', color: '#03dac6' }}>PUCKOUTS</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', marginBottom: '8px', color: '#03dac6', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        <span className="stat-label">Quarter</span>
                        <span style={{ textAlign: 'center' }}>Q1</span>
                        <span style={{ textAlign: 'center' }}>Q2</span>
                        <span style={{ textAlign: 'center' }}>Q3</span>
                        <span style={{ textAlign: 'center' }}>Q4</span>
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
                    <StatRow label="Frees Won" statId="freeWon" />
                    <StatRow label="45s Won" statId="45Won" />
                </div>

                {/* Visual Analysis Section - PDF Only */}
                {isPdfMode && (
                    <div style={{ marginTop: '40px', pageBreakBefore: 'always' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000', marginBottom: '20px', textAlign: 'center' }}>Visual Match Report</h2>

                        {/* Shot Analysis */}
                        <div className="chart-container" style={{
                            marginBottom: '24px',
                            backgroundColor: '#f5f5f5',
                            padding: '16px',
                            borderRadius: '8px',
                            color: '#333',
                            pageBreakInside: 'avoid'
                        }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '10px', textAlign: 'center' }}>Shot Analysis</h3>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                                <PieChart width={400} height={300}>
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
                                    <Legend layout="horizontal" verticalAlign="bottom" iconSize={10} wrapperStyle={{ fontSize: '12px', color: '#333' }} />
                                </PieChart>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <KPICard title="Total Shots" value={totalShots} color="#333" bgColor="#fff" titleColor="#666" />
                                <KPICard title="Scores" value={totalScores} color="#4caf50" bgColor="#fff" titleColor="#666" />
                                <KPICard title="Efficiency" value={`${shotEfficiency}%`} color="#333" bgColor="#fff" titleColor="#666" />
                                <KPICard title="Territorial" value={`${territorialEffectiveness}%`} sub="Shots/Entries" color="#333" bgColor="#fff" titleColor="#666" />
                            </div>
                        </div>

                        {/* Pressure Analysis */}
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
                            <h3 style={{ fontSize: '1rem', marginBottom: '10px', textAlign: 'center' }}>Pressure Analysis</h3>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                                <BarChart width={500} height={300} data={pressureBarData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                    <XAxis dataKey="name" stroke="#333" />
                                    <YAxis stroke="#333" />
                                    <Legend wrapperStyle={{ color: '#333' }} />
                                    <Bar dataKey="Possessions" fill="#bb86fc" isAnimationActive={false} label={{ position: 'top', fill: '#333', fontSize: 12 }} />
                                    <Bar dataKey="Pressures" fill="#4caf50" isAnimationActive={false} label={{ position: 'top', fill: '#333', fontSize: 12 }} />
                                </BarChart>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <KPICard title="Pressures" value={totalPressures} color="#333" bgColor="#fff" titleColor="#666" />
                                <KPICard title="Turnovers" value={totalTurnovers} color="#4caf50" bgColor="#fff" titleColor="#666" />
                                <KPICard title="Efficiency" value={`${pressureEfficiency}%`} sub="Press/Poss" color="#333" bgColor="#fff" titleColor="#666" />
                                <KPICard title="Success Rate" value={`${successRate}%`} sub="Turn/Press" color="#333" bgColor="#fff" titleColor="#666" />
                            </div>
                        </div>

                        {/* Ruck Analysis */}
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
                            <h3 style={{ fontSize: '1rem', marginBottom: '10px', textAlign: 'center' }}>Ruck Analysis</h3>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                                <BarChart width={500} height={300} data={ruckBarData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                    <XAxis dataKey="name" stroke="#333" />
                                    <YAxis stroke="#333" />
                                    <Legend wrapperStyle={{ color: '#333' }} />
                                    <Bar dataKey="Total" fill="#bb86fc" isAnimationActive={false} label={{ position: 'top', fill: '#333', fontSize: 12 }} />
                                    <Bar dataKey="Won" fill="#00c853" isAnimationActive={false} label={{ position: 'top', fill: '#333', fontSize: 12 }} />
                                </BarChart>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <KPICard title="Total Rucks" value={totalRucks} color="#333" bgColor="#fff" titleColor="#666" />
                                <KPICard title="Rucks Won" value={rucksWon} color="#00c853" bgColor="#fff" titleColor="#666" />
                                <KPICard title="Efficiency" value={`${ruckEfficiency}%`} color="#333" bgColor="#fff" titleColor="#666" />
                            </div>
                        </div>

                        {/* Zone Ruck Analysis (New) */}
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
                            <h3 style={{ fontSize: '1rem', marginBottom: '10px', textAlign: 'center' }}>Ruck Analysis by Zone</h3>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <BarChart width={600} height={350} data={zoneRuckData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                    <XAxis dataKey="name" stroke="#333" />
                                    <YAxis stroke="#333" />
                                    <Legend wrapperStyle={{ color: '#333' }} />
                                    <Bar dataKey="defWon" stackId="def" fill="#4caf50" name="Def Won" isAnimationActive={false} />
                                    <Bar dataKey="defLost" stackId="def" fill="#cf6679" name="Def Lost" isAnimationActive={false} />
                                    <Bar dataKey="midWon" stackId="mid" fill="#4caf50" name="Mid Won" isAnimationActive={false} />
                                    <Bar dataKey="midLost" stackId="mid" fill="#cf6679" name="Mid Lost" isAnimationActive={false} />
                                    <Bar dataKey="offWon" stackId="off" fill="#4caf50" name="Off Won" isAnimationActive={false} />
                                    <Bar dataKey="offLost" stackId="off" fill="#cf6679" name="Off Lost" isAnimationActive={false} />
                                </BarChart>
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
                            <h3 style={{ fontSize: '1rem', marginBottom: '10px', textAlign: 'center' }}>Puckout Analysis</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', marginBottom: '10px' }}>
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
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <KPICard title="Own Won" value={sumStats('ownPuckoutWon')} color="#4caf50" bgColor="#fff" titleColor="#666" />
                                <KPICard title="Own Lost" value={Math.max(0, sumStats('ownPuckout') - sumStats('ownPuckoutWon'))} color="#cf6679" bgColor="#fff" titleColor="#666" />
                                <KPICard title="Opp Won" value={sumStats('oppPuckoutWon')} color="#03dac6" bgColor="#fff" titleColor="#666" />
                                <KPICard title="Opp Lost" value={Math.max(0, sumStats('oppPuckout') - sumStats('oppPuckoutWon'))} color="#bb86fc" bgColor="#fff" titleColor="#666" />
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
                                <div>
                                    <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>HOME: {matchInfo.homeTeam} Puckouts</h3>
                                    <PitchSummary data={firstHalfPuckouts.filter(p => p.team === 'home')} type="puckouts" />
                                </div>
                                <div>
                                    <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>AWAY: {matchInfo.awayTeam} Puckouts</h3>
                                    <PitchSummary data={firstHalfPuckouts.filter(p => p.team === 'away')} type="puckouts" />
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
                                <div>
                                    <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>HOME: {matchInfo.homeTeam} Puckouts</h3>
                                    <PitchSummary data={secondHalfPuckouts.filter(p => p.team === 'home')} type="puckouts" />
                                </div>
                                <div>
                                    <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>AWAY: {matchInfo.awayTeam} Puckouts</h3>
                                    <PitchSummary data={secondHalfPuckouts.filter(p => p.team === 'away')} type="puckouts" />
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
                /* Removed .pdf-mode span to allow inline colors */
            `}</style>
            </div>

            <button onClick={generatePDF} style={{
                width: '100%',
                backgroundColor: '#bb86fc',
                color: 'black',
                padding: '16px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1rem',
                marginTop: '20px'
            }}>
                {isPdfMode ? 'Generating PDF...' : 'Download Manual Match PDF'}
            </button>
        </div>
    );
};

export default ManualDashboardView;
