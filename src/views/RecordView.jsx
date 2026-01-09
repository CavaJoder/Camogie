import React, { useState, useMemo } from 'react';
import { useMatch } from '../context/MatchContext';
import { Play, Square, RotateCcw, Minus, Flag, Save } from 'lucide-react';

const SummaryModal = ({ title, statsA, statsB, teamA, teamB, colorA, colorB, onClose, onFinish, isFullTime, quarterlyStats, quartersDetails }) => {
    const calcPercentage = (val, total) => total > 0 ? Math.round((val / total) * 100) : 0;

    const totalPossession = statsA.possessions + statsB.possessions;
    const possA = calcPercentage(statsA.possessions, totalPossession);
    const possB = calcPercentage(statsB.possessions, totalPossession);

    const totalRucksWon = statsA.rucksWon + statsB.rucksWon;
    const rucksA = calcPercentage(statsA.rucksWon, totalRucksWon);
    const rucksB = calcPercentage(statsB.rucksWon, totalRucksWon);

    const totalPressures = statsA.pressures + statsB.pressures;
    const pressA = calcPercentage(statsA.pressures, totalPressures);
    const pressB = calcPercentage(statsB.pressures, totalPressures);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{ backgroundColor: '#1e1e1e', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px', border: '1px solid #333' }}>
                <h2 style={{ textAlign: 'center', color: '#fff', marginBottom: '24px' }}>{title}</h2>

                {/* Possession Bar */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b0b0b0', marginBottom: '8px', fontSize: '0.9rem' }}>
                        <span>{teamA}</span>
                        <span>Possessions</span>
                        <span>{teamB}</span>
                    </div>
                    <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${possA}%`, backgroundColor: colorA }}></div>
                        <div style={{ width: `${possB}%`, backgroundColor: colorB }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontWeight: 'bold' }}>
                        <span style={{ color: colorA }}>{statsA.possessions} ({possA}%)</span>
                        <span style={{ color: colorB }}>{statsB.possessions} ({possB}%)</span>
                    </div>
                </div>

                {/* Pressures Bar */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b0b0b0', marginBottom: '8px', fontSize: '0.9rem' }}>
                        <span>{teamA}</span>
                        <span>Pressures</span>
                        <span>{teamB}</span>
                    </div>
                    <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${pressA}%`, backgroundColor: colorA }}></div>
                        <div style={{ width: `${pressB}%`, backgroundColor: colorB }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontWeight: 'bold' }}>
                        <span style={{ color: colorA }}>{statsA.pressures} ({pressA}%)</span>
                        <span style={{ color: colorB }}>{statsB.pressures} ({pressB}%)</span>
                    </div>
                </div>

                {/* Pressure Efficiency (Pressures / Opp Possessions) */}
                <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#333', borderRadius: '8px' }}>
                    <div style={{ textAlign: 'center', color: '#b0b0b0', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                        Pressure Efficiency
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colorA }}>
                                {calcPercentage(statsA.pressures, statsB.possessions)}%
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#b0b0b0' }}>{teamA}</div>
                        </div>
                        <div style={{ color: '#666', fontSize: '0.8rem' }}>vs</div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colorB }}>
                                {calcPercentage(statsB.pressures, statsA.possessions)}%
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#b0b0b0' }}>{teamB}</div>
                        </div>
                    </div>
                </div>

                {/* Rucks Won Bar */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b0b0b0', marginBottom: '8px', fontSize: '0.9rem' }}>
                        <span>{teamA}</span>
                        <span>Rucks Won</span>
                        <span>{teamB}</span>
                    </div>
                    <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${rucksA}%`, backgroundColor: colorA }}></div>
                        <div style={{ width: `${rucksB}%`, backgroundColor: colorB }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontWeight: 'bold' }}>
                        <span style={{ color: colorA }}>{statsA.rucksWon} ({rucksA}%)</span>
                        <span style={{ color: colorB }}>{statsB.rucksWon} ({rucksB}%)</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '16px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                        CLOSE
                    </button>
                    {isFullTime && (
                        <button onClick={onFinish} style={{ flex: 1, padding: '16px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                            FINISH MATCH
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const RecordView = () => {
    const {
        matchNumber,
        timer,
        currentStats,
        matchInfo,
        currentQuarter,
        quarterlyStats,
        matchType,
        setMatchType,
        startMatch,
        endQuarter,
        pauseMatch,
        finishMatch,
        resetCurrentStats,
        updateStat
    } = useMatch();

    const [showSummary, setShowSummary] = useState(true);

    const formatTime = (min, sec) => {
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    // Helper to sum stats across specified quarters
    const getAggregateStats = (quartersToSum) => {
        const result = {
            possessionsA: 0, possessionsB: 0,
            rucksWonA: 0, rucksWonB: 0,
            pressuresA: 0, pressuresB: 0
        };

        quartersToSum.forEach(q => {
            const stats = quarterlyStats[q] || {};
            result.possessionsA += (stats.possessionsA || 0);
            result.possessionsB += (stats.possessionsB || 0);
            result.rucksWonA += (stats.rucksWonA || 0);
            result.rucksWonB += (stats.rucksWonB || 0);
            result.pressuresA += (stats.pressuresA || 0);
            result.pressuresB += (stats.pressuresB || 0);
        });
        return result;
    };

    // Determine if we should show a summary
    const summaryData = useMemo(() => {
        if (!showSummary || timer.isRunning) return null;

        // If in Training Mode, we don't show quarterly summary popups automatically 
        // because there are no quarters. The user finishes manually.
        if (matchType === 'Training') return null;

        // Match Mode Logic ...
        // ... (existing logic)
        let title = '';
        let quartersDetails = [];
        let isFullTime = false;

        if (currentQuarter === 2 && quarterlyStats[1]) {
            title = 'QUARTER 1 SUMMARY';
            quartersDetails = [1];
        } else if (currentQuarter === 3 && quarterlyStats[2]) {
            title = 'HALF TIME SUMMARY';
            quartersDetails = [1, 2];
        } else if (currentQuarter === 4) {
            if (quarterlyStats[4]) {
                title = 'FULL TIME SUMMARY';
                quartersDetails = [1, 2, 3, 4];
                isFullTime = true;
            } else if (quarterlyStats[3]) {
                title = 'QUARTER 3 SUMMARY';
                quartersDetails = [1, 2, 3];
            }
        }

        if (!title) return null;

        const aggStats = getAggregateStats(quartersDetails);

        return {
            title,
            statsA: {
                possessions: aggStats.possessionsA,
                rucksWon: aggStats.rucksWonA,
                pressures: aggStats.pressuresA
            },
            statsB: {
                possessions: aggStats.possessionsB,
                rucksWon: aggStats.rucksWonB,
                pressures: aggStats.pressuresB
            },
            isFullTime,
            quarterlyStats,
            quartersDetails
        };

    }, [showSummary, timer.isRunning, currentQuarter, quarterlyStats, matchType]);


    const handleCloseSummary = () => {
        setShowSummary(false);
    };

    const handleFinishMatch = () => {
        if (window.confirm(matchType === 'Training' ? 'Stop and Save Training Session?' : 'Finish and Save Match?')) {
            finishMatch();
            setShowSummary(false);
        }
    };

    // Reset showSummary when quarter changes
    React.useEffect(() => {
        setShowSummary(true);
    }, [currentQuarter, quarterlyStats]);


    const Button = ({ label, count, color, onIncrement, onDecrement, fullWidth }) => (
        // ... (existing Button component code is fine, no changes needed inside)
        <div style={{
            display: 'flex',
            width: fullWidth ? '100%' : 'auto',
            height: '100px',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}>
            {/* Increment Section (2/3 width) */}
            <button
                onClick={onIncrement}
                style={{
                    flex: 2,
                    backgroundColor: color,
                    color: '#000',
                    border: 'none',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    borderRight: '1px solid rgba(0,0,0,0.1)'
                }}
            >
                <span style={{ marginBottom: '4px', textAlign: 'center', fontSize: '0.9rem' }}>{label}</span>
                <span style={{ fontSize: '1.8rem' }}>{count}</span>
            </button>

            {/* Decrement Section (1/3 width) */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDecrement();
                }}
                style={{
                    flex: 1,
                    backgroundColor: color,
                    filter: 'brightness(0.9)',
                    color: '#000',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                }}
            >
                <Minus size={24} strokeWidth={3} />
            </button>
        </div>
    );

    return (
        <div style={{ padding: '16px', paddingBottom: '80px', maxWidth: '600px', margin: '0 auto' }}>

            {/* Header: Match #, Timer, Quarter/Training */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#1e1e1e',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '24px',
                border: '1px solid #333'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#b0b0b0' }}>Match #{matchNumber}</span>
                    <span style={{ color: '#03dac6', fontWeight: 'bold' }}>
                        {matchType === 'Training' ? 'TRAINING' : `Q${currentQuarter}`}
                    </span>
                </div>

                {/* Match Type Selector (Only if not running and at start) */}
                {!timer.isRunning && timer.minutes === 0 && timer.seconds === 0 && currentQuarter === 1 && (
                    <div style={{ display: 'flex', gap: '8px', backgroundColor: '#333', padding: '4px', borderRadius: '8px' }}>
                        <button
                            onClick={() => setMatchType('Match')}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                fontWeight: 'bold',
                                backgroundColor: matchType === 'Match' ? '#03dac6' : 'transparent',
                                color: matchType === 'Match' ? '#000' : '#888',
                                cursor: 'pointer'
                            }}
                        >
                            Match
                        </button>
                        <button
                            onClick={() => setMatchType('Training')}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                fontWeight: 'bold',
                                backgroundColor: matchType === 'Training' ? '#03dac6' : 'transparent',
                                color: matchType === 'Training' ? '#000' : '#888',
                                cursor: 'pointer'
                            }}
                        >
                            Training
                        </button>
                    </div>
                )}

                <div style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'monospace', color: timer.isRunning ? '#03dac6' : '#fff' }}>
                    {formatTime(timer.minutes, timer.seconds)}
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                {!timer.isRunning ? (
                    <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                        <button onClick={startMatch} style={{ flex: 1, backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '16px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <Play size={20} /> {matchType === 'Training' ? 'START TRAINING' : `START Q${currentQuarter}`}
                        </button>
                        {/* Show Finish option appropriately */}
                        {((matchType === 'Match' && currentQuarter === 4 && quarterlyStats[4]) || (matchType === 'Training' && (timer.minutes > 0 || timer.seconds > 0))) && (
                            <button onClick={handleFinishMatch} style={{ flex: 1, backgroundColor: '#bb86fc', color: '#000', border: 'none', padding: '16px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Save size={20} /> SAVE
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                        <button onClick={pauseMatch} style={{ flex: 1, backgroundColor: '#cf6679', color: 'white', border: 'none', padding: '16px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <Square size={20} /> PAUSE
                        </button>
                        {matchType === 'Match' ? (
                            <button onClick={endQuarter} style={{ flex: 1, backgroundColor: '#bb86fc', color: '#000', border: 'none', padding: '16px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Flag size={20} /> END Q{currentQuarter}
                            </button>
                        ) : (
                            <button onClick={handleFinishMatch} style={{ flex: 1, backgroundColor: '#bb86fc', color: '#000', border: 'none', padding: '16px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Save size={20} /> FINISH
                            </button>
                        )}
                    </div>
                )}

                {!timer.isRunning && (
                    <button onClick={resetCurrentStats} style={{ backgroundColor: '#333', color: '#b0b0b0', border: 'none', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RotateCcw size={20} />
                    </button>
                )}
            </div>

            {/* Summary Modal */}
            {summaryData && (
                <SummaryModal
                    title={summaryData.title}
                    statsA={summaryData.statsA}
                    statsB={summaryData.statsB}
                    teamA={matchInfo.homeTeam}
                    teamB={matchInfo.awayTeam}
                    colorA={matchInfo.homeTeamColor}
                    colorB={matchInfo.awayTeamColor}
                    onClose={handleCloseSummary}
                    onFinish={handleFinishMatch}
                    isFullTime={summaryData.isFullTime}
                    quarterlyStats={summaryData.quarterlyStats}
                    quartersDetails={summaryData.quartersDetails}
                />
            )}

            {/* Possession & Pressure & Turnovers Section */}
            <div style={{ marginBottom: '32px' }}>
                <h3 style={{ color: '#b0b0b0', marginBottom: '16px', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>Possession, Pressure & Turnovers</h3>

                {/* Row 1: Team A Poss | Team B Press | Team B Turnovers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    <Button
                        label={`${matchInfo.homeTeam} Poss`}
                        count={currentStats.possessionsA}
                        color={matchInfo.homeTeamColor}
                        onIncrement={() => updateStat('possessionsA', 1)}
                        onDecrement={() => updateStat('possessionsA', -1)}
                    />
                    <Button
                        label={`${matchInfo.awayTeam} Press`}
                        count={currentStats.pressuresB}
                        color={matchInfo.awayTeamColor}
                        onIncrement={() => updateStat('pressuresB', 1)}
                        onDecrement={() => updateStat('pressuresB', -1)}
                    />
                    <Button
                        label={`${matchInfo.awayTeam} Turn`}
                        count={currentStats.turnoversB}
                        color={matchInfo.awayTeamColor}
                        onIncrement={() => updateStat('turnoversB', 1)}
                        onDecrement={() => updateStat('turnoversB', -1)}
                    />
                </div>

                {/* Row 2: Team B Poss | Team A Press | Team A Turnovers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <Button
                        label={`${matchInfo.awayTeam} Poss`}
                        count={currentStats.possessionsB}
                        color={matchInfo.awayTeamColor}
                        onIncrement={() => updateStat('possessionsB', 1)}
                        onDecrement={() => updateStat('possessionsB', -1)}
                    />
                    <Button
                        label={`${matchInfo.homeTeam} Press`}
                        count={currentStats.pressuresA}
                        color={matchInfo.homeTeamColor}
                        onIncrement={() => updateStat('pressuresA', 1)}
                        onDecrement={() => updateStat('pressuresA', -1)}
                    />
                    <Button
                        label={`${matchInfo.homeTeam} Turn`}
                        count={currentStats.turnoversA}
                        color={matchInfo.homeTeamColor}
                        onIncrement={() => updateStat('turnoversA', 1)}
                        onDecrement={() => updateStat('turnoversA', -1)}
                    />
                </div>
            </div>

            {/* Rucks Section */}
            <div>
                <h3 style={{ color: '#b0b0b0', marginBottom: '16px', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>Rucks</h3>

                {/* Total Rucks (Centered) */}
                <div style={{ marginBottom: '12px' }}>
                    <Button
                        label="Total Rucks"
                        count={currentStats.rucksTotal}
                        color="#e0b0ff"
                        fullWidth
                        onIncrement={() => updateStat('rucksTotal', 1)}
                        onDecrement={() => updateStat('rucksTotal', -1)}
                    />
                </div>

                {/* Team A Won | Team B Won */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Button
                        label={`${matchInfo.homeTeam} Won`}
                        count={currentStats.rucksWonA}
                        color={matchInfo.homeTeamColor}
                        onIncrement={() => updateStat('rucksWonA', 1)}
                        onDecrement={() => updateStat('rucksWonA', -1)}
                    />
                    <Button
                        label={`${matchInfo.awayTeam} Won`}
                        count={currentStats.rucksWonB}
                        color={matchInfo.awayTeamColor}
                        onIncrement={() => updateStat('rucksWonB', 1)}
                        onDecrement={() => updateStat('rucksWonB', -1)}
                    />
                </div>
            </div>

        </div>
    );
};

export default RecordView;
