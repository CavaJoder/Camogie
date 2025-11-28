import React from 'react';

const StatButton = ({ label, count, color = '#bb86fc', onIncrement, onDecrement }) => {
    return (
        <div style={{
            display: 'flex',
            height: '60px',
            backgroundColor: '#1e1e1e',
            border: '1px solid #333',
            borderRadius: '6px',
            overflow: 'hidden',
            userSelect: 'none',
            touchAction: 'manipulation' // Improves touch response
        }}>
            {/* Main Increment Area */}
            <button
                onClick={onIncrement}
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
                    borderRight: '1px solid #333'
                }}
                className="active:bg-gray-800" // Tailwind-like active state if configured, or use CSS
            >
                <span style={{ fontSize: '0.9rem', marginBottom: '2px' }}>{label}</span>
                <span style={{
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: color
                }}>
                    {count}
                </span>
            </button>

            {/* Decrement Area */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDecrement();
                }}
                style={{
                    width: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#2d2d2d', // Slightly lighter for differentiation
                    color: '#b0b0b0',
                    cursor: 'pointer'
                }}
            >
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>-</span>
            </button>
        </div>
    );
};

export default StatButton;
