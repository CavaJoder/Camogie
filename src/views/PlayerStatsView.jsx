import React from 'react';
import { useMatch } from '../context/MatchContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import html2pdf from 'html2pdf.js';

const PlayerStatsView = () => {
    const { stats, matchInfo } = useMatch();

    const sumStats = (statId) => {
        return ['q1', 'q2', 'q3', 'q4'].reduce((total, q) => {
            return total + (stats[q]?.[statId] || 0);
        }, 0);
    };

    // Data for Charts
    const shotData = [
        { name: 'Scores', value: sumStats('score'), color: '#4caf50' },
        { name: 'Wides', value: sumStats('wide'), color: '#cf6679' },
        { name: 'Short', value: sumStats('short'), color: '#ff9800' },
        { name: 'Saved', value: sumStats('saved'), color: '#ff9800' },
    ].filter(d => d.value > 0);

    // Pressure Bar Chart Data (Quarterly)
    const pressureBarData = ['q1', 'q2', 'q3', 'q4'].map(q => ({
        name: q.toUpperCase(),
        Possessions: stats[q]?.oppPossessions || 0,
        Pressures: stats[q]?.pressures || 0
    }));

    // Ruck Bar Chart Data (Quarterly)
    const ruckBarData = ['q1', 'q2', 'q3', 'q4'].map(q => {
        const total = (stats[q]?.defRuck || 0) + (stats[q]?.midRuck || 0) + (stats[q]?.offRuck || 0);
        const won = (stats[q]?.defRuckWon || 0) + (stats[q]?.midRuckWon || 0) + (stats[q]?.offRuckWon || 0);
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

    const [isPdfMode, setIsPdfMode] = React.useState(false);

    const generatePDF = () => {
        setIsPdfMode(true);

        // Wait for state update and render
        setTimeout(() => {
            const element = document.getElementById('printablePlayerStats');
            const opt = {
                margin: 10,
                filename: `Player_Analysis_${matchInfo.homeTeam}_vs_${matchInfo.awayTeam}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).save().then(() => {
                setIsPdfMode(false);
            });
        }, 500); // 500ms delay to allow styles to apply
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
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#000' }}>{matchInfo.homeTeam || 'HOME'} vs {matchInfo.awayTeam || 'AWAY'}</h1>
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


                <h2 style={{
                    fontSize: '1.2rem',
                    marginBottom: '16px',
                    color: isPdfMode ? '#000' : '#bb86fc',
                    textAlign: isPdfMode ? 'center' : 'left'
                }}>Visual Analysis</h2>

                {/* Shot Analysis */}
                <div className="chart-container" style={{ marginBottom: '24px', backgroundColor: isPdfMode ? '#f5f5f5' : '#1e1e1e', padding: '16px', borderRadius: '8px', color: isPdfMode ? '#333' : '#fff' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Shot Analysis</h3>
                    <div style={{ height: '320px', width: '100%', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
                        {isPdfMode ? (
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <div style={{ margin: '0 auto' }}>
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
                                        <Legend layout="horizontal" verticalAlign="bottom" iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                                    </PieChart>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
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
                                    <Tooltip />
                                    <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                        <KPICard title="Player Inside 65" value={totalAttacks} color={isPdfMode ? '#333' : '#fff'} bgColor={isPdfMode ? '#fff' : '#1e1e1e'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                        <KPICard title="Total Shots" value={sumStats('shotTaken')} color={isPdfMode ? '#333' : '#fff'} bgColor={isPdfMode ? '#fff' : '#1e1e1e'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                        <KPICard title="Scores" value={sumStats('score')} color="#4caf50" bgColor={isPdfMode ? '#fff' : '#1e1e1e'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                        <KPICard title="Territorial Effectiveness" value={`${territorialEffectiveness}%`} color={isPdfMode ? '#333' : '#fff'} bgColor={isPdfMode ? '#fff' : '#1e1e1e'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                        <KPICard title="Efficiency" value={`${Math.round((sumStats('score') / sumStats('shotTaken') || 0) * 100)}%`} color={isPdfMode ? '#333' : '#fff'} bgColor={isPdfMode ? '#fff' : '#1e1e1e'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                    </div>
                </div>

                {/* Pressure Analysis */}
                <div className="chart-container" style={{
                    marginBottom: '24px',
                    backgroundColor: isPdfMode ? '#f5f5f5' : '#1e1e1e',
                    padding: '16px',
                    borderRadius: '8px',
                    color: isPdfMode ? '#333' : '#fff',
                    pageBreakBefore: isPdfMode ? 'always' : 'auto',
                    marginTop: isPdfMode ? '40px' : '0'
                }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Pressure Analysis</h3>
                    <div style={{ height: '320px', width: '100%', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
                        {isPdfMode ? (
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <BarChart width={500} height={300} data={pressureBarData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                    <XAxis dataKey="name" stroke="#333" />
                                    <YAxis stroke="#333" />
                                    <Legend wrapperStyle={{ color: '#333' }} />
                                    <Bar dataKey="Possessions" fill="#bb86fc" isAnimationActive={false} label={{ position: 'top', fill: '#333', fontSize: 12 }} />
                                    <Bar dataKey="Pressures" fill="#4caf50" isAnimationActive={false} label={{ position: 'top', fill: '#333', fontSize: 12 }} />
                                </BarChart>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={pressureBarData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                    <XAxis dataKey="name" stroke="#fff" />
                                    <YAxis stroke="#fff" />
                                    <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                                    <Legend />
                                    <Bar dataKey="Possessions" fill="#bb86fc" />
                                    <Bar dataKey="Pressures" fill="#4caf50" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                        <KPICard title="Possessions" value={totalPossessions} color={isPdfMode ? '#333' : '#fff'} bgColor={isPdfMode ? '#fff' : '#1e1e1e'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                        <KPICard title="Pressures" value={totalPressures} color={isPdfMode ? '#333' : '#fff'} bgColor={isPdfMode ? '#fff' : '#1e1e1e'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                        <KPICard title="Frees Against" value={totalFreesAgainst} color={isPdfMode ? '#333' : '#fff'} bgColor={isPdfMode ? '#fff' : '#1e1e1e'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                        <KPICard title="Turnovers" value={totalTurnovers} color={isPdfMode ? '#333' : '#fff'} bgColor={isPdfMode ? '#fff' : '#1e1e1e'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                        <KPICard title="Efficiency" value={`${pressureEfficiency}%`} color="#f44336" bgColor={isPdfMode ? '#fff' : '#1e1e1e'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                        <KPICard title="Free Rate" value={`${freeRate}%`} color="#00c853" bgColor={isPdfMode ? '#fff' : '#1e1e1e'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                        <KPICard title="Success Rate" value={`${successRate}%`} color="#00c853" bgColor={isPdfMode ? '#fff' : '#1e1e1e'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                    </div>
                </div>

                {/* Ruck Analysis */}
                <div className="chart-container" style={{
                    marginBottom: '24px',
                    backgroundColor: isPdfMode ? '#f5f5f5' : '#1e1e1e',
                    padding: '16px',
                    borderRadius: '8px',
                    color: isPdfMode ? '#333' : '#fff',
                    pageBreakBefore: isPdfMode ? 'always' : 'auto',
                    marginTop: isPdfMode ? '40px' : '0'
                }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Ruck Analysis</h3>
                    <div style={{ height: '320px', width: '100%', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
                        {isPdfMode ? (
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <BarChart width={500} height={300} data={ruckBarData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                    <XAxis dataKey="name" stroke="#333" />
                                    <YAxis stroke="#333" />
                                    <Legend wrapperStyle={{ color: '#333' }} />
                                    <Bar dataKey="Total" fill="#bb86fc" isAnimationActive={false} label={{ position: 'top', fill: '#333', fontSize: 12 }} />
                                    <Bar dataKey="Won" fill="#00c853" isAnimationActive={false} label={{ position: 'top', fill: '#333', fontSize: 12 }} />
                                </BarChart>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
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
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <KPICard title="Total Rucks" value={totalRucks} color={isPdfMode ? '#333' : '#fff'} bgColor={isPdfMode ? '#fff' : '#1e1e1e'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                        <KPICard title="Rucks Won" value={rucksWon} color="#00c853" bgColor={isPdfMode ? '#fff' : '#1e1e1e'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                        <KPICard title="Efficiency" value={`${ruckEfficiency}%`} color={isPdfMode ? '#333' : '#fff'} bgColor={isPdfMode ? '#fff' : '#1e1e1e'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                    </div>
                </div>

                {/* Puckout Analysis */}
                <div className="chart-container" style={{
                    marginBottom: '24px',
                    backgroundColor: isPdfMode ? '#f5f5f5' : '#1e1e1e',
                    padding: '16px',
                    borderRadius: '8px',
                    color: isPdfMode ? '#333' : '#fff',
                    pageBreakBefore: isPdfMode ? 'always' : 'auto',
                    marginTop: isPdfMode ? '40px' : '0'
                }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Puckout Analysis</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>

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
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <KPICard title="Own Won" value={sumStats('ownPuckoutWon')} color="#4caf50" bgColor={isPdfMode ? '#fff' : '#1e1e1e'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                        <KPICard title="Own Lost" value={Math.max(0, sumStats('ownPuckout') - sumStats('ownPuckoutWon'))} color="#cf6679" bgColor={isPdfMode ? '#fff' : '#1e1e1e'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                        <KPICard title="Opp Won" value={sumStats('oppPuckoutWon')} color="#03dac6" bgColor={isPdfMode ? '#fff' : '#1e1e1e'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
                        <KPICard title="Opp Lost" value={Math.max(0, sumStats('oppPuckout') - sumStats('oppPuckoutWon'))} color="#bb86fc" bgColor={isPdfMode ? '#fff' : '#1e1e1e'} titleColor={isPdfMode ? '#666' : '#b0b0b0'} />
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
        </div>
    );
};

export default PlayerStatsView;
