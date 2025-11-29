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

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = date.getDate();
        const ordinal = (day > 3 && day < 21) ? 'th' : ['th', 'st', 'nd', 'rd'][day % 10] || 'th';
        const month = date.toLocaleString('en-GB', { month: 'short' });
        const year = date.getFullYear();
        return `${day}${ordinal} ${month} ${year}`;
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
          <p style="color: #666; margin: 5px 0;">${[formatDate(matchInfo.date), matchInfo.competition, matchInfo.venue].filter(Boolean).join(' • ')}</p>
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
                const pressures = stats[q]?.pressures || 0;
                value += pressures;
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
            } else if (type === 'conversion') {
                const entries = stats[q]?.ballInside65 || 0;
                const shots = stats[q]?.shotTaken || 0;
                value += shots;
                total += entries;
            } else if (type === 'scoring') {
                const shots = stats[q]?.shotTaken || 0;
                const scores = stats[q]?.score || 0;
                value += scores;
                total += shots;
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
                                    <span style={{ width: '50px', textAlign: 'right', opacity: 0.8, color: row.isHalf ? '#fff' : 'inherit' }}>({value}/{total})</span>
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

    const CalculatedRow = ({ label, numeratorId, denominatorId }) => {
        const getPctValue = (q) => {
            const num = stats[q]?.[numeratorId] || 0;
            const den = stats[q]?.[denominatorId] || 0;
            return den > 0 ? Math.round((num / den) * 100) : null;
        };

        const q1Val = getPctValue('q1');
        const q2Val = getPctValue('q2');
        const q3Val = getPctValue('q3');
        const q4Val = getPctValue('q4');

        const totalNum = (stats.q1?.[numeratorId] || 0) + (stats.q2?.[numeratorId] || 0) + (stats.q3?.[numeratorId] || 0) + (stats.q4?.[numeratorId] || 0);
        const totalDen = (stats.q1?.[denominatorId] || 0) + (stats.q2?.[denominatorId] || 0) + (stats.q3?.[denominatorId] || 0) + (stats.q4?.[denominatorId] || 0);
        const totalVal = totalDen > 0 ? Math.round((totalNum / totalDen) * 100) : null;

        return (
            <div style={{
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

    return (
        <div style={{ padding: '16px', paddingBottom: '80px' }}>
            <div id="printableStats">
                <style>{`
                .half-row { color: #90caf9 !important; }
                
                .pdf-mode .summary-card .pct-high { color: #000000 !important; }
                .pdf-mode .half-row { color: #000000 !important; }
            `}</style>
                {/* Summary Section */}
                <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#bb86fc' }}>Match Summary</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <SummaryCard title="Rucks (Win %)" type="rucks" />
                    <SummaryCard title="Possession (Pressure %)" type="possession" />
                    <SummaryCard title="Scoring Efficiency (Shots to Scores)" type="attack" />
                    <SummaryCard title="Puckouts (Win %)" type="puckouts" />
                    <SummaryCard title="Shot Attempts (Entries to Shots)" type="conversion" />
                    <SummaryCard title="Scoring (Shots to Scores)" type="scoring" />
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
