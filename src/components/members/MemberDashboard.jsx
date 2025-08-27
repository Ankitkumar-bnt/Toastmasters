import React, { useState } from 'react';
import { Container, Nav, Navbar, Card } from 'react-bootstrap';
import { Calendar, Star, User, LogOut, Bell } from 'lucide-react';
import { logout } from '../../api/AuthApi';
import ViewMeetings from './ViewMeetings';
import MeetingDetailsView from './MeetingDetailsView';
import PreferredRolesPage from './PreferredRolesPage';
import { getAllMeetings } from '../../api/MeetingApi';

function MemberDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('view-meeting');
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const handleLogout = async () => {
    try {
      const currentUserRaw = localStorage.getItem('tm_current_user');
      const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
      if (currentUser) {
        const userId = currentUser.userId || currentUser.id;
        const userRequestDTO = currentUser; // send full object (e.g., includes address)
        console.log('Member logout payload:', { userId, userRequestDTO });
        if (userId) {
          await logout(userRequestDTO, userId);
        }
      }
    } catch (e) {
      // ignore, we still clear local and redirect
    } finally {
      if (onLogout) onLogout();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'view-meeting':
        return (
          selectedMeeting ? (
            <MeetingDetailsView
              meeting={selectedMeeting}
              onBack={() => setSelectedMeeting(null)}
            />
          ) : (
            <ViewMeetings onOpenDetails={(m) => setSelectedMeeting(m)} />
          )
        );
      case 'preferred-role':
        return <PreferredRolesPage onMeetingClick={(meeting) => {
          setSelectedMeeting(meeting);
          setActiveTab('view-meeting');
        }} />;
      case 'profile':
        return (
          <Card className="shadow-sm p-4">
            <h4>Profile</h4>
            <p className="text-muted">View and edit your profile information.</p>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar bg="white" expand="lg" className="shadow-sm border-bottom">
        <Container fluid>
          <Navbar.Brand href="#" className="fw-bold text-primary">
            Member Dashboard
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="member-navbar" />
          <Navbar.Collapse id="member-navbar">
            <Nav className="ms-auto align-items-center">
              <Nav.Link 
                onClick={() => {
                  setActiveTab('view-meeting');
                  setSelectedMeeting(null); // Reset selected meeting when clicking 'View meeting'
                }} 
                className={activeTab === 'view-meeting' ? 'fw-semibold' : ''}
              >
                <Calendar size={18} className="me-2" />
                View meeting
              </Nav.Link>
              <Nav.Link onClick={() => setActiveTab('preferred-role')} className={activeTab === 'preferred-role' ? 'fw-semibold' : ''}>
                <Star size={18} className="me-2" />
                Preferred role
              </Nav.Link>
              <Nav.Link onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'fw-semibold' : ''}>
                <User size={18} className="me-2" />
                Profile
              </Nav.Link>
              <Nav.Link href="#" className="d-flex align-items-center">
                <Bell size={18} className="me-2" />
                Notifications
              </Nav.Link>
              <Nav.Link onClick={handleLogout} className="text-danger">
                <LogOut size={18} className="me-2" />
                Logout
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="p-4">
        {renderContent()}
      </Container>
    </div>
  );
}

export default MemberDashboard;


