import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { User, Settings, LogOut } from 'lucide-react';

const AdminHeader = () => {
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
              <Settings size={18} className="me-2" />
              Settings
            </Nav.Link>
            <Nav.Link href="#" className="d-flex align-items-center text-danger">
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