import React from 'react';
import { ClipboardList, LayoutDashboard, User, Settings, Target, Trophy, Users, BarChart3, PenTool } from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'record', label: 'Record', icon: ClipboardList },
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#121212',
            borderTop: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '10px 0',
            zIndex: 100,
            height: '60px' // Ensure fixed height
        }}>
            {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'none',
                            color: isActive ? '#bb86fc' : '#b0b0b0',
                            flex: 1
                        }}
                    >
                        <Icon size={24} />
                        <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default BottomNav;
