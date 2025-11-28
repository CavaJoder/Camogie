import React from 'react';
import { useMatch } from '../context/MatchContext';
import html2pdf from 'html2pdf.js';

const DashboardView = () => {
    const { stats, timer, matchInfo } = useMatch();

    // Helper to sum stats across specific quarters
    const sumStats = (statId, quarters = ['q1', 'q2', 'q3', 'q4']) => {
        return quarters.reduce((total, q) => {
            return total + (stats[q]?.[statId] || 0);
        }, 0);
    };

    // Helper to determine color based on quarter status
    const getQuarterColor = (q) => {
        const order = ['Q1', 'Q2', 'Q3', 'Q4', 'FT'];
        const currentIdx = order.indexOf(timer.quarter);
        const qIdx = order.indexOf(q.toUpperCase());

        if (currentIdx > qIdx) return '#4caf50'; // Completed
        if (currentIdx === qIdx) return '#cf6679'; // In Progress
        return '#b0b0b0'; // Future (Grey)
    };

    const generatePDF = () => {
        const element = document.getElementById('printableStats');

        // Inject Header for PDF
        const headerDiv = document.createElement('div');
        headerDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px;">
        ${matchInfo.homeCrest ? `<img src="${matchInfo.homeCrest}" style="width: 80px; height: 80px; object-fit: contain;" />` : '<div></div>'}
        <div style="text-align: center;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0;">${matchInfo.homeTeam || 'HOME'} vs ${matchInfo.awayTeam || 'AWAY'}</h1>
          <p style="color: #666; margin: 5px 0;">${[matchInfo.date, matchInfo.competition, matchInfo.venue].filter(Boolean).join(' • ')}</p>
        </div>
        ${matchInfo.awayCrest ? `<img src="${matchInfo.awayCrest}" style="width: 80px; height: 80px; object-fit: contain;" />` : '<div></div>'}
      </div>
    `;

        const clone = element.cloneNode(true);
        clone.insertBefore(headerDiv, clone.firstChild);
        clone.classList.add('pdf-mode');

        const container = document.createElement('div');
        container.appendChild(clone);
        document.body.appendChild(container);

        const opt = {
            margin: 10,
            filename: `Match_Analysis_${matchInfo.homeTeam}_vs_${matchInfo.awayTeam}_${matchInfo.date}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(clone).save().then(() => {
            document.body.removeChild(container);
        });
    };

    const getStats = (quarters, type) => {
        let value = 0;
        let total = 0;

        quarters.forEach(q => {
            if (type === 'rucks') {
                const rucks = (stats[q]?.defRuck || 0) + (stats[q]?.midRuck || 0) + (stats[q]?.offRuck || 0);
                const won = (stats[q]?.defRuckWon || 0) + (stats[q]?.midRuckWon || 0) + (stats[q]?.offRuckWon || 0);
                value += won;
                total += rucks;
            } else if (type === 'possession') {
                const oppPoss = stats[q]?.oppPossessions || 0;
                const success = (stats[q]?.turnovers || 0) + (stats[q]?.freesAgainst || 0);
                value += success;
                total += oppPoss;
            } else if (type === 'attack') {
                const shots = stats[q]?.shotTaken || 0;
                const score = stats[q]?.score || 0;
                value += score;
                total += shots;
            } else if (type === 'puckouts') {
                const tot = (stats[q]?.oppPuckout || 0) + (stats[q]?.ownPuckout || 0);
                const won = (stats[q]?.oppPuckoutWon || 0) + (stats[q]?.ownPuckoutWon || 0);
                value += won;
                total += tot;
            }
        });

        return { value, total, pct: total ? Math.round((value / total) * 100) : 0 };
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
                marginBottom: '16px',
                border: '1px solid #333'
            }}>
                <h3 style={{ color: '#03dac6', fontSize: '1rem', marginBottom: '12px' }}>{title}</h3>
                {rows.map((row, idx) => {
                    const { value, total, pct } = getStats(row.quarters, type);

                    // Determine color style
                    // Default is 'inherit' which will be white in app (via body) and black in PDF (via .pdf-mode)
                    // Halves are Red (#cf6679)
                    // Totals are Turquoise (#03dac6)

                    let colorStyle = {};
                    if (row.isHalf) colorStyle = { color: '#cf6679' };
                    else if (row.isTotal) colorStyle = { color: '#03dac6' };
                    else colorStyle = { color: 'inherit' }; // Q1-Q4 will inherit

                    const showSeparatorBefore = row.isHalf && row.label === '1st Half';
                    const showSeparatorBeforeTotal = row.isTotal;

                    return (
                        <React.Fragment key={idx}>
                            {showSeparatorBefore && <div style={{ borderTop: '1px dashed #333', margin: '8px 0' }} />}
                            {showSeparatorBeforeTotal && <div style={{ borderTop: '1px solid #333', margin: '8px 0' }} />}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.9rem',
                                marginBottom: '4px',
                                ...colorStyle, // Apply dynamic color
                                fontWeight: row.isTotal ? 'bold' : 'normal'
                            }}>
                                <span>{row.label}</span>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <span style={{ fontWeight: 'bold', width: '40px', textAlign: 'right' }}>{pct}%</span>
                                    <span style={{ width: '50px', textAlign: 'right', opacity: 0.8 }}>({value}/{total})</span>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    const StatRow = ({ label, statId }) => {
        const q1 = stats.q1[statId] || 0;
        const q2 = stats.q2[statId] || 0;
        const q3 = stats.q3[statId] || 0;
        const q4 = stats.q4[statId] || 0;
        const total = q1 + q2 + q3 + q4;

        return (
            <div style={{
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

    return (
        <div style={{ padding: '16px', paddingBottom: '80px' }}>
            <div id="printableStats">
                {/* Summary Section */}
                <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#bb86fc' }}>Match Summary</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <SummaryCard title="Rucks (Win %)" type="rucks" />
                    <SummaryCard title="Possession (Pressure %)" type="possession" />
                    <SummaryCard title="Attack (Efficiency)" type="attack" />
                    <SummaryCard title="Puckouts (Win %)" type="puckouts" />
                </div>

                {/* Page Break applied via CSS to the header below */}
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
                    <StatRow label="Middle Third Rucks" statId="midRuck" />
                    <StatRow label="Middle Third Rucks Won" statId="midRuckWon" />
                    <StatRow label="Offensive Rucks" statId="offRuck" />
                    <StatRow label="Offensive Rucks Won" statId="offRuckWon" />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '8px', color: '#03dac6' }}>PRESSURES</h3>
                    <StatRow label="Opp Possessions" statId="oppPossessions" />
                    <StatRow label="Pressures" statId="pressures" />
                    <StatRow label="Turnovers" statId="turnovers" />
                    <StatRow label="Frees Against" statId="freesAgainst" />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '8px' }}>ATTACK</h3>
                    <StatRow label="Shots" statId="shotTaken" />
                    <StatRow label="Scores" statId="score" />
                    <StatRow label="Inside 65" statId="ballInside65" />
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
                Download Match PDF
            </button>
        </div>
    );
};

export default DashboardView;
