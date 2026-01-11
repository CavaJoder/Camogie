import React from 'react';

const StatButton = ({ label, count, color = '#bb86fc', onIncrement, onDecrement, disabled = false }) => {
    return (
        <div style={{
            display: 'flex',
            height: '60px',
            backgroundColor: disabled ? '#121212' : '#1e1e1e', // Darker when disabled
            border: disabled ? '1px solid #222' : '1px solid #333',
            borderRadius: '6px',
            overflow: 'hidden',
            userSelect: 'none',
            touchAction: 'manipulation',
            opacity: disabled ? 0.5 : 1, // Visual cue
            cursor: disabled ? 'not-allowed' : 'default'
        }}>
            {/* Main Increment Area */}
            <button
                onClick={!disabled ? onIncrement : undefined}
                disabled={disabled}
                style={{
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    paddingLeft: '16px',
                    background: 'transparent',
                    color: 'white',
                    textAlign: 'left',
                    borderRight: disabled ? '1px solid #222' : '1px solid #333',
                    cursor: disabled ? 'not-allowed' : 'pointer'
                }}
            >
                <span style={{ fontSize: '0.9rem', marginBottom: '2px', color: disabled ? '#666' : '#fff' }}>{label}</span>
                <span style={{
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: disabled ? '#666' : color
                }}>
                    {count}
                </span>
            </button>

            {/* Decrement Area */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) onDecrement();
                }}
                disabled={disabled}
                style={{
                    width: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: disabled ? '#1a1a1a' : '#2d2d2d',
                    color: disabled ? '#444' : '#b0b0b0',
                    cursor: disabled ? 'not-allowed' : 'pointer'
                }}
            >
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>-</span>
            </button>
        </div>
    );
};

export default StatButton;
