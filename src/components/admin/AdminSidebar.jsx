import React from 'react';
import { Nav } from 'react-bootstrap';
import { Users, UserPlus, Calendar, Settings, Home, UserCheck } from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'members', icon: Users, label: 'View Members' },
    { id: 'add-member', icon: UserPlus, label: 'Add Member' },
    { id: 'assign-role', icon: UserCheck, label: 'Assign Roles' },
    { id: 'meetings', icon: Calendar, label: 'Meetings' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="bg-dark text-white min-vh-100 p-3" style={{ width: '250px', minWidth: '250px', flexShrink: 0 }}>
      <div className="mb-4">
        <h5 className="text-center py-3 border-bottom border-secondary">
          Member Management
        </h5>
      </div>
      <Nav className="flex-column">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Nav.Link
              key={item.id}
              href="#"
              className={`text-white d-flex align-items-center py-3 px-2 rounded mb-1 ${
                activeTab === item.id ? 'bg-primary' : 'hover-bg-secondary'
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(item.id);
              }}
              style={{
                transition: 'all 0.3s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.backgroundColor = '#495057';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
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

export default AdminSidebar; 