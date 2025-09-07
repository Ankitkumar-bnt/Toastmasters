import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { User, FileText, LogOut, Bell } from 'lucide-react';
import { logout } from '../../api/AuthApi';

const AdminHeader = ({ onLogout }) => {
  const handleLogout = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('tm_current_user'));
      if (currentUser) {
        const userId = currentUser.userId || currentUser.id;
        // Send the full user object to satisfy backend DTO requirements (e.g., address not null)
        const userRequestDTO = currentUser;
        // Minimal debug
        console.log('Admin logout payload:', { userId, userRequestDTO });
        if (userId) {
          await logout(userRequestDTO, userId);
        }
      }
      if (onLogout) onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('tm_current_user');
      if (onLogout) onLogout();
    }
  };

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm border-bottom">
      <Container fluid>
        <Navbar.Brand href="#" className="fw-bold text-primary">
          Admin Dashboard
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link href="#" className="d-flex align-items-center me-3">
              <User size={18} className="me-2" />
              Admin User
            </Nav.Link>
            <Nav.Link href="#" className="d-flex align-items-center me-3">
              <FileText size={18} className="me-2" />
              Agenda
            </Nav.Link>
            <Nav.Link href="#" className="d-flex align-items-center me-3">
              <Bell size={18} className="me-2" />
              Notifications
            </Nav.Link>
            <Nav.Link 
              href="#" 
              className="d-flex align-items-center text-danger"
              onClick={handleLogout}
              style={{ cursor: 'pointer' }}
            >
              <LogOut size={18} className="me-2" />
              Logout
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminHeader; 