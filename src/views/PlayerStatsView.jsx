import React from 'react';
import { useMatch } from '../context/MatchContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import html2pdf from 'html2pdf.js';
import PitchSummary from '../components/PitchSummary';

const PlayerStatsView = () => {
    const { stats, matchInfo, pitchStats } = useMatch();

    const getStatValue = (q, statId) => {
        const val = stats[q]?.[statId] || 0;
        return typeof val === 'object' ? (val.home || 0) : val;
    };

    const sumStats = (statId) => {
        return ['q1', 'q2', 'q3', 'q4'].reduce((total, q) => {
            return total + getStatValue(q, statId);
        }, 0);
    };

    const getPctColor = (val) => {
        if (val === null) return 'inherit';
        if (val <= 45) return '#cf6679'; // Red
        if (val < 60) return '#ff9800'; // Amber
        return '#4caf50'; // Green
    };

    // Filter Pitch Stats by Half
    const firstHalfScores = (pitchStats?.scores || []).filter(s => s && ['Q1', 'Q2'].includes(s.quarter));
    const secondHalfScores = (pitchStats?.scores || []).filter(s => s && ['Q3', 'Q4', 'FT'].includes(s.quarter));
    const firstHalfPuckouts = (pitchStats?.puckouts || []).filter(p => p && ['Q1', 'Q2'].includes(p.quarter));
    const secondHalfPuckouts = (pitchStats?.puckouts || []).filter(p => p && ['Q3', 'Q4', 'FT'].includes(p.quarter));

    const getPitchTotal = (category) => {
        const allScores = (pitchStats?.scores || []);
        switch (category) {
            case 'scores':
                return allScores.filter(s => s && ['point', 'goal', 'free', '45', 'penalty'].includes(s.type)).length;
            case 'totalShots':
                return allScores.filter(s => s && ['point', 'goal', 'free', '45', 'penalty', 'wide'].includes(s.type)).length;
            case 'wide':
                return allScores.filter(s => s && s.type === 'wide').length;
            default:
                return 0;
        }
    };

    // Data for Charts
    const shotData = [
        { name: 'Scores', value: sumStats('score') + sumStats('scoreFree') + sumStats('score45') + sumStats('point65'), color: '#4caf50' },
        { name: 'Wides', value: sumStats('wide') + sumStats('wide65'), color: '#cf6679' },
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

    const ownPuckoutData = [
        { name: 'Won', value: sumStats('ownPuckoutWon'), color: '#4caf50' },
        { name: 'Lost', value: Math.max(0, sumStats('ownPuckout') - sumStats('ownPuckoutWon')), color: '#cf6679' },
    ].filter(d => d.value > 0);

    const oppPuckoutData = [
        { name: 'Won', value: sumStats('oppPuckoutWon'), color: '#03dac6' },
        { name: 'Lost', value: Math.max(0, sumStats('oppPuckout') - sumStats('oppPuckoutWon')), color: '#bb86fc' },
    ].filter(d => d.value > 0);

    // --- New Stats Calculations ---

    // Shooting Analysis
    const totalAttacks = sumStats('ballInside65');
    const totalShots = sumStats('shotTaken') + sumStats('freeWon') + sumStats('45Won') + sumStats('shot65');
    const totalScores = sumStats('score') + sumStats('scoreFree') + sumStats('score45') + sumStats('point65');
    const totalFreesWon = sumStats('freeWon');
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

    const [isPdfMode, setIsPdfMode] = React.useState(false);

    const generatePDF = () => {
        setIsPdfMode(true);

        // Wait for state update and render
        setTimeout(() => {
            const element = document.getElementById('printablePlayerStats');
            if (!element) {
                console.error('PDF element not found');
                setIsPdfMode(false);
                return;
            }

            const filename = `Player_Analysis_${matchInfo.homeTeam || 'Home'}_vs_${matchInfo.awayTeam || 'Away'}.pdf`;

            const opt = {
                margin: 10,
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).outputPdf('blob')
                .then((blob) => {
                    // Create a download link
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);

                    console.log('PDF generated successfully');
                    setIsPdfMode(false);
                })
                .catch((error) => {
                    console.error('PDF generation error:', error);
                    setIsPdfMode(false);
                    alert('Error generating PDF. Please check the console for details.');
                });
        }, 500); // 500ms delay to allow styles to apply
    };

    const KPICard = ({ title, value, sub, color = '#fff', bgColor = '#1e1e1e', titleColor = '#b0b0b0', valueSize = '1.2rem' }) => (
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
            <div className="kpi-value" style={{ fontSize: valueSize, fontWeight: 'bold', color: color }}>{value}</div>
            {sub && <div style={{ fontSize: '0.75rem', color: '#666' }}>{sub}</div>}
        </div>
    );

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

    return (
        <div style={{ padding: '16px', paddingBottom: '80px' }}>
            <div id="printablePlayerStats" className={isPdfMode ? 'player-pdf-mode' : ''}>

                {/* PDF Header - Only visible in PDF Mode */}
                {isPdfMode && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '20px' }}>
                        {matchInfo.homeCrest ? <img src={matchInfo.homeCrest} style={{ width: '80px', height: '80px', objectFit: 'contain' }} alt="Home Crest" /> : <div></div>}
                        <div style={{ textAlign: 'center' }}>
                            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0', color: '#000' }}>{matchInfo.homeTeam || 'HOME'} vs {matchInfo.awayTeam || 'AWAY'}</h1>
                            <p style={{ color: '#666', margin: '5px 0' }}>{[
                                (() => {
                                    if (!matchInfo.date) return '';
                                    const d = new Date(matchInfo.date);
                                    const day = d.getDate();
                                    const ordinal = (day > 3 && day < 21) ? 'th' : ['th', 'st', 'nd', 'rd'][day % 10] || 'th';
                                    const month = d.toLocaleString('en-GB', { month: 'short' });
                                    const year = d.getFullYear();
                                    return `${day}${ordinal} ${month} ${year}`;
                                })(),
                                matchInfo.competition,
                                matchInfo.venue
                            ].filter(Boolean).join(' • ')}</p>
                        </div>
                        {matchInfo.awayCrest ? <img src={matchInfo.awayCrest} style={{ width: '80px', height: '80px', objectFit: 'contain' }} alt="Away Crest" /> : <div></div>}
                    </div>
                )}


                {!isPdfMode && (
                    <h2 style={{
                        fontSize: '1.8rem',
                        marginBottom: '16px',
                        color: isPdfMode ? '#000' : '#bb86fc',
                        textAlign: isPdfMode ? 'center' : 'left'
                    }}>Visual Analysis</h2>
                )}

                {/* Shot Analysis */}
                <div className="chart-container" style={{
                    marginBottom: '40px',
                    backgroundColor: isPdfMode ? '#f5f5f5' : '#1e1e1e',
                    padding: isPdfMode ? '15px' : '30px',
                    borderRadius: '12px',
                    border: isPdfMode ? '1px solid #ccc' : '1px solid #333',
                    pageBreakInside: 'avoid'
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
                        </div>

                        {/* Sub-Hero Row: Efficiency & Frees Won -> Scaled to 3.5rem */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '15px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Scoring Efficiency</div>
                                <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: getPctColor(shotEfficiency) }}>{shotEfficiency}%</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Attacking Free Won</div>
                                <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: isPdfMode ? '#000' : '#fff' }}>{totalFreesWon}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', width: '100%', borderTop: isPdfMode ? '1px solid #ddd' : '1px solid #333', borderBottom: isPdfMode ? '1px solid #ddd' : '1px solid #333', padding: '15px 0' }}>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Shots Attempted</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: isPdfMode ? '#000' : '#fff' }}>{totalShots}</div>
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

                        {/* Pie Chart at the bottom */}
                        <div style={{ height: isPdfMode ? '220px' : '300px', width: '100%', maxWidth: '500px', display: 'flex', justifyContent: 'center' }}>
                            {isPdfMode ? (
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                    <PieChart width={480} height={isPdfMode ? 220 : 300}>
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
                                        <Legend layout="horizontal" verticalAlign="bottom" iconSize={10} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                    </PieChart>
                                </div>
                            ) : (
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
                                        <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }} />
                                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
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

                {/* Pressure Analysis */}
                <div className="chart-container" style={{
                    marginBottom: '40px',
                    backgroundColor: isPdfMode ? '#f5f5f5' : '#1e1e1e',
                    padding: '30px',
                    borderRadius: '12px',
                    border: isPdfMode ? '1px solid #ccc' : '1px solid #333',
                    pageBreakInside: 'avoid',
                    pageBreakBefore: isPdfMode ? 'always' : 'auto',
                    marginTop: isPdfMode ? '40px' : '0'
                }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '25px', color: isPdfMode ? '#000' : '#bb86fc', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Pressure & Work Rate</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                        {/* Hero Metric: Efficiency */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase', fontWeight: 'bold' }}>Team Work Rate</div>
                            <div style={{ fontSize: '10.5rem', fontWeight: 'bold', color: getPctColor(pressureEfficiency), lineHeight: '1.1' }}>
                                {pressureEfficiency}%
                            </div>
                        </div>

                        {/* Possessions / Pressures (now above KPIs) -> Scaled to 3.5rem */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', width: '100%', maxWidth: '600px', borderTop: isPdfMode ? '1px solid #ddd' : '1px solid #333', borderBottom: isPdfMode ? '1px solid #ddd' : '1px solid #333', padding: '15px 0' }}>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Possessions</div>
                                <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: isPdfMode ? '#000' : '#fff' }}>{totalPossessions}</div>
                            </div>
                            <div style={{ borderLeft: isPdfMode ? '1px solid #ddd' : '1px solid #333' }}></div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Pressures</div>
                                <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#4caf50' }}>{totalPressures}</div>
                            </div>
                        </div>

                        {/* Secondary Metrics (KPIs) -> Scaled to 1.8rem */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', width: '100%', borderBottom: isPdfMode ? '1px solid #ddd' : '1px solid #333', padding: '15px 0' }}>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Turnovers</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4caf50' }}>{totalTurnovers}</div>
                            </div>
                            <div style={{ borderLeft: isPdfMode ? '1px solid #ddd' : '1px solid #333' }}></div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Success %</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: isPdfMode ? '#000' : '#fff' }}>{successRate}%</div>
                            </div>
                            <div style={{ borderLeft: isPdfMode ? '1px solid #ddd' : '1px solid #333' }}></div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Free Rate %</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#cf6679' }}>{freeRate}%</div>
                            </div>
                            <div style={{ borderLeft: isPdfMode ? '1px solid #ddd' : '1px solid #333' }}></div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Free Against</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ff9800' }}>{totalFreesAgainst}</div>
                            </div>
                        </div>

                        {/* Chart in Middle */}
                        <div style={{ height: '250px', width: '100%', maxWidth: '500px', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                            {isPdfMode ? (
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                    <BarChart width={450} height={250} data={pressureBarData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isPdfMode ? '#ddd' : '#333'} vertical={false} />
                                        <XAxis dataKey="name" stroke={isPdfMode ? '#333' : '#b0b0b0'} fontSize={10} axisLine={false} tickLine={false} />
                                        <YAxis stroke={isPdfMode ? '#333' : '#b0b0b0'} fontSize={10} axisLine={false} tickLine={false} />
                                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                        <Bar dataKey="Possessions" fill="#bb86fc" isAnimationActive={false} radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Pressures" fill="#4caf50" isAnimationActive={false} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <BarChart data={pressureBarData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis dataKey="name" stroke="#b0b0b0" fontSize={10} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#b0b0b0" fontSize={10} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }} />
                                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                                        <Bar dataKey="Possessions" fill="#bb86fc" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Pressures" fill="#4caf50" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Small Sub Metrics at Bottom - Removed and moved above chart */}

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


                <div className="chart-container" style={{
                    marginBottom: '40px',
                    backgroundColor: isPdfMode ? '#f5f5f5' : '#1e1e1e',
                    padding: '30px',
                    borderRadius: '12px',
                    border: isPdfMode ? '1px solid #ccc' : '1px solid #333',
                    pageBreakBefore: isPdfMode ? 'always' : 'auto',
                    marginTop: isPdfMode ? '40px' : '0'
                }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '25px', color: isPdfMode ? '#000' : '#bb86fc', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Ruck Analysis</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                        {/* Hero Metric: Efficiency */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Ruck Efficiency</div>
                            <div style={{ fontSize: '10.5rem', fontWeight: 'bold', color: getPctColor(ruckEfficiency), lineHeight: '1.1' }}>
                                {ruckEfficiency}%
                            </div>
                            <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#888' : '#666', marginTop: '5px' }}>Possession Won from Rucks</div>
                        </div>

                        {/* Row 1: Basic Stats */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', width: '100%', borderTop: isPdfMode ? '1px solid #ddd' : '1px solid #333', borderBottom: isPdfMode ? '1px solid #ddd' : '1px solid #333', padding: '20px 0' }}>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Total Rucks</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: isPdfMode ? '#000' : '#fff' }}>{totalRucks}</div>
                            </div>
                            <div style={{ borderLeft: isPdfMode ? '1px solid #ddd' : '1px solid #333' }}></div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Rucks Won</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4caf50' }}>{rucksWon}</div>
                            </div>
                            <div style={{ borderLeft: isPdfMode ? '1px solid #ddd' : '1px solid #333' }}></div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '0.8rem', color: isPdfMode ? '#666' : '#b0b0b0', textTransform: 'uppercase' }}>Rucks Lost</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#cf6679' }}>{Math.max(0, totalRucks - rucksWon)}</div>
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

                        <div style={{ height: '250px', width: '100%', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
                            {isPdfMode ? (
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                    <BarChart width={500} height={250} data={ruckBarData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                        <XAxis dataKey="name" stroke="#333" />
                                        <YAxis stroke="#333" />
                                        <Legend wrapperStyle={{ color: '#333' }} />
                                        <Bar dataKey="Total" fill="#bb86fc" isAnimationActive={false} label={{ position: 'top', fill: '#333', fontSize: 12 }} />
                                        <Bar dataKey="Won" fill="#00c853" isAnimationActive={false} label={{ position: 'top', fill: '#333', fontSize: 12 }} />
                                    </BarChart>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <BarChart data={ruckBarData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                        <XAxis dataKey="name" stroke="#fff" />
                                        <YAxis stroke="#fff" />
                                        <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                                        <Legend />
                                        <Bar dataKey="Total" fill="#bb86fc" />
                                        <Bar dataKey="Won" fill="#00c853" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
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

                <div className="chart-container" style={{
                    marginBottom: '40px',
                    backgroundColor: isPdfMode ? '#f5f5f5' : '#1e1e1e',
                    padding: '30px',
                    borderRadius: '12px',
                    border: isPdfMode ? '1px solid #ccc' : '1px solid #333',
                    pageBreakBefore: isPdfMode ? 'always' : 'auto',
                    marginTop: isPdfMode ? '40px' : '0'
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
                            {/* Own Puckouts */}
                            <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <h4 style={{ color: isPdfMode ? '#666' : '#b0b0b0', marginBottom: '10px', textAlign: 'center' }}>Own Puckouts</h4>
                                <div style={{ height: '250px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {isPdfMode ? (
                                        <PieChart width={280} height={250}>
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
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
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
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Opposition Puckouts */}
                            <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <h4 style={{ color: isPdfMode ? '#666' : '#b0b0b0', marginBottom: '10px', textAlign: 'center' }}>Opposition Puckouts</h4>
                                <div style={{ height: '250px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {isPdfMode ? (
                                        <PieChart width={280} height={250}>
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
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
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
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
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
                {isPdfMode ? 'Generating PDF...' : 'Download Analysis PDF'}
            </button>
        </div >
    );
};

export default PlayerStatsView;
