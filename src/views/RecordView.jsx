import React from 'react';
import { useMatch } from '../context/MatchContext';
import { Play, Square, RotateCcw } from 'lucide-react';

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

    const Button = ({ label, count, color, onClick, fullWidth }) => (
        <button
            onClick={onClick}
            style={{
                backgroundColor: color,
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: fullWidth ? '100%' : 'auto',
                height: '100px',
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}
        >
            <span style={{ marginBottom: '8px', textAlign: 'center' }}>{label}</span>
            <span style={{ fontSize: '1.5rem' }}>{count}</span>
        </button>
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
                        onClick={() => updateStat('possessionsA', 1)}
                    />
                    <Button
                        label={`${matchInfo.awayTeam} Press`}
                        count={currentStats.pressuresB}
                        color={matchInfo.awayTeamColor}
                        onClick={() => updateStat('pressuresB', 1)}
                    />
                </div>

                {/* Row 2: Team B Poss | Team A Press */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Button
                        label={`${matchInfo.awayTeam} Poss`}
                        count={currentStats.possessionsB}
                        color={matchInfo.awayTeamColor}
                        onClick={() => updateStat('possessionsB', 1)}
                    />
                    <Button
                        label={`${matchInfo.homeTeam} Press`}
                        count={currentStats.pressuresA}
                        color={matchInfo.homeTeamColor}
                        onClick={() => updateStat('pressuresA', 1)}
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
                        onClick={() => updateStat('rucksTotal', 1)}
                    />
                </div>

                {/* Team A Won | Team B Won */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Button
                        label={`${matchInfo.homeTeam} Won`}
                        count={currentStats.rucksWonA}
                        color={matchInfo.homeTeamColor}
                        onClick={() => updateStat('rucksWonA', 1)}
                    />
                    <Button
                        label={`${matchInfo.awayTeam} Won`}
                        count={currentStats.rucksWonB}
                        color={matchInfo.awayTeamColor}
                        onClick={() => updateStat('rucksWonB', 1)}
                    />
                </div>
            </div>

        </div>
    );
};

export default RecordView;
