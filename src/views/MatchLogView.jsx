import React, { useState, useMemo } from 'react';
import { useMatch } from '../context/MatchContext';
import { Download, Filter, Search, FileText, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const MatchLogView = () => {
    const { matchLog, matchInfo, deleteLogEntry } = useMatch();
    const [filters, setFilters] = useState({
        quarter: '',
        type: '',
        team: '',
        search: ''
    });

    // Helper to format event types for display
    const formatType = (type) => {
        if (!type) return '';
        // handle camelCase and specific IDs
        const formatted = type
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace('Conceded Home', 'Conceded')
            .replace('Conceded Away', 'Opp Conceded')
            .replace('Frees Against', 'Free Due To Pressure')
            .replace('Frees', 'Free');
        return formatted;
    };

    // Resilient data access
    const safeLog = useMemo(() => {
        if (!matchLog) return [];
        if (Array.isArray(matchLog)) return matchLog;
        try {
            return Object.values(matchLog);
        } catch (e) {
            return [];
        }
    }, [matchLog]);

    // Unique values for filters - sorted logically
    const quarters = useMemo(() => {
        const order = ['Q1', 'Q2', 'Q3', 'Q4', 'FT'];
        const existing = [...new Set(safeLog.map(l => (l.quarter || '').toString().trim().toUpperCase()))].filter(Boolean);
        return order.filter(q => existing.includes(q)).concat(existing.filter(q => !order.includes(q)));
    }, [safeLog]);

    const types = useMemo(() => {
        return [...new Set(safeLog.map(l => (l.type || '').toString().trim()))].filter(Boolean).sort();
    }, [safeLog]);

    const teams = useMemo(() => {
        return [...new Set(safeLog.map(l => (l.team || '').toString().trim()))].filter(Boolean).sort();
    }, [safeLog]);

    // Resilient filtering engine (Reactive on every render for absolute accuracy)
    const filteredLog = safeLog.filter(entry => {
        if (!entry) return false;

        // Normalize data
        const entryTeam = (entry.team || '').toString().trim().toLowerCase();
        const filterTeam = (filters.team || '').toString().trim().toLowerCase();

        const entryQuarter = (entry.quarter || '').toString().trim().toUpperCase();
        const filterQuarter = (filters.quarter || '').toString().trim().toUpperCase();

        const entryType = (entry.type || '').toString().trim().toLowerCase();
        const filterType = (filters.type || '').toString().trim().toLowerCase();

        // Comparison Logic
        const matchesQuarter = !filterQuarter || entryQuarter === filterQuarter;
        const matchesType = !filterType || entryType === filterType;
        const matchesTeam = !filterTeam || entryTeam === filterTeam;

        const searchTerm = (filters.search || '').trim().toLowerCase();
        const matchesSearch = !searchTerm ||
            formatType(entry.type || '').toLowerCase().includes(searchTerm) ||
            entryTeam.includes(searchTerm);

        return matchesQuarter && matchesType && matchesTeam && matchesSearch;
    });

    const clearFilters = () => {
        setFilters({
            quarter: '',
            type: '',
            team: '',
            search: ''
        });
    };

    const handleDelete = (id, type) => {
        const typeLabel = formatType(type);
        if (window.confirm(`Are you sure you want to remove this "${typeLabel}" entry from the log?\n\nNote: This only removes the log record and does NOT update match statistics or charts.`)) {
            deleteLogEntry(id);
        }
    };

    const handleExportCSV = () => {
        if (filteredLog.length === 0) {
            alert("No events to export.");
            return;
        }

        const headers = ["Quarter", "Time", "Team", "Event Type"];
        const rows = filteredLog.map(entry => [
            entry.quarter,
            entry.time,
            entry.team,
            formatType(entry.type)
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Match_Log_${matchInfo.homeTeam}_vs_${matchInfo.awayTeam}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        const element = document.getElementById('match-log-table');
        if (!element) return;

        // Apply export class for PDF styling
        element.classList.add('log-export-mode');

        const opt = {
            margin: 10,
            filename: `Match_Log_${matchInfo.homeTeam}_vs_${matchInfo.awayTeam}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            element.classList.remove('log-export-mode');
        });
    };

    return (
        <div style={{ padding: '20px', paddingBottom: '80px', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#bb86fc', fontSize: '1.2rem', margin: 0 }}>Match Log</h2>
                <span style={{ fontSize: '0.8rem', color: '#b0b0b0', marginLeft: '10px', flexGrow: 1 }}>
                    Showing {filteredLog.length} of {safeLog.length} events
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={clearFilters}
                        style={{
                            backgroundColor: '#333',
                            color: '#fff',
                            border: '1px solid #444',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleExportCSV}
                        style={{
                            backgroundColor: '#03dac6',
                            color: 'black',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.8rem'
                        }}
                    >
                        <Download size={16} /> CSV
                    </button>
                    <button
                        onClick={handleExportPDF}
                        style={{
                            backgroundColor: '#bb86fc',
                            color: 'black',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.8rem'
                        }}
                    >
                        <FileText size={16} /> PDF
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                backgroundColor: '#1e1e1e',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '15px'
            }}>
                <div>
                    <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.7rem', marginBottom: '5px' }}>Quarter</label>
                    <select
                        value={filters.quarter}
                        onChange={(e) => setFilters(prev => ({ ...prev, quarter: e.target.value }))}
                        style={{ width: '100%', padding: '8px', backgroundColor: '#2d2d2d', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
                    >
                        <option value="">All Quarters</option>
                        {quarters.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.7rem', marginBottom: '5px' }}>Event Type</label>
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        style={{ width: '100%', padding: '8px', backgroundColor: '#2d2d2d', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
                    >
                        <option value="">All Types</option>
                        {types.map(t => <option key={t} value={t}>{formatType(t)}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.7rem', marginBottom: '5px' }}>Team</label>
                    <select
                        value={filters.team}
                        onChange={(e) => setFilters(prev => ({ ...prev, team: e.target.value }))}
                        style={{ width: '100%', padding: '8px', backgroundColor: '#2d2d2d', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
                    >
                        <option value="">All Teams</option>
                        {teams.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.7rem', marginBottom: '5px' }}>Search Events</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#b0b0b0' }} />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            placeholder="Search by event or team..."
                            style={{
                                width: '100%',
                                padding: '8px 8px 8px 30px',
                                backgroundColor: '#2d2d2d',
                                color: '#fff',
                                border: '1px solid #444',
                                borderRadius: '4px'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Log Table */}
            <div style={{ overflowX: 'auto', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
                <table id="match-log-table" style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #333', textAlign: 'left' }}>
                            <th style={{ padding: '12px 15px', color: '#03dac6' }}>Quarter</th>
                            <th style={{ padding: '12px 15px', color: '#03dac6' }}>Time</th>
                            <th style={{ padding: '12px 15px', color: '#03dac6' }}>Team</th>
                            <th style={{ padding: '12px 15px', color: '#03dac6' }}>Event</th>
                            <th style={{ padding: '12px 15px', color: '#03dac6', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLog.length > 0 ? (
                            filteredLog.map((entry, idx) => {
                                const isHome = entry.team === matchInfo.homeTeam;
                                const teamColor = isHome ? (matchInfo.homeTeamColor || '#bb86fc') : (matchInfo.awayTeamColor || '#666');

                                // Robust Key: ID + Timestamp + Index
                                const rowKey = `${entry.id || 'none'}-${entry.timestamp || '0'}-${idx}`;

                                return (
                                    <tr key={rowKey} style={{ borderBottom: '1px solid #333' }}>
                                        <td style={{ padding: '12px 15px' }}>{entry.quarter}</td>
                                        <td style={{ padding: '12px 15px' }}>{entry.time}</td>
                                        <td style={{ padding: '12px 15px' }}>
                                            <span className="team-badge" style={{
                                                backgroundColor: teamColor,
                                                color: isHome && !matchInfo.homeTeamColor ? 'black' : 'white',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {entry.team}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 15px' }}>{formatType(entry.type)}</td>
                                        <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleDelete(entry.id, entry.type)}
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    color: '#cf6679',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    borderRadius: '4px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                title="Remove from log"
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(207, 102, 121, 0.1)'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
                                    No events recorded matching filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MatchLogView;
