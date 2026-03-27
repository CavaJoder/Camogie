import React, { useState } from 'react';
import { useMatch } from '../context/MatchContext';
import html2pdf from 'html2pdf.js';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import PitchSummary from '../components/PitchSummary';

const DashboardView = () => {
    const { stats, timer, matchInfo, pitchStats } = useMatch();
    const [isPdfMode, setIsPdfMode] = useState(false);
    const [showPitchesInPdf, setShowPitchesInPdf] = useState(true);
    const [showFreesInPdf, setShowFreesInPdf] = useState(true);

    // Filter Pitch Stats by Half
    // INTEGRATION FIX: Flatten Pitch Stats for Visual Maps
    // pitchStats is partitioned by quarter (q1, q2...) so we must aggregate them first.
    const allPitchScores = [
        ...(pitchStats?.q1?.scores || []),
        ...(pitchStats?.q2?.scores || []),
        ...(pitchStats?.q3?.scores || []),
        ...(pitchStats?.q4?.scores || []),
        ...(pitchStats?.ft?.scores || [])
    ];

    // Filter by Half (Case Insensitive)
    const firstHalfScores = allPitchScores.filter(s => s && ['q1', 'q2'].includes(s.quarter?.toLowerCase()));
    const secondHalfScores = allPitchScores.filter(s => s && ['q3', 'q4', 'ft'].includes(s.quarter?.toLowerCase()));

    // Helper to safely get stat value (number or object.home)
    const getStatValue = (q, statId) => {
        const val = stats[q]?.[statId] || 0;
        return typeof val === 'object' ? (val.home || 0) : val;
    };

    // Helper to sum stats across specific quarters
    const sumStats = (statId, quarters = ['q1', 'q2', 'q3', 'q4']) => {
        return quarters.reduce((total, q) => {
            return total + getStatValue(q, statId);
        }, 0);
    };

    // INTEGRATION: Calculate totals from Pitch Events
    const getPitchTotal = (category) => {
        const allScores = [
            ...(pitchStats?.q1?.scores || []),
            ...(pitchStats?.q2?.scores || []),
            ...(pitchStats?.q3?.scores || []),
            ...(pitchStats?.q4?.scores || []),
            ...(pitchStats?.ft?.scores || [])
        ];

        switch (category) {
            case 'scores':
                // Sum of all successful scores from pitch
                return allScores.filter(s => s && ['point', 'goal', 'free', '45', 'penalty'].includes(s.type)).length;
            case 'totalShots':
                return allScores.filter(s => s && ['point', 'goal', 'free', '45', 'penalty', 'wide'].includes(s.type)).length;
            default:
                return 0;
        }
    };

    const getPuckoutTotal = (type, outcome) => {
        // type: 'own' or 'opp'. 'own' = matchInfo.homeTeam usually?
        // Wait, Dashboard logic for 'ownPuckout' usually implies user's team.
        // In this app context, 'Home' is usually the user's team or the primary tracking target.
        // Pitch Events have explicit 'team' property ('home' or 'away').

        // Let's assume 'own' = 'home' and 'opp' = 'away' for the default dashboard view.
        // If the user is tracking 'Away', this might be inverted, but standard usage is Home = Us.

        const targetTeam = type === 'own' ? 'home' : 'away'; // Simplified assumption

        const allPuckouts = [
            ...(pitchStats?.q1?.puckouts || []),
            ...(pitchStats?.q2?.puckouts || []),
            ...(pitchStats?.q3?.puckouts || []),
            ...(pitchStats?.q4?.puckouts || []),
            ...(pitchStats?.ft?.puckouts || [])
        ];

        const teamPuckouts = allPuckouts.filter(p => p && p.team === targetTeam);

        if (outcome === 'won') return teamPuckouts.filter(p => p.outcome === 'won').length;
        if (outcome === 'total') return teamPuckouts.length;
        return 0;
    };

    const getTeamScore = (team) => {
        const allScores = [
            ...(pitchStats?.q1?.scores || []),
            ...(pitchStats?.q2?.scores || []),
            ...(pitchStats?.q3?.scores || []),
            ...(pitchStats?.q4?.scores || []),
            ...(pitchStats?.ft?.scores || [])
        ];
        const scores = allScores.filter(s => s && s.team === team);
        const goals = scores.filter(s => s.type === 'goal' || s.type === 'penalty').length;
        const points = scores.filter(s => s.type === 'point' || s.type === 'free' || s.type === '45').length;
        const total = (goals * 3) + points;
        return { goals, points, total };
    };

    const homeScore = getTeamScore('home');
    const awayScore = getTeamScore('away');

    // Helper to determine color based on quarter status
    const getQuarterColor = (q) => {
        const order = ['Q1', 'Q2', 'Q3', 'Q4', 'FT'];
        const currentIdx = order.indexOf(timer.quarter);
        const qIdx = order.indexOf(q.toUpperCase());

        if (currentIdx > qIdx) return '#4caf50'; // Completed
        if (currentIdx === qIdx) return '#cf6679'; // In Progress
        return '#b0b0b0'; // Future (Grey)
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

    // Shot Analysis Data (Integrated)
    // We sum Manual Stats AND Pitch Stats to capture all input methods.
    // Note: If user double-enters, it double-counts. Valid constraint.
    const shotData = [
        {
            name: 'Scores',
            // INTEGRATION FIX: We now sync Pitch -> Stats, so ONLY use Stats to avoid double counting.
            value: sumStats('score') + sumStats('scoreFree') + sumStats('score45') + sumStats('penalty') + sumStats('point65'),
            color: '#4caf50'
        },
        {
            name: 'Wides',
            value: sumStats('wide') + sumStats('wide65'),
            color: '#cf6679'
        },
        { name: 'Short', value: sumStats('short'), color: '#ff9800' },
        { name: 'Saved', value: sumStats('saved'), color: '#ff9800' },
    ].filter(d => d.value > 0);

    // Pressure Bar Chart Data (Quarterly)
    const pressureBarData = ['q1', 'q2', 'q3', 'q4'].map(q => ({
        name: q.toUpperCase(),
        Possessions: getStatValue(q, 'oppPossessions'),
        Pressures: getStatValue(q, 'pressures')
    }));

    // Ruck Bar Chart Data (Quarterly)
    const ruckBarData = ['q1', 'q2', 'q3', 'q4'].map(q => {
        const total = getStatValue(q, 'defRuck') + getStatValue(q, 'midRuck') + getStatValue(q, 'offRuck');
        const won = getStatValue(q, 'defRuckWon') + getStatValue(q, 'midRuckWon') + getStatValue(q, 'offRuckWon');
        return {
            name: q.toUpperCase(),
            Total: total,
            Won: won
        };
    });

    // Zone Ruck Data (New Chart)
    const zoneRuckData = ['q1', 'q2', 'q3', 'q4'].map(q => ({
        name: q.toUpperCase(),
        defWon: getStatValue(q, 'defRuckWon'),
        defLost: getStatValue(q, 'defRuck') - getStatValue(q, 'defRuckWon'),
        midWon: getStatValue(q, 'midRuckWon'),
        midLost: getStatValue(q, 'midRuck') - getStatValue(q, 'midRuckWon'),
        offWon: getStatValue(q, 'offRuckWon'),
        offLost: getStatValue(q, 'offRuck') - getStatValue(q, 'offRuckWon'),
    }));

    // Puckout Data (Integrated)
    const ownPuckoutData = [
        {
            name: 'Won',
            // Sync Fix: Only use stats
            value: sumStats('ownPuckoutWon'),
            color: '#4caf50'
        },
        {
            name: 'Lost',
            // Total - Won
            value: Math.max(0, sumStats('ownPuckout') - sumStats('ownPuckoutWon')),
            color: '#cf6679'
        },
    ].filter(d => d.value > 0);

    // Aggregate frees across all quarters
    const allFrees = [
        ...(pitchStats?.q1?.frees || []),
        ...(pitchStats?.q2?.frees || []),
        ...(pitchStats?.q3?.frees || []),
        ...(pitchStats?.q4?.frees || []),
        ...(pitchStats?.ft?.frees || [])
    ].filter(Boolean);

    // Free Type Breakdown (kept for on-screen live view only)
    const freeTypeCounts = allFrees.reduce((acc, free) => {
        const type = free.type || 'Other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const COLORS = ['#bb86fc', '#03dac6', '#4caf50', '#ff9800', '#cf6679', '#018786', '#03a9f4', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff5722', '#795548'];
    const freeTypeData = Object.keys(freeTypeCounts).map((type, index) => ({
        name: type,
        value: freeTypeCounts[type],
        color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value);

    const oppPuckoutData = [
        {
            name: 'Won',
            // Sync Fix: Only use stats
            value: sumStats('oppPuckoutWon'),
            color: '#03dac6'
        },
        {
            name: 'Lost',
            value: Math.max(0, sumStats('oppPuckout') - sumStats('oppPuckoutWon')),
            color: '#bb86fc'
        },
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
                filename: `Match_Analysis_${matchInfo.homeTeam}_vs_${matchInfo.awayTeam}_${matchInfo.date}.pdf`,
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

    // Helper to get stats for a specific quarter from Pitch Events
    const getPitchQuarterStats = (q) => {
        const events = pitchStats?.[q] || {};
        const scores = events.scores || [];
        const puckouts = events.puckouts || [];

        // Scores
        const successfulScores = scores.filter(s => s && ['point', 'goal', 'free', '45', 'penalty'].includes(s.type)).length;
        const wides = scores.filter(s => s && s.type === 'wide').length;
        const totalShots = successfulScores + wides; // Pitch shots = scores + wides

        // Puckouts
        const ownPuckouts = puckouts.filter(p => p && p.team === 'home'); // Assuming home = own
        const ownWon = ownPuckouts.filter(p => p.outcome === 'won').length;
        const oppPuckouts = puckouts.filter(p => p && p.team === 'away');
        const oppWon = oppPuckouts.filter(p => p.outcome === 'won').length;

        return { successfulScores, totalShots, ownPuckouts: ownPuckouts.length, ownWon, oppPuckouts: oppPuckouts.length, oppWon };
    };

    const getStats = (quarters, type) => {
        let value = 0;
        let total = 0;

        quarters.forEach(q => {
            // const pitch = getPitchQuarterStats(q); // Pitch stats are now synced to manual stats

            if (type === 'rucks') {
                const rucks = getStatValue(q, 'defRuck') + getStatValue(q, 'midRuck') + getStatValue(q, 'offRuck');
                const won = getStatValue(q, 'defRuckWon') + getStatValue(q, 'midRuckWon') + getStatValue(q, 'offRuckWon');
                value += won;
                total += rucks;
            } else if (type === 'possession') {
                const oppPoss = getStatValue(q, 'oppPossessions');
                const pressures = getStatValue(q, 'pressures');
                value += pressures;
                total += oppPoss;
            } else if (type === 'attack') {
                // Attack Efficiency: Scores vs Attempts
                const shots = getStatValue(q, 'shotTaken') + getStatValue(q, 'freeWon') + getStatValue(q, '45Won') + getStatValue(q, 'shot65');
                const score = getStatValue(q, 'score') + getStatValue(q, 'scoreFree') + getStatValue(q, 'score45') + getStatValue(q, 'point65');
                value += score;
                total += shots;
            } else if (type === 'ownPuckouts') {
                const tot = getStatValue(q, 'ownPuckout');
                const won = getStatValue(q, 'ownPuckoutWon');
                value += won;
                total += tot;
            } else if (type === 'oppPuckouts') {
                const tot = getStatValue(q, 'oppPuckout');
                const won = getStatValue(q, 'oppPuckoutWon');
                value += won;
                total += tot;
            } else if (type === 'puckouts') {
                const tot = getStatValue(q, 'oppPuckout') + getStatValue(q, 'ownPuckout');
                const won = getStatValue(q, 'oppPuckoutWon') + getStatValue(q, 'ownPuckoutWon');
                value += won;
                total += tot;
            } else if (type === 'conversion') {
                const entries = getStatValue(q, 'ballInside65');
                const shots = getStatValue(q, 'shotTaken') + getStatValue(q, 'freeWon') + getStatValue(q, '45Won') + getStatValue(q, 'shot65');
                value += shots;
                total += entries;
            } else if (type === 'efficiency' || type === 'scoring') {
                const shots = getStatValue(q, 'shotTaken') + getStatValue(q, 'freeWon') + getStatValue(q, '45Won') + getStatValue(q, 'shot65');
                const scores = getStatValue(q, 'score') + getStatValue(q, 'scoreFree') + getStatValue(q, 'score45') + getStatValue(q, 'point65');
                value += scores;
                total += shots;
            } else if (type === 'freeRate') {
                const frees = getStatValue(q, 'freesAgainst');
                const pressures = getStatValue(q, 'pressures');
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

                    const showSeparatorBefore = (row.isHalf && row.label === '1st Half') || (row.label === 'Q1:' && idx > 0);
                    const showSeparatorUnderQ4 = row.label === 'Q4:';
                    const showSeparatorBeforeTotal = row.isTotal;

                    return (
                        <React.Fragment key={idx}>
                            {showSeparatorBefore && <div style={{ borderTop: '1px dashed #333', margin: '8px 0' }} />}
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
                            {showSeparatorUnderQ4 && <div style={{ borderTop: '1px solid #333', margin: '8px 0' }} />}
                            {showSeparatorBeforeTotal && idx < rows.length - 1 && <div style={{ borderTop: '1px solid #333', margin: '8px 0' }} />}
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    const StatRow = ({ label, statId }) => {
        const q1 = getStatValue('q1', statId);
        const q2 = getStatValue('q2', statId);
        const q3 = getStatValue('q3', statId);
        const q4 = getStatValue('q4', statId);
        const total = q1 + q2 + q3 + q4;

        return (
            <div className="stat-row" style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                padding: '12px 0',
                borderBottom: '1px solid #333',
                fontSize: '0.9rem'
            }}>
                <span className="stat-label" style={{ color: isPdfMode ? '#000' : '#fff' }}>{label}</span>
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
            const num = getStatValue(q, numeratorId);
            const den = getStatValue(q, denominatorId);
            return den > 0 ? Math.round((num / den) * 100) : null;
        };

        const q1Val = getPctValue('q1');
        const q2Val = getPctValue('q2');
        const q3Val = getPctValue('q3');
        const q4Val = getPctValue('q4');

        const totalNum = getStatValue('q1', numeratorId) + getStatValue('q2', numeratorId) + getStatValue('q3', numeratorId) + getStatValue('q4', numeratorId);
        const totalDen = getStatValue('q1', denominatorId) + getStatValue('q2', denominatorId) + getStatValue('q3', denominatorId) + getStatValue('q4', denominatorId);
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
                <span className="stat-label" style={{ color: isPdfMode ? '#333' : '#b0b0b0', paddingLeft: '16px', fontStyle: 'italic' }}>{label}</span>
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

    // Shooting Analysis (Aggregating Buttons ONLY)
    const totalAttacks = sumStats('ballInside65');
    const totalShots = sumStats('shotTaken') + sumStats('freeWon') + sumStats('45Won') + sumStats('shot65');
    const totalScores = sumStats('score') + sumStats('scoreFree') + sumStats('score45') + sumStats('point65');
    const territorialEffectiveness = totalAttacks > 0 ? Math.round((totalShots / totalAttacks) * 100) : 0;
    const shotEfficiency = totalShots > 0 ? Math.round((totalScores / totalShots) * 100) : 0;

    // Pressure Analysis
    const totalPossessions = sumStats('oppPossessions');
    const totalPressures = sumStats('pressures');
    const totalFreesAgainst = sumStats('freesAgainst');
    const totalFreesWon = sumStats('freesWon');
    const totalTurnovers = sumStats('turnovers');
    const pressureEfficiency = totalPossessions > 0 ? Math.round((totalPressures / totalPossessions) * 100) : 0;
    const freeRate = totalPressures > 0 ? Math.round((totalFreesAgainst / totalPressures) * 100) : 0;
    const successRate = totalPressures > 0 ? Math.round((totalTurnovers / totalPressures) * 100) : 0;

    // Ruck Analysis
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
        <div id="printableStats" className={isPdfMode ? 'pdf-mode' : ''} style={{
            position: 'relative',
            width: '100%',
            overflowX: 'hidden',
            backgroundColor: isPdfMode ? 'white' : '#121212',
            minHeight: '100vh',
            paddingBottom: '80px'
        }}>
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
                            padding: 8px !important;
                        }
                        .pdf-mode .stat-row {
                            padding: 4px 0 !important;
                            font-size: 0.8rem !important;
                        }
                        .pdf-mode h2, .pdf-mode h3, .pdf-mode h4 {
                            color: black !important;
                        }
                    `}</style>

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
                Generate PDF Report
            </button>

            <div style={{ padding: '20px', paddingBottom: '80px' }}>
                {/* PDF Header - Only visible in PDF Mode */}
                {isPdfMode && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '20px' }}>
                        {matchInfo.homeCrest ? <img src={matchInfo.homeCrest} style={{ width: '80px', height: '80px', objectFit: 'contain' }} alt="Home Crest" /> : <div></div>}
                        <div style={{ textAlign: 'center' }}>
                            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#000' }}>
                                {matchInfo.homeTeam || 'HOME'} vs {matchInfo.awayTeam || 'AWAY'}
                            </h1>
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
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: isPdfMode ? '#000' : '#fff' }}>Match Dashboard</h2>
                </div>

                {/* Summary Cards */}
                <div className="summary-cards-container">
                    <SummaryCard title="Pressures (Won/Total)" type="possession" />

                    <SummaryCard title="Rucks (Won/Total)" type="rucks" />
                    <SummaryCard title="Own Puckouts (Won/Total)" type="ownPuckouts" />
                    <SummaryCard title="Opp Puckouts (Won/Total)" type="oppPuckouts" />
                    <SummaryCard title="Shot Attempts (Entries to Shots)" type="conversion" />
                    <SummaryCard title="Scoring Efficiency (Shots to Scores)" type="attack" />
                </div>

                {/* Detailed Statistics */}
                <h2 className="detailed-stats-header" style={{
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    color: isPdfMode ? '#000' : '#bb86fc',
                    marginBottom: '20px',
                    textAlign: isPdfMode ? 'center' : 'left'
                }}>Detailed Statistics</h2>

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
                    <StatRow label="Free Against" statId="freesAgainst" />
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
                    <StatRow label="Free Won Inside 65" statId="freeWon" />
                    <StatRow label="45s Won" statId="45Won" />
                    <StatRow label="Penalty Won" statId="penaltyWon" />
                    <StatRow label="Score from Free" statId="scoreFree" />
                    <StatRow label="Score from Penalty" statId="penalty" />
                    <StatRow label="Score 45" statId="score45" />
                    <StatRow label="Shot from > 65" statId="shot65" />
                    <StatRow label="Wide from > 65" statId="wide65" />
                    <StatRow label="Point from > 65" statId="point65" />
                </div>

                {(!isPdfMode || showFreesInPdf) && (
                    <div className="chart-container" style={{
                        marginBottom: '40px',
                        backgroundColor: isPdfMode ? '#f5f5f5' : '#1e1e1e',
                        padding: '30px',
                        borderRadius: '12px',
                        border: isPdfMode ? '1px solid #ccc' : '1px solid #333',
                        pageBreakInside: 'avoid',
                        pageBreakBefore: isPdfMode ? 'always' : 'auto'
                    }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '25px', color: isPdfMode ? '#000' : '#bb86fc', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Free Analysis</h3>

                        {/* Total */}
                        <div style={{ textAlign: 'center', marginBottom: '25px', paddingBottom: '20px', borderBottom: isPdfMode ? '1px solid #ddd' : '1px solid #333' }}>
                            <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase', marginBottom: '4px' }}>{matchInfo.homeTeam || 'Home'} Frees Conceded</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: isPdfMode ? '#000' : '#fff' }}>{sumStats('freeConcededHome')}</div>
                        </div>

                        {/* Zone Breakdown */}
                        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                            <h4 style={{ color: isPdfMode ? '#333' : '#b0b0b0', textAlign: 'center', fontSize: '0.85rem', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Frees by Zone</h4>
                            {['Defence', 'Middle', 'Offence'].map(loc => {
                                const count = allFrees.filter(f => f.team === 'home' && f.location === loc).length;
                                const total = sumStats('freeConcededHome');
                                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                return (
                                    <div key={loc} style={{ marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: isPdfMode ? '#333' : '#e0e0e0', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 'bold' }}>{loc}</span>
                                            <span>{count} <span style={{ color: isPdfMode ? '#666' : '#b0b0b0', fontSize: '0.8rem' }}>({pct}%)</span></span>
                                        </div>
                                        <div style={{ height: '6px', backgroundColor: isPdfMode ? '#e0e0e0' : '#333', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#cf6679', borderRadius: '3px' }} />
                                        </div>
                                    </div>
                                );
                            })}
                            {/* Untagged */}
                            {(() => {
                                const tagged = allFrees.filter(f => f.team === 'home' && ['Defence', 'Middle', 'Offence'].includes(f.location)).length;
                                const untagged = sumStats('freeConcededHome') - tagged;
                                return untagged > 0 ? (
                                    <div style={{ marginTop: '12px', fontSize: '0.8rem', color: isPdfMode ? '#888' : '#666', textAlign: 'center' }}>
                                        {untagged} free{untagged !== 1 ? 's' : ''} without a zone selected
                                    </div>
                                ) : null;
                            })()}
                        </div>
                    </div>
                )}

                {/* PDF Pitch Toggle */}
                {!isPdfMode && (
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
                        <div style={{ color: isPdfMode ? '#000' : '#fff', fontWeight: 'bold' }}>PDF Content Options:</div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', backgroundColor: isPdfMode ? '#f0f0f0' : '#1e1e1e', padding: '10px 15px', borderRadius: '8px', border: isPdfMode ? '1px solid #ccc' : '1px solid #333' }}>
                                <input
                                    type="checkbox"
                                    name="showPitches"
                                    checked={showPitchesInPdf}
                                    onChange={(e) => setShowPitchesInPdf(e.target.checked)}
                                    style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                                />
                                <span style={{ color: isPdfMode ? '#000' : '#fff', fontSize: '0.9rem' }}>Include Pitch Maps</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', backgroundColor: isPdfMode ? '#f0f0f0' : '#1e1e1e', padding: '10px 15px', borderRadius: '8px', border: isPdfMode ? '1px solid #ccc' : '1px solid #333' }}>
                                <input
                                    type="checkbox"
                                    name="showFrees"
                                    checked={showFreesInPdf}
                                    onChange={(e) => setShowFreesInPdf(e.target.checked)}
                                    style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                                />
                                <span style={{ color: isPdfMode ? '#000' : '#fff', fontSize: '0.9rem' }}>Include Free Analysis</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Pitch Score Maps - Visible based on toggle/mode */}
                {
                    (!isPdfMode || showPitchesInPdf) && (
                        <>
                            <div style={{ marginTop: '40px', pageBreakInside: 'avoid', pageBreakBefore: isPdfMode ? 'always' : 'auto' }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: isPdfMode ? '#000' : '#bb86fc', marginBottom: '20px', textAlign: 'center' }}>Pitch Maps - 1st Half</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: isPdfMode ? '1fr' : '1fr', gap: '20px' }}>
                                    <div style={{ backgroundColor: isPdfMode ? 'transparent' : '#1e1e1e', padding: '10px', borderRadius: '8px', border: isPdfMode ? 'none' : '1px solid #333' }}>
                                        <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px', color: isPdfMode ? '#000' : '#03dac6' }}>HOME: {matchInfo.homeTeam} Scores</h3>
                                        <PitchSummary data={firstHalfScores.filter(s => s.team === 'home')} type="scores" />
                                    </div>
                                    <div style={{ backgroundColor: isPdfMode ? 'transparent' : '#1e1e1e', padding: '10px', borderRadius: '8px', border: isPdfMode ? 'none' : '1px solid #333' }}>
                                        <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px', color: isPdfMode ? '#000' : '#03dac6' }}>AWAY: {matchInfo.awayTeam} Scores</h3>
                                        <PitchSummary data={firstHalfScores.filter(s => s.team === 'away')} type="scores" />
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                marginTop: '40px',
                                paddingTop: isPdfMode ? '40px' : '0',
                                pageBreakInside: 'avoid',
                                pageBreakBefore: isPdfMode ? 'always' : 'auto'
                            }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: isPdfMode ? '#000' : '#bb86fc', marginBottom: '20px', textAlign: 'center' }}>Pitch Maps - 2nd Half</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: isPdfMode ? '1fr' : '1fr', gap: '20px' }}>
                                    <div style={{ backgroundColor: isPdfMode ? 'transparent' : '#1e1e1e', padding: '10px', borderRadius: '8px', border: isPdfMode ? 'none' : '1px solid #333' }}>
                                        <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px', color: isPdfMode ? '#000' : '#03dac6' }}>HOME: {matchInfo.homeTeam} Scores</h3>
                                        <PitchSummary data={secondHalfScores.filter(s => s.team === 'home')} type="scores" />
                                    </div>
                                    <div style={{ backgroundColor: isPdfMode ? 'transparent' : '#1e1e1e', padding: '10px', borderRadius: '8px', border: isPdfMode ? 'none' : '1px solid #333' }}>
                                        <h3 style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px', color: isPdfMode ? '#000' : '#03dac6' }}>AWAY: {matchInfo.awayTeam} Scores</h3>
                                        <PitchSummary data={secondHalfScores.filter(s => s.team === 'away')} type="scores" />
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                }

                {/* Visual Analysis Section - Now visible in Dashboard Too */}
                <div style={{ marginTop: '40px', borderTop: isPdfMode ? 'none' : '2px solid #333', paddingTop: '40px', pageBreakBefore: isPdfMode ? 'always' : 'auto' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: isPdfMode ? '#000' : '#bb86fc', marginBottom: '30px', textAlign: 'center' }}>Visual Match Analysis</h2>

                    {/* Pressure Analysis Hero Section */}
                    <div className="chart-container" style={{
                        marginBottom: '40px',
                        backgroundColor: isPdfMode ? '#f5f5f5' : '#1e1e1e',
                        padding: '30px',
                        borderRadius: '12px',
                        border: isPdfMode ? '1px solid #ccc' : '1px solid #333',
                        pageBreakInside: 'avoid'
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center', // Centered
                            alignItems: 'center',
                            marginBottom: '20px',
                            borderBottom: isPdfMode ? '2px solid #ddd' : '2px solid #444',
                            paddingBottom: '10px'
                        }}>
                            <h3 style={{
                                fontSize: '1.5rem',  // Main section header size
                                fontWeight: 'bold',
                                color: isPdfMode ? '#000' : '#bb86fc',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                margin: 0,
                                textAlign: 'center'
                            }}>
                                Pressure & Work Rate
                            </h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                            {/* Hero Metric: Work Rate % */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.9rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '5px' }}>Team Work Rate</div>
                                <div style={{ fontSize: '10.5rem', fontWeight: 'bold', color: getPctColor(pressureEfficiency), lineHeight: '1.1' }}>
                                    {pressureEfficiency}%
                                </div>
                                <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#888' : '#666', marginTop: '5px' }}>Pressures to Possessions</div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', width: '100%', maxWidth: '600px', borderTop: isPdfMode ? '1px solid #ccc' : '1px solid #333', borderBottom: isPdfMode ? '1px solid #ccc' : '1px solid #333', padding: '15px 0' }}>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Possessions</div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: isPdfMode ? '#000' : '#fff' }}>{totalPossessions}</div>
                                </div>
                                <div style={{ borderLeft: isPdfMode ? '1px solid #ccc' : '1px solid #333' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Pressures</div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#4caf50' }}>{totalPressures}</div>
                                </div>
                            </div>

                            {/* Secondary Metrics (KPIs) -> Scaled to 1.8rem */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', width: '100%', borderBottom: isPdfMode ? '1px solid #ccc' : '1px solid #333', padding: '15px 0' }}>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Turnovers</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4caf50' }}>{totalTurnovers}</div>
                                </div>
                                <div style={{ borderLeft: isPdfMode ? '1px solid #ccc' : '1px solid #333' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Success %</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: isPdfMode ? '#000' : '#fff' }}>{successRate}%</div>
                                </div>
                                <div style={{ borderLeft: isPdfMode ? '1px solid #ccc' : '1px solid #333' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Free Rate %</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#cf6679' }}>{freeRate}%</div>
                                </div>
                                <div style={{ borderLeft: isPdfMode ? '1px solid #ccc' : '1px solid #333' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Free Against</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ff9800' }}>{totalFreesAgainst}</div>
                                </div>
                            </div>

                            {/* Compact Chart */}
                            <div style={{ width: '100%', maxWidth: '500px', height: '250px', marginTop: '10px' }}>
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <BarChart data={pressureBarData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isPdfMode ? '#ddd' : '#333'} vertical={false} />
                                        <XAxis dataKey="name" stroke={isPdfMode ? '#333' : '#b0b0b0'} fontSize={10} axisLine={false} tickLine={false} />
                                        <YAxis stroke={isPdfMode ? '#333' : '#b0b0b0'} fontSize={10} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: isPdfMode ? '#fff' : '#1e1e1e', border: '1px solid #333', color: isPdfMode ? '#000' : '#fff' }}
                                            itemStyle={{ fontSize: '12px' }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                        <Bar dataKey="Possessions" fill="#bb86fc" isAnimationActive={false} radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Pressures" fill="#4caf50" isAnimationActive={false} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* KPI Guide */}
                            <div style={{
                                marginTop: '30px',
                                padding: '20px',
                                backgroundColor: isPdfMode ? '#f9f9f9' : '#252525',
                                borderRadius: '10px',
                                border: isPdfMode ? '1px solid #ddd' : '1px solid #333',
                                fontSize: '0.85rem',
                                color: isPdfMode ? '#333' : '#e0e0e0',
                                lineHeight: '1.6',
                                pageBreakInside: 'avoid',
                                width: '100%',
                                maxWidth: '100%',
                                textAlign: 'center'
                            }}>
                                <h4 style={{ color: isPdfMode ? '#000' : '#03dac6', marginBottom: '10px', borderBottom: isPdfMode ? '1px solid #ccc' : '1px solid #444', paddingBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>KPI: Pressure Efficiency</h4>
                                <p style={{ margin: '0 0 10px 0' }}><strong>What it measures:</strong> The percentage of opposition possessions met with an active "Pressure" (tackle, hook, block, contact or close contact forcing them to make a decision under pressure).</p>

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

                                <div style={{ marginTop: '15px', backgroundColor: isPdfMode ? '#fff' : '#1e1e1e', padding: '12px', borderRadius: '6px', border: isPdfMode ? '1px solid #eee' : '1px solid #333' }}>
                                    <strong>How to read it:</strong>
                                    <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '5px 0' }}>
                                        <li><strong>High Efficiency (&gt;60%):</strong> Suffocating the opposition, forcing panic passes and high turnover rates.</li>
                                        <li><strong>Low Efficiency (&lt;45%):</strong> Opposition has "easy ball" and plays without fear of being tackled.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shot Analysis Hero Section */}
                    {isPdfMode && <div style={{ pageBreakBefore: 'always', height: '1px' }}></div>}
                    <div className="chart-container" style={{
                        marginBottom: '40px',
                        backgroundColor: isPdfMode ? '#f5f5f5' : '#1e1e1e',
                        padding: '30px',
                        paddingTop: isPdfMode ? '80px' : '30px',
                        borderRadius: '12px',
                        border: isPdfMode ? '1px solid #ccc' : '1px solid #333',
                        pageBreakInside: 'avoid',
                        pageBreakBefore: isPdfMode ? 'always' : 'auto'
                    }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '25px', color: isPdfMode ? '#000' : '#bb86fc', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Shot Analysis</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                            {/* Hero Metric: Shot Attempts */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.9rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase', fontWeight: 'bold' }}>SHOOTING %</div>
                                <div style={{ fontSize: '11.25rem', fontWeight: 'bold', color: getPctColor(territorialEffectiveness), lineHeight: '1.1' }}>
                                    {territorialEffectiveness}%
                                </div>
                                <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#888' : '#666', marginTop: '5px' }}>Shots Taken (Including frees, 45, 65) (Entries {totalAttacks} / Shots {totalShots})</div>

                                {/* Sub-Hero Row: Efficiency & Frees Won -> Scaled to 3.5rem */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '15px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Scoring Efficiency</div>
                                        <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: getPctColor(shotEfficiency) }}>{shotEfficiency}%</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Attacking Free Won</div>
                                        <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: isPdfMode ? '#000' : '#fff' }}>{sumStats('freeWon')}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Metrics -> Scaled to 1.8rem -> Increase to 2.7rem (1.5x) for Shot Attempts */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', width: '100%', borderTop: isPdfMode ? '1px solid #ddd' : '1px solid #333', borderBottom: isPdfMode ? '1px solid #ddd' : '1px solid #333', padding: '15px 0' }}>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Played Inside 65</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: isPdfMode ? '#000' : '#fff' }}>{totalAttacks}</div>
                                </div>
                                <div style={{ borderLeft: isPdfMode ? '1px solid #ddd' : '1px solid #333' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Shots Attempted</div>
                                    <div style={{ fontSize: '2.7rem', fontWeight: 'bold', color: isPdfMode ? '#000' : '#fff' }}>{totalShots}</div>
                                </div>
                                <div style={{ borderLeft: isPdfMode ? '1px solid #ddd' : '1px solid #333' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Scores from Play</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4caf50' }}>{sumStats('score')}</div>
                                </div>
                                <div style={{ borderLeft: isPdfMode ? '1px solid #ddd' : '1px solid #333' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Scores From Free</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4caf50' }}>{sumStats('scoreFree')}</div>
                                </div>
                                <div style={{ borderLeft: isPdfMode ? '1px solid #ddd' : '1px solid #333' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Score from 45/65</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4caf50' }}>{sumStats('score45') + sumStats('point65')}</div>
                                </div>
                            </div>

                            {/* Chart at the bottom */}
                            <div style={{ width: '100%', maxWidth: '500px', height: '300px', display: 'flex', justifyContent: 'center' }}>
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <PieChart>
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
                                        <Tooltip contentStyle={{ backgroundColor: isPdfMode ? '#fff' : '#1e1e1e', border: '1px solid #333', color: isPdfMode ? '#000' : '#fff' }} />
                                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* KPI Guide */}
                            <div style={{
                                marginTop: '10px',
                                padding: '20px',
                                backgroundColor: isPdfMode ? '#f9f9f9' : '#252525',
                                borderRadius: '10px',
                                border: isPdfMode ? '1px solid #ddd' : '1px solid #333',
                                fontSize: '0.85rem',
                                color: isPdfMode ? '#333' : '#e0e0e0',
                                lineHeight: '1.6',
                                pageBreakInside: 'avoid',
                                width: '100%',
                                maxWidth: '100%',
                                textAlign: 'center'
                            }}>
                                <h4 style={{ color: isPdfMode ? '#000' : '#bb86fc', marginBottom: '10px', borderBottom: isPdfMode ? '1px solid #ccc' : '1px solid #444', paddingBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>KPI: Shot Analysis (Territorial Effectiveness & Efficiency)</h4>
                                <p style={{ margin: '0 0 10px 0' }}><strong>What it measures:</strong> The conversion rate from ball possessions inside the 65m line to actual shots taken, and the subsequent success rate of those shots.</p>

                                <div style={{ marginTop: '15px' }}>
                                    <strong>Why it matters:</strong>
                                    <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '5px 0' }}>
                                        <li><strong>Efficiency of Entry:</strong> Highlights whether we are creating scoring opportunities when we get the ball into attacking zones. Take your shot when we get the ball into the opposition 65</li>
                                    </ul>
                                </div>

                                <div style={{ marginTop: '15px', backgroundColor: isPdfMode ? '#fff' : '#1e1e1e', padding: '12px', borderRadius: '6px', border: isPdfMode ? '1px solid #eee' : '1px solid #333' }}>
                                    <strong>How to read it:</strong>
                                    <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '5px 0' }}>
                                        <li><strong>High Efficiency (&gt;60% entries to shots):</strong> Clinical attacking play and forwards finding space effectively.</li>
                                        <li><strong>Low Efficiency (&lt;45% entries to shots):</strong> Over-complicating play or strong opposition defensive pressure.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ruck Analysis */}
                    <div className="chart-container" style={{
                        marginTop: '20px',
                        marginBottom: '40px',
                        backgroundColor: isPdfMode ? '#f5f5f5' : '#1e1e1e',
                        padding: '30px',
                        borderRadius: '12px',
                        border: isPdfMode ? '1px solid #ccc' : '1px solid #333',
                        pageBreakInside: 'avoid',
                        pageBreakBefore: isPdfMode ? 'always' : 'auto'
                    }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '25px', color: isPdfMode ? '#000' : '#bb86fc', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Ruck Analysis</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                            {/* Hero Metric: Overall Ruck Win Rate */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.9rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '5px' }}>Total Ruck Efficiency</div>
                                <div style={{ fontSize: '10.5rem', fontWeight: 'bold', color: getPctColor(ruckEfficiency), lineHeight: '1.1' }}>
                                    {ruckEfficiency}%
                                </div>
                                <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#888' : '#666', marginTop: '5px' }}>Possession Won from Rucks</div>
                            </div>

                            {/* Row 1: Basic Stats */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', width: '100%', borderTop: isPdfMode ? '1px solid #ddd' : '1px solid #333', borderBottom: isPdfMode ? '1px solid #ddd' : '1px solid #333', padding: '20px 0' }}>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Total Rucks</div>
                                    <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: isPdfMode ? '#000' : '#fff' }}>{totalRucks}</div>
                                </div>
                                <div style={{ borderLeft: isPdfMode ? '1px solid #ddd' : '1px solid #333' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Rucks Won</div>
                                    <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#4caf50' }}>{rucksWon}</div>
                                </div>
                                <div style={{ borderLeft: isPdfMode ? '1px solid #ddd' : '1px solid #333' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Rucks Lost</div>
                                    <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#cf6679' }}>{Math.max(0, totalRucks - rucksWon)}</div>
                                </div>
                            </div>

                            {/* Row 2: Zone Efficiency */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', width: '100%', paddingBottom: '20px', borderBottom: isPdfMode ? '1px solid #ddd' : '1px solid #333' }}>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Defensive %</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: getPctColor(defRuckPct) }}>{defRuckPct}%</div>
                                </div>
                                <div style={{ borderLeft: isPdfMode ? '1px solid #ddd' : '1px solid #333' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Midfield %</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: getPctColor(midRuckPct) }}>{midRuckPct}%</div>
                                </div>
                                <div style={{ borderLeft: isPdfMode ? '1px solid #ddd' : '1px solid #333' }}></div>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Forwards %</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: getPctColor(offRuckPct) }}>{offRuckPct}%</div>
                                </div>
                            </div>

                            <div style={{ height: '250px', width: '100%', maxWidth: '500px', display: 'flex', justifyContent: 'center' }}>
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <BarChart data={ruckBarData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isPdfMode ? '#ddd' : '#333'} vertical={false} />
                                        <XAxis dataKey="name" stroke={isPdfMode ? '#333' : '#b0b0b0'} fontSize={12} />
                                        <YAxis stroke={isPdfMode ? '#333' : '#b0b0b0'} fontSize={12} />
                                        <Tooltip contentStyle={{ backgroundColor: isPdfMode ? '#fff' : '#1e1e1e', border: '1px solid #333' }} />
                                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                        <Bar dataKey="Total" fill="#bb86fc" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Won" fill="#00c853" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* KPI Guide */}
                            <div style={{
                                marginTop: '10px',
                                padding: '20px',
                                backgroundColor: isPdfMode ? '#f9f9f9' : '#252525',
                                borderRadius: '10px',
                                border: isPdfMode ? '1px solid #ddd' : '1px solid #333',
                                fontSize: '0.85rem',
                                color: isPdfMode ? '#333' : '#e0e0e0',
                                lineHeight: '1.6',
                                pageBreakInside: 'avoid',
                                width: '100%',
                                maxWidth: '100%',
                                textAlign: 'center'
                            }}>
                                <h4 style={{ color: isPdfMode ? '#000' : '#bb86fc', marginBottom: '10px', borderBottom: isPdfMode ? '1px solid #ccc' : '1px solid #444', paddingBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>KPI: Ruck Efficiency</h4>
                                <p style={{ margin: '0 0 10px 0' }}><strong>What it measures:</strong> The percentage of contested "ruck" situations (loose ball contests) where our team emerged with possession.</p>

                                <div style={{ marginTop: '15px' }}>
                                    <strong>Why it matters:</strong>
                                    <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '5px 0' }}>
                                        <li><strong>Possession Control & Physical Dominance:</strong> It is a double-edged sword. Dominating rucks ensures we deprive opposition possession, giving us valuable ball to distribute to our inside line.</li>
                                        <li><strong>Consequences of Loss:</strong> Losing Rucks battle we burn energy winning ball back, gives oppositions a platform to attack us and denies us possession to feed our forwards.</li>
                                    </ul>
                                </div>

                                <div style={{ marginTop: '15px', backgroundColor: isPdfMode ? '#fff' : '#1e1e1e', padding: '12px', borderRadius: '6px', border: isPdfMode ? '1px solid #eee' : '1px solid #333' }}>
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
                        marginBottom: '40px',
                        backgroundColor: isPdfMode ? '#f5f5f5' : '#1e1e1e',
                        padding: '30px',
                        borderRadius: '12px',
                        border: isPdfMode ? '1px solid #ccc' : '1px solid #333',
                        pageBreakInside: 'avoid',
                        pageBreakBefore: isPdfMode ? 'always' : 'auto'
                    }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '25px', color: isPdfMode ? '#000' : '#bb86fc', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Puckout Analysis</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                            {/* Hero Metrics: % Won */}
                            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '40px', width: '100%', maxWidth: '800px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.9rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '5px' }}>Own Puckouts Won</div>
                                    <div style={{ fontSize: '10.5rem', fontWeight: 'bold', color: getPctColor(ownPuckoutWonPct), lineHeight: '1.1' }}>
                                        {ownPuckoutWonPct}%
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#888' : '#666', marginTop: '5px', marginBottom: '15px' }}>Possession Retained</div>

                                    {/* Grouped Metrics */}
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                        <KPICard title="Own Won" value={sumStats('ownPuckoutWon')} color="#4caf50" bgColor={isPdfMode ? '#fff' : '#121212'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                                        <KPICard title="Own Lost" value={Math.max(0, sumStats('ownPuckout') - sumStats('ownPuckoutWon'))} color="#cf6679" bgColor={isPdfMode ? '#fff' : '#121212'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.9rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '5px' }}>Opposition Puckouts Won</div>
                                    <div style={{ fontSize: '10.5rem', fontWeight: 'bold', color: getPctColor(oppPuckoutWonPct), lineHeight: '1.1' }}>
                                        {oppPuckoutWonPct}%
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#888' : '#666', marginTop: '5px', marginBottom: '15px' }}>Possession Won</div>

                                    {/* Grouped Metrics */}
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                        <KPICard title="Opp Won" value={sumStats('oppPuckoutWon')} color="#03dac6" bgColor={isPdfMode ? '#fff' : '#121212'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                                        <KPICard title="Opp Lost" value={Math.max(0, sumStats('oppPuckout') - sumStats('oppPuckoutWon'))} color="#bb86fc" bgColor={isPdfMode ? '#fff' : '#121212'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '30px', width: '100%' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <h4 style={{ color: isPdfMode ? '#666' : '#b0b0b0', marginBottom: '10px', fontSize: '0.9rem' }}>Own Puckouts</h4>
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
                                        <Tooltip contentStyle={{ backgroundColor: isPdfMode ? '#fff' : '#1e1e1e', border: '1px solid #333' }} />
                                    </PieChart>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <h4 style={{ color: isPdfMode ? '#666' : '#b0b0b0', marginBottom: '10px', fontSize: '0.9rem' }}>Opposition Puckouts</h4>
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
                                        <Tooltip contentStyle={{ backgroundColor: isPdfMode ? '#fff' : '#1e1e1e', border: '1px solid #333' }} />
                                    </PieChart>
                                </div>
                            </div>
                        </div>

                        {/* KPI Guide */}
                        <div style={{
                            marginTop: '10px',
                            padding: '20px',
                            backgroundColor: isPdfMode ? '#f9f9f9' : '#252525',
                            borderRadius: '10px',
                            border: isPdfMode ? '1px solid #ddd' : '1px solid #333',
                            fontSize: '0.85rem',
                            color: isPdfMode ? '#333' : '#e0e0e0',
                            lineHeight: '1.6',
                            pageBreakInside: 'avoid',
                            width: '100%',
                            maxWidth: '100%',
                            textAlign: 'center'
                        }}>
                            <h4 style={{ color: isPdfMode ? '#000' : '#bb86fc', marginBottom: '10px', borderBottom: isPdfMode ? '1px solid #ccc' : '1px solid #444', paddingBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>KPI: Puckout Analysis (Retention & Dominance)</h4>
                            <p style={{ margin: '0 0 10px 0' }}><strong>What it measures:</strong> Our ability to retain our own restart and win the opposition's restart, creating immediate attacking platforms.</p>

                            <div style={{ marginTop: '15px' }}>
                                <strong>Why it matters:</strong>
                                <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '5px 0' }}>
                                    <li><strong>Attacking Platform:</strong> Winning your own puckout provides a direct route to the opposition's half.</li>
                                    <li><strong>Disrupting Opposition:</strong> Dominating the opposition's puckout denies them a clean exit.</li>
                                </ul>
                            </div>

                            <div style={{ marginTop: '15px', backgroundColor: isPdfMode ? '#fff' : '#1e1e1e', padding: '12px', borderRadius: '6px', border: isPdfMode ? '1px solid #eee' : '1px solid #333' }}>
                                <strong>How to read it:</strong>
                                <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '5px 0' }}>
                                    <li><strong>High Retention (&gt;70% Own):</strong> Strong structural setup and aerial dominance.</li>
                                    <li><strong>Low Retention (&lt;50% Own):</strong> Struggle to find space, forcing the defense into more frequent long-range contests.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

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
                            padding: 8px !important;
                        }
                        .pdf-mode .stat-row {
                            padding: 4px 0 !important;
                            font-size: 0.8rem !important;
                        }
                        .pdf-mode h2, .pdf-mode h3, .pdf-mode h4 {
                            color: black !important;
                        }
                    `}</style>



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
                    {isPdfMode ? 'Generating PDF...' : 'Download Match PDF'}
                </button>
            </div>
        </div>
    );
};

export default DashboardView;
