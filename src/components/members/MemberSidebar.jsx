import React from 'react';
import { Nav } from 'react-bootstrap';
import { Calendar, Star, Trophy, Award } from 'lucide-react';

const MemberSidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'view-meeting', icon: Calendar, label: 'View Meetings' },
    { id: 'preferred-role', icon: Star, label: 'Preferred Roles' },
    { id: 'meeting-winner', icon: Trophy, label: 'Meeting Winners' },
    { id: 'gem-month', icon: Award, label: 'Gem of Month' },
  ];

  return (
    <div
      className="bg-dark text-white p-3 position-fixed"
      style={{
        width: '250px',
        left: 0,
        top: '56px', // align below navbar
        overflowY: 'auto',
        zIndex: 1020,
        height: 'calc(100vh - 56px)',
        boxShadow: '0 0 12px rgba(0,0,0,0.15)'
      }}
    >
      <div className="mb-3">
        <h6 className="text-center py-2 border-bottom border-secondary mb-0">Member Menu</h6>
      </div>
      <Nav className="flex-column">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Nav.Link
              key={item.id}
              href="#"
              className={`text-white d-flex align-items-center py-3 px-2 rounded mb-1 ${
                isActive ? 'bg-primary' : ''
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(item.id);
              }}
              style={{ transition: 'all 0.3s ease', textDecoration: 'none' }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#495057';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
           >
              <Icon size={18} className="me-3" />
              {item.label}
            </Nav.Link>
          );
        })}
      </Nav>
    </div>
  );
};

export default MemberSidebar;
