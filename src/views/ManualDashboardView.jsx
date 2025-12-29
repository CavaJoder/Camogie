import React, { useState } from 'react';
import { useMatch } from '../context/MatchContext';
import html2pdf from 'html2pdf.js';
import ManualMatchReport from '../components/ManualMatchReport';

const ManualDashboardView = () => {
    const { matchInfo } = useMatch();
    const [isPdfMode, setIsPdfMode] = useState(false);

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

    return (
        <div style={{ padding: '20px', paddingBottom: '80px' }}>
            {/* The ManualMatchReport component now handles all the rendering logic */}
            <ManualMatchReport isPdfMode={isPdfMode} />

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

