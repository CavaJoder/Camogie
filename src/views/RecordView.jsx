import React from 'react';
import { useMatch } from '../context/MatchContext';
import { Play, Square, RotateCcw, Minus } from 'lucide-react';

const RecordView = () => {
    const {
        matchNumber,
        timer,
        currentStats,
        matchInfo,
        startMatch,
        stopMatch,
        resetCurrentStats,
        updateStat
    } = useMatch();

    const formatTime = (min, sec) => {
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    const Button = ({ label, count, color, onIncrement, onDecrement, fullWidth }) => (
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

            {/* Header: Match # and Timer */}
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
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#b0b0b0' }}>
                    Match #{matchNumber}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'monospace', color: timer.isRunning ? '#03dac6' : '#fff' }}>
                    {formatTime(timer.minutes, timer.seconds)}
                </div>
            </div>

            {/* Controls: Start, Stop, Reset */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                {!timer.isRunning ? (
                    <button onClick={startMatch} style={{ flex: 1, backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '16px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Play size={20} /> START
                    </button>
                ) : (
                    <button onClick={stopMatch} style={{ flex: 1, backgroundColor: '#cf6679', color: 'white', border: 'none', padding: '16px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Square size={20} /> STOP
                    </button>
                )}
                <button onClick={resetCurrentStats} style={{ backgroundColor: '#333', color: '#b0b0b0', border: 'none', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RotateCcw size={20} />
                </button>
            </div>

            {/* Possession & Pressure Section */}
            <div style={{ marginBottom: '32px' }}>
                <h3 style={{ color: '#b0b0b0', marginBottom: '16px', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>Possession & Pressure</h3>

                {/* Row 1: Team A Poss | Team B Press */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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
                </div>

                {/* Row 2: Team B Poss | Team A Press */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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
                </div>

                {/* Row 3: Turnovers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Button
                        label={`${matchInfo.homeTeam} Turnovers`}
                        count={currentStats.turnoversA}
                        color={matchInfo.homeTeamColor}
                        onIncrement={() => updateStat('turnoversA', 1)}
                        onDecrement={() => updateStat('turnoversA', -1)}
                    />
                    <Button
                        label={`${matchInfo.awayTeam} Turnovers`}
                        count={currentStats.turnoversB}
                        color={matchInfo.awayTeamColor}
                        onIncrement={() => updateStat('turnoversB', 1)}
                        onDecrement={() => updateStat('turnoversB', -1)}
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
                        color="#ffffff"
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
