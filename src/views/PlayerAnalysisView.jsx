import React, { useState, useEffect } from 'react';
import { useSquad } from '../context/SquadContext';
import { useMatch } from '../context/MatchContext';
import { usePlayerAnalysis } from '../context/PlayerAnalysisContext';
import { Minus, Plus, RotateCcw, UserPlus, X, Download, Cloud, CloudOff, Upload, Maximize2, Minimize2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import Papa from 'papaparse';
import { db } from '../firebase';
import { ref, onValue, set, get } from 'firebase/database';

const PlayerAnalysisView = () => {
    const { squads } = useSquad();
    const {
        selectedSquadId,
        setSelectedSquadId,
        selectedPlayers,
        setSelectedPlayers,
        playerStats,
        setPlayerStats, // Added missing destructuring
        metrics,
        getPlayerStats,
        incrementStat,
        decrementStat,
        resetSquadStats
    } = usePlayerAnalysis();

    // Reverse Engineering: Integrations
    const { matchList, loadMatchList, loadMatch, matchId, isAdmin, matchSource } = useMatch();
    const [isSyncing, setIsSyncing] = useState(false);

    // Sync Logic: Robust Path Finder
    useEffect(() => {
        if (!matchId) {
            setPlayerStats({});
            setSelectedPlayers([]);
            setIdMapping({});
            return;
        }

        // Reset state on match change to prevent stale data from previous match
        setSelectedPlayers([]);
        setIdMapping({});

        const targetDb = db;
        let unsubscribe = () => { };

        const findAndListen = async () => {
            // 1. Try Legacy Path 'playAnalysis'
            const legacyRef = ref(targetDb, `matches/${matchId}/playAnalysis`);

            try {
                const legacySnap = await get(legacyRef);
                if (legacySnap.exists()) {
                    console.log("DEBUG: Found data at playAnalysis");
                    unsubscribe = onValue(legacyRef, (snapshot) => {
                        if (snapshot.exists()) {
                            const data = snapshot.val();
                            const actualStats = data.playerStats || data;
                            setPlayerStats(actualStats);
                        }
                    });
                    return;
                }

                // 2. Try New Path 'playerAnalysis'
                const newRef = ref(targetDb, `matches/${matchId}/playerAnalysis`);
                const newSnap = await get(newRef);

                if (newSnap.exists()) {
                    console.log("DEBUG: Found data at playerAnalysis");
                    unsubscribe = onValue(newRef, (snapshot) => {
                        if (snapshot.exists()) {
                            const data = snapshot.val();
                            const actualStats = data.playerStats || data;
                            setPlayerStats(actualStats);
                        }
                    });
                    return;
                }
            } catch (e) {
                console.error("Error finding analysis path:", e);
            }

            // 3. Fallback: Data Missing
            console.log("DEBUG: No Analysis Data found at either key.");
            setPlayerStats({});
        };

        findAndListen();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [matchId, matchSource, setPlayerStats]);

    // Write Logic
    useEffect(() => {
        if (!matchId || !isSyncing) return;

        const targetDb = db;

        // Use 'playerAnalysis' as primary path
        const path = `matches/${matchId}/playerAnalysis`;

        const syncRef = ref(targetDb, path);
        set(syncRef, playerStats)
            .catch(err => console.error("Sync error", err));
    }, [playerStats, matchId, isSyncing, isAdmin]);

    useEffect(() => {
        loadMatchList();
    }, []);

    const [showPlayerSelector, setShowPlayerSelector] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const [idMapping, setIdMapping] = useState({}); // New State for Name-based Mapping
    const [collapsedPlayers, setCollapsedPlayers] = useState([]);

    const selectedSquad = selectedSquadId ? squads.find(s => s.id === selectedSquadId) : null;

    // Auto-select & Map players based on Name/ID
    useEffect(() => {
        if (selectedSquad && playerStats && Object.keys(playerStats).length > 0) {
            const mapping = {};
            const foundIds = [];

            // 1. Index Data by Name for fast lookup
            const nameToDataId = {};
            Object.entries(playerStats).forEach(([key, val]) => {
                if (val?.name) {
                    const norm = val.name.toLowerCase().trim();
                    nameToDataId[norm] = key;
                }
            });

            // 2. Iterate Squad Players
            selectedSquad.players.forEach(p => {
                const normName = p.name.toLowerCase().trim();

                // A. Direct ID Match
                if (playerStats[p.id]) {
                    mapping[p.id] = p.id;
                    foundIds.push(p.id);
                }
                // B. Name Match
                else if (nameToDataId[normName]) {
                    mapping[p.id] = nameToDataId[normName];
                    foundIds.push(p.id);
                }
            });

            if (foundIds.length > 0) {
                console.log(`DEBUG: Auto-mapped ${foundIds.length} players via Name/ID.`);
                setIdMapping(mapping);
                setSelectedPlayers(foundIds);
            }
        }
    }, [selectedSquad, playerStats]); // Dependency on playerStats ensures re-run when data loads

    const handleSquadChange = (e) => {
        const newSquadId = e.target.value || null;
        setSelectedSquadId(newSquadId);
        setSelectedPlayers([]); // Clear selected players when changing squad
    };

    const handleResetSquad = () => {
        if (selectedSquad) {
            const playerIds = selectedPlayers;
            resetSquadStats(selectedSquadId, playerIds);
        }
    };

    const addPlayer = (playerId) => {
        if (!selectedPlayers.includes(playerId)) {
            setSelectedPlayers([...selectedPlayers, playerId]);
        }
        setShowPlayerSelector(false);
    };

    const removePlayer = (playerId) => {
        setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    };

    const availablePlayers = selectedSquad
        ? selectedSquad.players.filter(p => !selectedPlayers.includes(p.id))
        : [];

    const activePlayers = selectedSquad
        ? selectedSquad.players.filter(p => selectedPlayers.includes(p.id))
        : [];

    const toggleColumn = (playerId) => {
        if (collapsedPlayers.includes(playerId)) {
            setCollapsedPlayers(prev => prev.filter(id => id !== playerId));
        } else {
            setCollapsedPlayers(prev => [...prev, playerId]);
        }
    };

    const handleExportCSV = () => {
        if (!selectedSquad || !activePlayers.length) return;

        const data = activePlayers.map(p => {
            const dataId = idMapping[p.id] || p.id;
            const stats = playerStats[dataId] || {};
            const row = { Name: p.name };
            metrics.forEach(m => row[m.label] = stats[m.id] || 0);
            return row;
        });

        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${selectedSquad.name}_Player_Analysis.csv`;
        link.click();
    };

    const handleImportCSV = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const importedStats = { ...playerStats };
                let count = 0;

                results.data.forEach(row => {
                    const name = row.Name || row.name;
                    if (!name) return;

                    const player = selectedSquad.players.find(p => p.name.toLowerCase() === name.toLowerCase().trim());
                    if (!player) return;

                    const pStats = {};
                    metrics.forEach(m => {
                        const val = row[m.label] || row[m.id];
                        if (val !== undefined) pStats[m.id] = parseInt(val) || 0;
                    });

                    const dataId = idMapping[player.id] || player.id;
                    importedStats[dataId] = { ...importedStats[dataId], ...pStats };
                    count++;
                });

                setPlayerStats(importedStats);
                alert(`Imported stats for ${count} players.`);
            }
        });
    };

    // PDF Generation
    const generatePDF = async () => {
        if (!selectedSquad || activePlayers.length === 0) {
            alert('Please select a squad and add players to generate PDF');
            return;
        }

        setIsGeneratingPdf(true);

        try {
            // Create PDF content Container
            const pdfContent = document.createElement('div');
            pdfContent.id = 'pdf-report-container';
            pdfContent.style.width = '800px'; // Force A4 width
            pdfContent.style.padding = '40px';
            pdfContent.style.backgroundColor = '#ffffff';
            pdfContent.style.color = '#000000';
            pdfContent.style.fontFamily = 'Arial, sans-serif';

            // Title
            const title = document.createElement('h1');
            title.textContent = `Player Analysis Report`;
            title.style.textAlign = 'center';
            title.style.marginBottom = '10px';
            title.style.color = '#333';
            pdfContent.appendChild(title);

            const subtitle = document.createElement('h3');
            subtitle.textContent = `${selectedSquad.name} | ${new Date().toLocaleDateString()}`;
            subtitle.style.textAlign = 'center';
            subtitle.style.marginBottom = '30px';
            subtitle.style.color = '#555';
            pdfContent.appendChild(subtitle);

            // 1. SUMMARY TABLE (Aggregated view)
            const summaryTitle = document.createElement('h2');
            summaryTitle.textContent = "Squad Summary";
            summaryTitle.style.borderBottom = '2px solid #444';
            summaryTitle.style.paddingBottom = '5px';
            summaryTitle.style.marginTop = '20px';
            pdfContent.appendChild(summaryTitle);

            const summaryTable = document.createElement('table');
            summaryTable.style.width = '100%';
            summaryTable.style.borderCollapse = 'collapse';
            summaryTable.style.marginBottom = '20px';
            summaryTable.style.fontSize = '10px'; // Compact font

            // Header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            headerRow.style.backgroundColor = '#ddd';

            const nameTh = document.createElement('th');
            nameTh.textContent = 'Player';
            nameTh.style.padding = '5px';
            nameTh.style.border = '1px solid #ccc';
            headerRow.appendChild(nameTh);

            metrics.forEach(m => {
                const th = document.createElement('th');
                th.textContent = m.label;
                th.style.padding = '5px';
                th.style.border = '1px solid #ccc';
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            summaryTable.appendChild(thead);

            // Body
            const tbody = document.createElement('tbody');
            activePlayers.forEach(player => {
                const tr = document.createElement('tr');
                // Mapping Lookup
                const dataId = idMapping[player.id] || player.id;
                const stats = playerStats[dataId] || {};

                const nameTd = document.createElement('td');
                nameTd.textContent = player.name;
                nameTd.style.padding = '5px';
                nameTd.style.border = '1px solid #ccc';
                nameTd.style.fontWeight = 'bold';
                tr.appendChild(nameTd);

                metrics.forEach(m => {
                    const td = document.createElement('td');
                    td.textContent = stats[m.id] || 0;
                    td.style.padding = '5px';
                    td.style.border = '1px solid #ccc';
                    td.style.textAlign = 'center';
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
            summaryTable.appendChild(tbody);
            pdfContent.appendChild(summaryTable);

            // 2. DETAILED SECTIONS
            const detailsTitle = document.createElement('h2');
            detailsTitle.textContent = "Individual Breakdowns";
            detailsTitle.style.borderBottom = '2px solid #444';
            detailsTitle.style.paddingBottom = '5px';
            detailsTitle.style.marginTop = '30px';
            pdfContent.appendChild(detailsTitle);

            activePlayers.forEach((player, index) => {
                const dataId = idMapping[player.id] || player.id;
                const stats = playerStats[dataId] || {};

                const playerSection = document.createElement('div');
                playerSection.style.marginTop = '20px';
                playerSection.style.pageBreakInside = 'avoid';

                const pHeader = document.createElement('h3');
                pHeader.textContent = `${index + 1}. ${player.name}`;
                pHeader.style.backgroundColor = '#f0f0f0';
                pHeader.style.padding = '8px';
                pHeader.style.borderLeft = '5px solid #4caf50';
                pHeader.style.marginBottom = '10px';
                playerSection.appendChild(pHeader);

                // Small grid for stats (replaces long vertical table)
                const statsGrid = document.createElement('div');
                statsGrid.style.display = 'flex';
                statsGrid.style.flexWrap = 'wrap';
                statsGrid.style.gap = '10px';

                metrics.forEach(m => {
                    const box = document.createElement('div');
                    box.style.border = '1px solid #eee';
                    box.style.padding = '5px';
                    box.style.textAlign = 'center';
                    box.style.width = '22%'; // Approx 4 columns
                    box.style.boxSizing = 'border-box';

                    const label = document.createElement('div');
                    label.textContent = m.label;
                    label.style.fontSize = '9px';
                    label.style.color = '#666';

                    const val = document.createElement('div');
                    val.textContent = stats[m.id] || 0;
                    val.style.fontWeight = 'bold';
                    val.style.fontSize = '12px';
                    val.style.color = '#000';

                    box.appendChild(label);
                    box.appendChild(val);
                    statsGrid.appendChild(box);
                });
                playerSection.appendChild(statsGrid);
                pdfContent.appendChild(playerSection);
            });

            // NEW STRATEGY: Native Print Window (Reliable)
            // Fixes "Blank PDF" issues by using browser's native renderer
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Please allow popups to download the PDF Report.');
                return;
            }

            printWindow.document.write(`
                <html>
                <head>
                    <title>${selectedSquad.name}_Analysis_Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; -webkit-print-color-adjust: exact; }
                        @media print {
                            @page { size: A4; margin: 10mm; }
                            body { margin: 0; }
                        }
                    </style>
                </head>
                <body>
                </body>
                </html>
            `);

            // Append the generated content
            printWindow.document.body.appendChild(pdfContent);
            printWindow.document.close();

            // Wait for images/styles to settle then print
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);

        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Error generating PDF. Check console.');
        } finally {
            setIsGeneratingPdf(false);
        }

    };

    return (
        <div style={{ padding: '20px', paddingBottom: '90px', color: '#fff', minHeight: '100vh', boxSizing: 'border-box' }}>
            {/* Live Analysis Sync Section */}
            <div style={{
                backgroundColor: '#121212',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
                border: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1 }}>
                    <select
                        onChange={(e) => {
                            if (e.target.value) {
                                loadMatch(e.target.value);
                            }
                        }}
                        style={{
                            padding: '8px',
                            backgroundColor: '#1e1e1e',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            color: 'white',
                            flex: 1,
                            maxWidth: '300px'
                        }}
                    >
                        <option value="">-- Start New / Live Analysis --</option>
                        {matchList && matchList.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.homeTeam} vs {m.awayTeam} ({m.date})
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={loadMatchList}
                        style={{ background: 'none', border: 'none', color: '#b0b0b0', cursor: 'pointer', padding: '4px' }}
                        title="Reload Match List"
                    >
                        <RotateCcw size={16} />
                    </button>
                    <span style={{ fontSize: '0.7rem', color: '#666', minWidth: '60px' }}>
                        {matchList ? matchList.length : 0} matches
                    </span>
                </div>

                <button
                    onClick={() => setIsSyncing(!isSyncing)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        backgroundColor: isSyncing ? '#03dac6' : '#2d2d2d',
                        color: isSyncing ? 'black' : '#b0b0b0',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                    title="Toggle Cloud Sync"
                >
                    {isSyncing ? <Cloud size={18} /> : <CloudOff size={18} />}
                    {isSyncing ? 'Sync ON' : 'Sync OFF'}
                </button>
            </div>



            <h2 style={{ color: '#bb86fc', fontSize: '1.2rem', marginBottom: '10px' }}>Player Analysis</h2>

            {/* Squad Selector */}
            <div style={{ marginBottom: '10px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                    value={selectedSquadId || ''}
                    onChange={handleSquadChange}
                    style={{
                        flex: 1,
                        minWidth: '180px',
                        padding: '6px',
                        backgroundColor: '#2d2d2d',
                        border: '1px solid #444',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '0.85rem'
                    }}
                >
                    <option value="">Select a squad...</option>
                    {squads.map(squad => (
                        <option key={squad.id} value={squad.id}>
                            {squad.name} ({squad.players.length})
                        </option>
                    ))}
                </select>
                {selectedSquad && (
                    <>
                        <button
                            onClick={() => setShowPlayerSelector(true)}
                            style={{
                                backgroundColor: '#4caf50',
                                color: 'black',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.8rem'
                            }}
                        >
                            <UserPlus size={14} />
                            Add
                        </button>
                        {selectedPlayers.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                    onClick={handleResetSquad}
                                    style={{
                                        backgroundColor: '#cf6679',
                                        color: 'black',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    <RotateCcw size={14} />
                                    Reset
                                </button>
                                <button onClick={handleExportCSV} style={{ backgroundColor: '#03dac6', color: 'black', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                                    <Download size={14} /> Export
                                </button>
                                <label style={{ backgroundColor: '#bb86fc', color: 'black', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                    <Upload size={14} /> Import
                                    <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} />
                                </label>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Player Selector Modal */}
            {
                showPlayerSelector && selectedSquad && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: '#1e1e1e',
                            padding: '20px',
                            borderRadius: '12px',
                            width: '90%',
                            maxWidth: '400px',
                            maxHeight: '70vh',
                            overflowY: 'auto'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ color: '#bb86fc', margin: 0, fontSize: '1.1rem' }}>Add Player</h3>
                                <button onClick={() => setShowPlayerSelector(false)} style={{ background: 'none', color: '#b0b0b0' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            {availablePlayers.length === 0 ? (
                                <p style={{ color: '#b0b0b0', textAlign: 'center', padding: '20px' }}>
                                    All players have been added
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {availablePlayers.map(player => (
                                        <button
                                            key={player.id}
                                            onClick={() => addPlayer(player.id)}
                                            style={{
                                                backgroundColor: '#2d2d2d',
                                                border: '1px solid #444',
                                                borderRadius: '6px',
                                                padding: '10px',
                                                color: '#fff',
                                                textAlign: 'left',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div style={{ fontWeight: 'bold' }}>{player.name}</div>
                                            {player.positions.length > 0 && (
                                                <div style={{ fontSize: '0.75rem', color: '#b0b0b0', marginTop: '2px' }}>
                                                    {player.positions.join(', ')}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* No Squad Selected */}
            {
                !selectedSquad && (
                    <div style={{
                        textAlign: 'center',
                        padding: '30px 15px',
                        color: '#b0b0b0',
                        backgroundColor: '#1e1e1e',
                        borderRadius: '6px'
                    }}>
                        <p style={{ fontSize: '0.9rem', margin: 0 }}>Select a squad to begin</p>
                    </div>
                )
            }

            {/* No Players Selected */}
            {
                selectedSquad && selectedPlayers.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '30px 15px',
                        color: '#b0b0b0',
                        backgroundColor: '#1e1e1e',
                        borderRadius: '6px'
                    }}>
                        <p style={{ fontSize: '0.9rem', margin: 0 }}>Click "Add" to start tracking</p>
                    </div>
                )
            }

            {/* Matrix Table Layout */}

            {/* Fallback for Historical Data without Squad Selection */}
            {
                !selectedSquad && Object.keys(playerStats).length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ padding: '15px', backgroundColor: '#e65100', color: 'white', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold' }}>
                            WARNING: Historical Data Found ({Object.keys(playerStats).length} players), but no Squad selected.
                            <br />
                            Please select the Squad used in this match above to map Player Names.
                            <br />
                            Showing raw data below:
                        </div>

                        <div style={{ overflowX: 'auto', backgroundColor: '#1e1e1e', borderRadius: '8px', border: '1px solid #555', maxHeight: '600px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.9rem' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '10px', textAlign: 'left', color: '#bb86fc', borderBottom: '1px solid #444', position: 'sticky', top: 0, left: 0, background: '#1e1e1e', zIndex: 20 }}>Metric</th>
                                        {Object.keys(playerStats).map((pid, idx) => (
                                            <th key={pid} style={{ padding: '10px', color: '#fff', borderBottom: '1px solid #444', minWidth: '80px', position: 'sticky', top: 0, background: '#1e1e1e', zIndex: 10 }}>
                                                Player {idx + 1}
                                                <div style={{ fontSize: '0.6em', color: '#888', marginTop: '2px' }}>{pid.substring(0, 6)}...</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.map(metric => (
                                        <tr key={metric.id}>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #333', color: '#e0e0e0', position: 'sticky', left: 0, background: '#1e1e1e', zIndex: 5, borderRight: '1px solid #333' }}>{metric.label}</td>
                                            {Object.keys(playerStats).map(pid => (
                                                <td key={pid} style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #333', color: '#fff' }}>
                                                    {playerStats[pid]?.[metric.id] || 0}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {
                selectedSquad && activePlayers.length > 0 && (
                    <div style={{
                        overflowX: 'auto',
                        backgroundColor: '#1e1e1e',
                        borderRadius: '8px',
                        border: '1px solid #333',
                        maxHeight: 'calc(100vh - 200px)', // Limit height to enable vertical scrolling within table
                        overflowY: 'auto' // Enable vertical scrolling
                    }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'separate', // Required for sticky to work well with borders
                            borderSpacing: 0,
                            fontSize: '0.9rem'
                        }}>
                            <thead>
                                <tr>
                                    <th style={{
                                        textAlign: 'left',
                                        padding: '10px',
                                        borderBottom: '2px solid #444',
                                        borderRight: '1px solid #444',
                                        position: 'sticky',
                                        left: 0,
                                        top: 0,
                                        backgroundColor: '#1e1e1e',
                                        zIndex: 20,
                                        minWidth: '120px',
                                        color: '#bb86fc',
                                        boxShadow: '2px 2px 5px rgba(0,0,0,0.5)' // Shadow for depth
                                    }}>
                                        Metric
                                    </th>
                                    {activePlayers.map((player, index) => {
                                        const isCollapsed = collapsedPlayers.includes(player.id);
                                        return (
                                            <th key={player.id} style={{
                                                padding: '10px',
                                                borderBottom: '2px solid #444',
                                                borderRight: '1px solid #444',
                                                minWidth: isCollapsed ? '40px' : '100px',
                                                width: isCollapsed ? '40px' : 'auto',
                                                textAlign: 'center',
                                                position: 'sticky',
                                                top: 0,
                                                backgroundColor: '#1e1e1e',
                                                zIndex: 10,
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                                            }}>
                                                {!isCollapsed && (
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <div style={{
                                                            backgroundColor: '#4caf50',
                                                            color: 'black',
                                                            width: '24px',
                                                            height: '24px',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {player.number || '#'}
                                                        </div>
                                                        <div style={{ color: '#fff', fontWeight: 'bold' }}>
                                                            {player.name}
                                                        </div>
                                                        <div style={{ color: '#b0b0b0', fontSize: '0.8rem' }}>
                                                            {(player.positions && player.positions[0]) || '-'}
                                                        </div>
                                                        <button
                                                            onClick={() => alert(`Showing heatmap for ${player.name} (Coming Soon)`)} // Placeholder
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#bb86fc',
                                                                cursor: 'pointer',
                                                                fontSize: '0.7rem',
                                                                marginTop: '4px'
                                                            }}
                                                        >
                                                            🔥 Map
                                                        </button>
                                                    </div>
                                                )}
                                                {isCollapsed && (
                                                    <div style={{
                                                        writingMode: 'vertical-rl',
                                                        textOrientation: 'mixed',
                                                        transform: 'rotate(180deg)',
                                                        whiteSpace: 'nowrap',
                                                        color: '#ccc',
                                                        fontSize: '0.8rem',
                                                        marginTop: '10px',
                                                        marginBottom: '10px'
                                                    }}>
                                                        {player.name}
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => toggleColumn(player.id)}
                                                    title={isCollapsed ? "Expand" : "Minimize to Right"}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#888',
                                                        cursor: 'pointer',
                                                        marginTop: '5px',
                                                        padding: '2px'
                                                    }}
                                                >
                                                    {isCollapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                                                </button>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.map(metric => (
                                    <tr key={metric.id} style={{ borderBottom: '1px solid #333' }}>
                                        <td style={{
                                            padding: '10px',
                                            position: 'sticky',
                                            left: 0,
                                            backgroundColor: '#1e1e1e',
                                            zIndex: 5,
                                            borderRight: '1px solid #444',
                                            borderBottom: '1px solid #333',
                                            fontWeight: 'bold',
                                            color: '#e0e0e0',
                                            boxShadow: '2px 0 5px rgba(0,0,0,0.2)'
                                        }}>
                                            {metric.label}
                                        </td>
                                        {activePlayers.map(player => {
                                            const isCollapsed = collapsedPlayers.includes(player.id);
                                            // SMART DATA LOOKUP
                                            const dataId = idMapping[player.id] || player.id;
                                            const count = playerStats[dataId]?.[metric.id] || 0;

                                            if (isCollapsed) {
                                                return (
                                                    <td key={player.id} style={{
                                                        padding: '0',
                                                        borderBottom: '1px solid #333',
                                                        borderRight: '1px solid #333',
                                                        backgroundColor: '#252525',
                                                        minWidth: '40px',
                                                        width: '40px'
                                                    }}>
                                                    </td>
                                                );
                                            }

                                            return (
                                                <td key={player.id} style={{
                                                    padding: '10px',
                                                    textAlign: 'center',
                                                    borderBottom: '1px solid #333',
                                                    borderRight: '1px solid #333',
                                                    backgroundColor: metric.id === 'pressureEfficiency' ? '#2a2a2a' : 'transparent' // Highlight calc rows
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}>
                                                        <button
                                                            onClick={() => incrementStat(idMapping[player.id] || player.id, metric.id)}
                                                            style={{
                                                                backgroundColor: '#4caf50',
                                                                color: 'black',
                                                                width: '28px',
                                                                height: '28px',
                                                                borderRadius: '4px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                padding: 0,
                                                                border: 'none',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                        <span style={{
                                                            color: '#fff',
                                                            fontWeight: 'bold',
                                                            fontSize: '1.1rem',
                                                            minWidth: '24px'
                                                        }}>
                                                            {count}
                                                        </span>

                                                        <button
                                                            onClick={() => decrementStat(idMapping[player.id] || player.id, metric.id)}
                                                            style={{
                                                                backgroundColor: '#cf6679',
                                                                color: 'black',
                                                                width: '28px',
                                                                height: '28px',
                                                                borderRadius: '4px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                padding: 0,
                                                                border: 'none',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            }

            {/* PDF Download Button */}
            {/* PDF Download Button */}
            {
                selectedSquad && activePlayers.length > 0 && (
                    <div style={{
                        marginTop: '20px',
                        marginBottom: '20px',
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <button
                            onClick={generatePDF}
                            disabled={isGeneratingPdf}
                            style={{
                                backgroundColor: '#bb86fc',
                                color: 'black',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '1rem',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                                opacity: isGeneratingPdf ? 0.6 : 1,
                                cursor: isGeneratingPdf ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <Download size={20} />
                            {isGeneratingPdf ? 'Generating PDF...' : 'Download Player Analysis PDF'}
                        </button>
                    </div>
                )
            }
        </div >
    );
};

export default PlayerAnalysisView;
