import React, { useState } from 'react';
import { useSquad } from '../context/SquadContext';
import { usePlayerAnalysis } from '../context/PlayerAnalysisContext';
import { Minus, Plus, RotateCcw, UserPlus, X, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const PlayerAnalysisView = () => {
    const { squads } = useSquad();
    const {
        selectedSquadId,
        setSelectedSquadId,
        selectedPlayers,
        setSelectedPlayers,
        metrics,
        getPlayerStats,
        incrementStat,
        decrementStat,
        resetSquadStats
    } = usePlayerAnalysis();

    const [showPlayerSelector, setShowPlayerSelector] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const selectedSquad = selectedSquadId ? squads.find(s => s.id === selectedSquadId) : null;

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

    // PDF Generation
    const generatePDF = async () => {
        if (!selectedSquad || activePlayers.length === 0) {
            alert('Please select a squad and add players to generate PDF');
            return;
        }

        setIsGeneratingPdf(true);

        try {
            // Create PDF content
            const pdfContent = document.createElement('div');
            pdfContent.style.padding = '20px';
            pdfContent.style.backgroundColor = 'white';
            pdfContent.style.color = 'black';
            pdfContent.style.fontFamily = 'Arial, sans-serif';

            // Title
            const title = document.createElement('h1');
            title.textContent = `Player Analysis - ${selectedSquad.name}`;
            title.style.textAlign = 'center';
            title.style.marginBottom = '30px';
            title.style.color = '#000';
            pdfContent.appendChild(title);

            // Player stats
            activePlayers.forEach((player, index) => {
                const stats = getPlayerStats(player.id);

                // Player section
                const playerSection = document.createElement('div');
                playerSection.style.marginBottom = '30px';
                playerSection.style.pageBreakInside = 'avoid';

                // Player header
                const playerHeader = document.createElement('h2');
                playerHeader.textContent = `${index + 1}. ${player.name}`;
                playerHeader.style.backgroundColor = '#4caf50';
                playerHeader.style.color = 'black';
                playerHeader.style.padding = '10px';
                playerHeader.style.marginBottom = '15px';
                playerHeader.style.borderRadius = '4px';
                playerSection.appendChild(playerHeader);

                // Stats table
                const table = document.createElement('table');
                table.style.width = '100%';
                table.style.borderCollapse = 'collapse';
                table.style.marginBottom = '20px';

                // Table header
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                headerRow.style.backgroundColor = '#f0f0f0';

                const metricHeader = document.createElement('th');
                metricHeader.textContent = 'Metric';
                metricHeader.style.padding = '10px';
                metricHeader.style.textAlign = 'left';
                metricHeader.style.border = '1px solid #ddd';
                headerRow.appendChild(metricHeader);

                const valueHeader = document.createElement('th');
                valueHeader.textContent = 'Count';
                valueHeader.style.padding = '10px';
                valueHeader.style.textAlign = 'center';
                valueHeader.style.border = '1px solid #ddd';
                valueHeader.style.width = '100px';
                headerRow.appendChild(valueHeader);

                thead.appendChild(headerRow);
                table.appendChild(thead);

                // Table body
                const tbody = document.createElement('tbody');
                metrics.forEach(metric => {
                    const row = document.createElement('tr');

                    const metricCell = document.createElement('td');
                    metricCell.textContent = metric.label;
                    metricCell.style.padding = '8px 10px';
                    metricCell.style.border = '1px solid #ddd';
                    row.appendChild(metricCell);

                    const valueCell = document.createElement('td');
                    valueCell.textContent = stats[metric.id] || 0;
                    valueCell.style.padding = '8px 10px';
                    valueCell.style.textAlign = 'center';
                    valueCell.style.border = '1px solid #ddd';
                    valueCell.style.fontWeight = 'bold';
                    valueCell.style.color = '#4caf50';
                    row.appendChild(valueCell);

                    tbody.appendChild(row);
                });
                table.appendChild(tbody);
                playerSection.appendChild(table);

                pdfContent.appendChild(playerSection);
            });

            // Generate PDF
            const opt = {
                margin: 10,
                filename: `${selectedSquad.name}_Player_Analysis.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(pdfContent).save();
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div style={{ padding: '10px', paddingBottom: '80px' }}>
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
                        )}
                    </>
                )}
            </div>

            {/* Player Selector Modal */}
            {showPlayerSelector && selectedSquad && (
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
            )}

            {/* No Squad Selected */}
            {!selectedSquad && (
                <div style={{
                    textAlign: 'center',
                    padding: '30px 15px',
                    color: '#b0b0b0',
                    backgroundColor: '#1e1e1e',
                    borderRadius: '6px'
                }}>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>Select a squad to begin</p>
                </div>
            )}

            {/* No Players Selected */}
            {selectedSquad && selectedPlayers.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '30px 15px',
                    color: '#b0b0b0',
                    backgroundColor: '#1e1e1e',
                    borderRadius: '6px'
                }}>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>Click "Add" to start tracking</p>
                </div>
            )}

            {/* Player List - ULTRA COMPACT */}
            {selectedSquad && activePlayers.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {activePlayers.map((player, index) => {
                        const stats = getPlayerStats(player.id);

                        return (
                            <div
                                key={player.id}
                                style={{
                                    backgroundColor: '#1e1e1e',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    padding: '3px 5px'
                                }}
                            >
                                {/* Player Header - ULTRA COMPACT */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    marginBottom: '3px',
                                    paddingBottom: '3px',
                                    borderBottom: '1px solid #333'
                                }}>
                                    <div style={{
                                        backgroundColor: '#4caf50',
                                        color: 'black',
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '0.7rem',
                                        flexShrink: 0
                                    }}>
                                        {index + 1}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {player.name}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removePlayer(player.id)}
                                        style={{
                                            backgroundColor: '#cf6679',
                                            color: 'black',
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '3px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            padding: 0
                                        }}
                                    >
                                        <X size={11} />
                                    </button>
                                </div>

                                {/* Metrics - ULTRA COMPACT */}
                                <div style={{
                                    display: 'flex',
                                    gap: '3px',
                                    overflowX: 'auto',
                                    paddingBottom: '3px'
                                }}>
                                    {metrics.map(metric => (
                                        <div
                                            key={metric.id}
                                            style={{
                                                minWidth: '110px',
                                                backgroundColor: '#2d2d2d',
                                                border: '1px solid #444',
                                                borderRadius: '3px',
                                                padding: '3px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            {/* Label and Count */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ color: '#b0b0b0', fontSize: '0.55rem', marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {metric.label}
                                                </div>
                                                <div style={{ color: '#4caf50', fontSize: '0.95rem', fontWeight: 'bold', lineHeight: 1 }}>
                                                    {stats[metric.id] || 0}
                                                </div>
                                            </div>

                                            {/* Buttons */}
                                            <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                                                <button
                                                    onClick={() => decrementStat(player.id, metric.id)}
                                                    style={{
                                                        backgroundColor: '#cf6679',
                                                        color: 'black',
                                                        width: '22px',
                                                        height: '22px',
                                                        borderRadius: '3px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: 0
                                                    }}
                                                >
                                                    <Minus size={11} />
                                                </button>
                                                <button
                                                    onClick={() => incrementStat(player.id, metric.id)}
                                                    style={{
                                                        backgroundColor: '#4caf50',
                                                        color: 'black',
                                                        width: '22px',
                                                        height: '22px',
                                                        borderRadius: '3px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: 0
                                                    }}
                                                >
                                                    <Plus size={11} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* PDF Download Button */}
            {/* PDF Download Button */}
            {selectedSquad && activePlayers.length > 0 && (
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
            )}
        </div>
    );
};

export default PlayerAnalysisView;
