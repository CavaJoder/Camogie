import React, { useState } from 'react';
import Papa from 'papaparse';
import { useSquad } from '../context/SquadContext';
import { Plus, Edit2, Trash2, X, Upload, Users as UsersIcon, Download } from 'lucide-react';

const SquadsView = () => {
    const {
        squads,
        selectedSquadId,
        setSelectedSquadId,
        validPositions,
        createSquad,
        updateSquad,
        deleteSquad,
        getSquad,
        addPlayer,
        updatePlayer,
        deletePlayer
    } = useSquad();

    const [showSquadForm, setShowSquadForm] = useState(false);
    const [showPlayerForm, setShowPlayerForm] = useState(false);
    const [editingSquad, setEditingSquad] = useState(null);
    const [editingPlayer, setEditingPlayer] = useState(null);

    // Squad form state
    const [squadName, setSquadName] = useState('');
    const [squadLogo, setSquadLogo] = useState(null);
    const [squadColor, setSquadColor] = useState('#bb86fc');

    // Player form state
    const [playerName, setPlayerName] = useState('');
    const [playerNumber, setPlayerNumber] = useState('');
    const [playerClub, setPlayerClub] = useState('');
    const [playerPositions, setPlayerPositions] = useState([]);

    const selectedSquad = selectedSquadId ? getSquad(selectedSquadId) : null;

    // Handle logo upload
    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSquadLogo(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Squad operations
    const handleCreateSquad = () => {
        if (!squadName.trim()) {
            alert('Please enter a squad name');
            return;
        }
        const newSquadId = createSquad(squadName, squadLogo, squadColor);
        setSquadName('');
        setSquadLogo(null);
        setSquadColor('#bb86fc');
        setShowSquadForm(false);
        setSelectedSquadId(newSquadId);
    };

    const handleUpdateSquad = () => {
        if (!squadName.trim()) {
            alert('Please enter a squad name');
            return;
        }
        updateSquad(editingSquad, { name: squadName, logo: squadLogo, themeColor: squadColor });
        setSquadName('');
        setSquadLogo(null);
        setSquadColor('#bb86fc');
        setEditingSquad(null);
        setShowSquadForm(false);
    };

    const handleDeleteSquad = (squadId) => {
        if (window.confirm('Are you sure you want to delete this squad and all its players?')) {
            deleteSquad(squadId);
        }
    };

    const openEditSquad = (squad) => {
        setEditingSquad(squad.id);
        setSquadName(squad.name);
        setSquadLogo(squad.logo);
        setSquadColor(squad.themeColor || '#bb86fc');
        setShowSquadForm(true);
    };

    // Player operations
    const handleSavePlayer = () => {
        if (!playerName.trim()) {
            alert('Please enter a player name');
            return;
        }

        const playerData = {
            name: playerName,
            number: playerNumber ? parseInt(playerNumber) : null,
            club: playerClub,
            positions: playerPositions
        };

        if (editingPlayer) {
            updatePlayer(selectedSquadId, editingPlayer, playerData);
        } else {
            addPlayer(selectedSquadId, playerData);
        }

        resetPlayerForm();
    };

    const handleDeletePlayer = (playerId) => {
        if (window.confirm('Are you sure you want to remove this player?')) {
            deletePlayer(selectedSquadId, playerId);
        }
    };

    const openEditPlayer = (player) => {
        setEditingPlayer(player.id);
        setPlayerName(player.name);
        setPlayerNumber(player.number ? player.number.toString() : '');
        setPlayerClub(player.club || '');
        setPlayerPositions(player.positions);
        setShowPlayerForm(true);
    };

    const resetPlayerForm = () => {
        setPlayerName('');
        setPlayerNumber('');
        setPlayerClub('');
        setPlayerPositions([]);
        setEditingPlayer(null);
        setShowPlayerForm(false);
    };

    const resetSquadForm = () => {
        setSquadName('');
        setSquadLogo(null);
        setSquadColor('#bb86fc');
        setEditingSquad(null);
        setShowSquadForm(false);
    };

    const togglePosition = (position) => {
        setPlayerPositions(prev =>
            prev.includes(position)
                ? prev.filter(p => p !== position)
                : [...prev, position]
        );
    };

    // Render squad list
    if (!selectedSquadId) {
        return (
            <div style={{ padding: '20px', paddingBottom: '80px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ color: '#bb86fc', fontSize: '1.5rem', margin: 0 }}>Squad Management</h2>
                    <button
                        onClick={() => setShowSquadForm(true)}
                        style={{
                            backgroundColor: '#4caf50',
                            color: 'black',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Plus size={20} />
                        Create Squad
                    </button>
                </div>

                {/* Squad Form Modal */}
                {showSquadForm && (
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
                            padding: '30px',
                            borderRadius: '12px',
                            width: '90%',
                            maxWidth: '500px',
                            maxHeight: '80vh',
                            overflowY: 'auto'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ color: '#bb86fc', margin: 0 }}>
                                    {editingSquad ? 'Edit Squad' : 'Create New Squad'}
                                </h3>
                                <button onClick={resetSquadForm} style={{ background: 'none', color: '#b0b0b0' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '8px' }}>Squad Name</label>
                                <input
                                    type="text"
                                    value={squadName}
                                    onChange={(e) => setSquadName(e.target.value)}
                                    placeholder="Enter squad name"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: '#2d2d2d',
                                        border: '1px solid #444',
                                        borderRadius: '4px',
                                        color: '#fff'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '8px' }}>Squad Logo (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    style={{ display: 'none' }}
                                    id="logo-upload"
                                />
                                <label
                                    htmlFor="logo-upload"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 20px',
                                        backgroundColor: '#2d2d2d',
                                        border: '1px solid #444',
                                        borderRadius: '4px',
                                        color: '#b0b0b0',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Upload size={20} />
                                    Upload Logo
                                </label>
                                {squadLogo && (
                                    <div style={{ marginTop: '10px' }}>
                                        <img src={squadLogo} alt="Squad logo preview" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px' }} />
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '8px' }}>Theme Color</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="color"
                                        value={squadColor}
                                        onChange={(e) => setSquadColor(e.target.value)}
                                        style={{ border: 'none', width: '40px', height: '40px', cursor: 'pointer', backgroundColor: 'transparent' }}
                                    />
                                    <span style={{ color: '#fff' }}>{squadColor}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={editingSquad ? handleUpdateSquad : handleCreateSquad}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#4caf50',
                                        color: 'black',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {editingSquad ? 'Update Squad' : 'Create Squad'}
                                </button>
                                <button
                                    onClick={resetSquadForm}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#333',
                                        color: '#fff',
                                        padding: '12px',
                                        borderRadius: '8px'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Squad List */}
                {squads.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#b0b0b0'
                    }}>
                        <UsersIcon size={64} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
                        <p style={{ fontSize: '1.2rem' }}>No squads created yet</p>
                        <p>Click "Create Squad" to get started</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                        {squads.map(squad => (
                            <div
                                key={squad.id}
                                style={{
                                    backgroundColor: '#1e1e1e',
                                    border: '1px solid #333',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                }}
                                onClick={() => setSelectedSquadId(squad.id)}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {squad.logo && (
                                    <img
                                        src={squad.logo}
                                        alt={squad.name}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            objectFit: 'contain',
                                            margin: '0 auto 15px',
                                            display: 'block',
                                            borderRadius: '8px'
                                        }}
                                    />
                                )}
                                <h3 style={{ color: '#bb86fc', textAlign: 'center', marginBottom: '10px' }}>{squad.name}</h3>
                                <p style={{ color: '#b0b0b0', textAlign: 'center', marginBottom: '15px' }}>
                                    {squad.players.length} player{squad.players.length !== 1 ? 's' : ''}
                                </p>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditSquad(squad);
                                        }}
                                        style={{
                                            backgroundColor: '#bb86fc',
                                            color: 'black',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <Edit2 size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSquad(squad.id);
                                        }}
                                        style={{
                                            backgroundColor: '#cf6679',
                                            color: 'black',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // CSV Import
    const handleCsvImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: h => h.trim(),
            complete: (results) => {
                let addedCount = 0;
                results.data.forEach(row => {
                    // Try to match keys (case insensitive fallback via ||)
                    const name = row.Name || row.name;
                    if (!name) return;

                    const club = row.Club || row.club || '';
                    const number = parseInt(row.Number || row.number) || null;

                    let positions = [];
                    const rawPos = row.Positions || row.positions || row.Position || row.position || '';
                    if (rawPos) {
                        // Split by common delimiters: , ; | /
                        // Removed strict 'validPositions' check to allow flexibility
                        positions = rawPos.split(/[,;|/]+/).map(p => p.trim()).filter(p => p.length > 0);
                    }

                    const playerData = {
                        name: name,
                        number: number,
                        club: club,
                        positions: positions
                    };

                    addPlayer(selectedSquadId, playerData);
                    addedCount++;
                });

                if (results.data.length > 0 && addedCount === 0) {
                    // Fallback for headerless CSV?
                    // Or alert user?
                    // Let's keep it simple for now, if headers missing, it fails.
                    alert("Import finished. Ensure CSV has headers: Name, Number, Club, Positions");
                } else {
                    alert(`Successfully imported ${addedCount} players`);
                }
            },
            error: (err) => {
                console.error("CSV Error:", err);
                alert("Error parsing CSV file");
            }
        });

        // Reset file input
        e.target.value = '';
    };

    // CSV Export
    const handleCsvExport = () => {
        if (!selectedSquad || selectedSquad.players.length === 0) {
            alert("No players to export.");
            return;
        }

        const headers = ["Name", "Number", "Club", "Positions"];
        const rows = selectedSquad.players.map(p => [
            p.name,
            p.number || '',
            p.club || '',
            `"${p.positions.join(',')}"` // Quote to handle commas in CSV
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${selectedSquad.name.replace(/ /g, '_')}_Squad.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Render squad detail view with players
    return (
        <div style={{ padding: '20px', paddingBottom: '80px' }}>
            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => setSelectedSquadId(null)}
                    style={{
                        backgroundColor: '#333',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        marginBottom: '15px'
                    }}
                >
                    ← Back to Squads
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                    {selectedSquad.logo && (
                        <img
                            src={selectedSquad.logo}
                            alt={selectedSquad.name}
                            style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px' }}
                        />
                    )}
                    <div>
                        <h2 style={{ color: '#bb86fc', fontSize: '1.8rem', margin: 0 }}>{selectedSquad.name}</h2>
                        <p style={{ color: '#b0b0b0', margin: '5px 0 0 0' }}>
                            {selectedSquad.players.length} player{selectedSquad.players.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setShowPlayerForm(true)}
                        style={{
                            backgroundColor: '#4caf50',
                            color: 'black',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Plus size={20} />
                        Add Player
                    </button>

                    <input
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleCsvImport}
                        style={{ display: 'none' }}
                        id="csv-upload"
                    />
                    <label
                        htmlFor="csv-upload"
                        style={{
                            backgroundColor: '#bb86fc',
                            color: 'black',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <Upload size={20} />
                        Import CSV
                    </label>

                    <button
                        onClick={handleCsvExport}
                        style={{
                            backgroundColor: '#03dac6',
                            color: 'black',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <Download size={20} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Player Form Modal */}
            {showPlayerForm && (
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
                        padding: '30px',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ color: '#bb86fc', margin: 0 }}>
                                {editingPlayer ? 'Edit Player' : 'Add New Player'}
                            </h3>
                            <button onClick={resetPlayerForm} style={{ background: 'none', color: '#b0b0b0' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '8px' }}>Player Name</label>
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                placeholder="Enter player name"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#2d2d2d',
                                    border: '1px solid #444',
                                    borderRadius: '4px',
                                    color: '#fff'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '8px' }}>Club (Optional)</label>
                            <input
                                type="text"
                                value={playerClub}
                                onChange={(e) => setPlayerClub(e.target.value)}
                                placeholder="Enter club name"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#2d2d2d',
                                    border: '1px solid #444',
                                    borderRadius: '4px',
                                    color: '#fff'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', color: '#b0b0b0', marginBottom: '8px' }}>Positions (select multiple)</label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '8px',
                                maxHeight: '300px',
                                overflowY: 'auto',
                                padding: '10px',
                                backgroundColor: '#2d2d2d',
                                borderRadius: '4px'
                            }}>
                                {validPositions.map(position => (
                                    <button
                                        key={position}
                                        onClick={() => togglePosition(position)}
                                        style={{
                                            padding: '8px 12px',
                                            backgroundColor: playerPositions.includes(position) ? '#4caf50' : '#333',
                                            color: playerPositions.includes(position) ? 'black' : '#b0b0b0',
                                            border: '1px solid #444',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            textAlign: 'left'
                                        }}
                                    >
                                        {position}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={handleSavePlayer}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#4caf50',
                                    color: 'black',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {editingPlayer ? 'Update Player' : 'Add Player'}
                            </button>
                            <button
                                onClick={resetPlayerForm}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#333',
                                    color: '#fff',
                                    padding: '12px',
                                    borderRadius: '8px'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Player List */}
            {selectedSquad.players.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#b0b0b0',
                    backgroundColor: '#1e1e1e',
                    borderRadius: '12px',
                    marginTop: '20px'
                }}>
                    <p style={{ fontSize: '1.2rem' }}>No players added yet</p>
                    <p>Click "Add Player" to add players to this squad</p>
                </div>
            ) : (
                <div style={{ marginTop: '20px' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1.5fr 1.5fr auto',
                        gap: '10px',
                        padding: '12px',
                        backgroundColor: '#2d2d2d',
                        borderRadius: '8px 8px 0 0',
                        fontWeight: 'bold',
                        color: selectedSquad.themeColor || '#bb86fc'
                    }}>
                        <div>Name</div>
                        <div>Club</div>
                        <div>Positions</div>
                        <div>Actions</div>
                    </div>
                    {selectedSquad.players
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(player => (
                            <div
                                key={player.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1.5fr 1.5fr auto',
                                    gap: '10px',
                                    padding: '12px',
                                    backgroundColor: '#1e1e1e',
                                    borderBottom: '1px solid #333',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{ color: '#fff' }}>{player.name} <span style={{ fontSize: '0.8em', color: '#888' }}>({player.number || '-'})</span></div>
                                <div style={{ color: '#b0b0b0', fontSize: '0.85rem' }}>{player.club || '-'}</div>
                                <div style={{ color: '#b0b0b0', fontSize: '0.85rem' }}>
                                    {player.positions.length > 0 ? player.positions.join(', ') : 'No positions assigned'}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => openEditPlayer(player)}
                                        style={{
                                            backgroundColor: '#bb86fc',
                                            color: 'black',
                                            padding: '6px 12px',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDeletePlayer(player.id)}
                                        style={{
                                            backgroundColor: '#cf6679',
                                            color: 'black',
                                            padding: '6px 12px',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default SquadsView;
