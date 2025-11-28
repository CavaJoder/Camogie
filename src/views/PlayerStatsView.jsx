import React from 'react';
import { useMatch } from '../context/MatchContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
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
        { name: 'Shorts', value: sumStats('short'), color: '#ff9800' },
        { name: 'Saved', value: sumStats('saved'), color: '#ff9800' },
    ].filter(d => d.value > 0);

    const pressureData = [
        { name: 'Turnovers', value: sumStats('turnovers'), color: '#4caf50' },
        { name: 'Frees Against', value: sumStats('freesAgainst'), color: '#cf6679' }, // Negative outcome usually, but counted as pressure success in one metric? Wait, "Successful Pressures: Turnovers + Frees Against". So Frees Against is good for pressure? "Frees Against" usually means we conceded a free. But the prompt says "Successful Pressures: Turnovers + Frees Against". This implies "Frees Won" maybe? Or maybe "Frees Against" the opposition?
        // Prompt says: "(1) Possession & Pressure: ... Frees Against".
        // Prompt says: "Successful Pressures: Turnovers + Frees Against".
        // Usually "Frees Against" means we fouled. If that's a "Successful Pressure", maybe it means we stopped them?
        // Or maybe it means "Frees For"?
        // Let's stick to the prompt's calculation: Turnovers + Frees Against.
        // But for the chart, I'll just show the breakdown.
    ].filter(d => d.value > 0);

    // Let's make a better Pressure Chart: Outcomes of Possession
    const pressureChartData = [
        { name: 'Turnovers Won', value: sumStats('turnovers'), color: '#4caf50' },
        { name: 'Frees Conceded', value: sumStats('freesAgainst'), color: '#cf6679' },
        { name: 'No Impact', value: Math.max(0, sumStats('oppPossessions') - sumStats('turnovers') - sumStats('freesAgainst')), color: '#bb86fc' }
    ].filter(d => d.value > 0);

    const puckoutData = [
        { name: 'Won Own', value: sumStats('ownPuckoutWon'), color: '#4caf50' },
        { name: 'Lost Own', value: Math.max(0, sumStats('ownPuckout') - sumStats('ownPuckoutWon')), color: '#cf6679' },
        { name: 'Won Opp', value: sumStats('oppPuckoutWon'), color: '#03dac6' },
        { name: 'Lost Opp', value: Math.max(0, sumStats('oppPuckout') - sumStats('oppPuckoutWon')), color: '#bb86fc' },
    ].filter(d => d.value > 0);

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

    const KPICard = ({ title, value, sub, color = '#fff' }) => (
        <div className="kpi-card" style={{
            backgroundColor: '#1e1e1e',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '100px',
            flex: 1
        }}>
            <div className="kpi-title" style={{ fontSize: '0.8rem', color: '#b0b0b0', marginBottom: '4px' }}>{title}</div>
            <div className="kpi-value" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: color }}>{value}</div>
            {sub && <div style={{ fontSize: '0.75rem', color: '#666' }}>{sub}</div>}
        </div>
    );

    return (
        <div style={{ padding: '16px', paddingBottom: '80px' }}>
            <div id="printablePlayerStats" className={isPdfMode ? 'player-pdf-mode' : ''}>

                {/* PDF Header - Only visible in PDF Mode */}
                {isPdfMode && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '20px' }}>
                        {matchInfo.homeCrest ? <img src={matchInfo.homeCrest} style={{ width: '80px', height: '80px', objectFit: 'contain' }} alt="Home Crest" /> : <div></div>}
                        <div style={{ textAlign: 'center' }}>
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#000' }}>{matchInfo.homeTeam || 'HOME'} vs {matchInfo.awayTeam || 'AWAY'}</h1>
                            <p style={{ color: '#666', margin: '5px 0' }}>{[matchInfo.date, matchInfo.competition, matchInfo.venue].filter(Boolean).join(' • ')}</p>
                        </div>
                        {matchInfo.awayCrest ? <img src={matchInfo.awayCrest} style={{ width: '80px', height: '80px', objectFit: 'contain' }} alt="Away Crest" /> : <div></div>}
                    </div>
                )}

                <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: isPdfMode ? '#000' : '#bb86fc', textAlign: isPdfMode ? 'center' : 'left' }}>Visual Analysis</h2>

                {/* Shot Analysis */}
                <div className="chart-container" style={{ marginBottom: '24px', backgroundColor: '#1e1e1e', padding: '16px', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Shot Analysis</h3>
                    <div style={{ height: '320px', width: '100%', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
                        {isPdfMode ? (
                            <PieChart width={600} height={300}>
                                <Pie
                                    data={shotData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    isAnimationActive={false}
                                >
                                    {shotData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
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
                                    >
                                        {shotData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <KPICard title="Total Shots" value={sumStats('shotTaken')} />
                        <KPICard title="Scores" value={sumStats('score')} color="#4caf50" />
                        <KPICard title="Efficiency" value={`${Math.round((sumStats('score') / sumStats('shotTaken') || 0) * 100)}%`} />
                    </div>
                </div>

                {/* Pressure Analysis */}
                <div className="chart-container" style={{ marginBottom: '24px', backgroundColor: '#1e1e1e', padding: '16px', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Pressure Analysis</h3>
                    <div style={{ height: '320px', width: '100%', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
                        {isPdfMode ? (
                            <PieChart width={600} height={300}>
                                <Pie
                                    data={pressureChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    isAnimationActive={false}
                                >
                                    {pressureChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pressureChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        isAnimationActive={false}
                                    >
                                        {pressureChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Puckout Analysis */}
                <div className="chart-container" style={{ marginBottom: '24px', backgroundColor: '#1e1e1e', padding: '16px', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Puckout Analysis</h3>
                    <div style={{ height: '320px', width: '100%', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
                        {isPdfMode ? (
                            <PieChart width={600} height={300}>
                                <Pie
                                    data={puckoutData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    isAnimationActive={false}
                                >
                                    {puckoutData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={puckoutData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        isAnimationActive={false}
                                    >
                                        {puckoutData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
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
