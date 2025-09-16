import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar, Card, Modal, Button, Form } from 'react-bootstrap';
import { Calendar, Star, User, LogOut, Bell, Save, Edit } from 'lucide-react';
import { logout } from '../../api/AuthApi';
import ViewMeetings from './ViewMeetings';
import AgendaView from '../agenda/AgendaView';
import MeetingDetailsView from './MeetingDetailsView';
import PreferredRolesPage from './PreferredRolesPage';
import AssignedSpeech from './AssignedSpeech';
import AssignedWodPod from './AssignedWodPod';
import { getAllMeetings } from '../../api/MeetingApi';
import MemberGemOfMonth from './MemberGemOfMonth';
import MemberMeetingWinner from './MemberMeetingWinner';
import MemberSidebar from './MemberSidebar';

function MemberDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('view-meeting');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [viewAgendaMeetingId, setViewAgendaMeetingId] = useState(null);
  
  // Get current user from localStorage
  const currentUserRaw = localStorage.getItem('tm_current_user');
  const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : {};

  // Initialize form data when component mounts
  useEffect(() => {
    if (currentUser) {
      setFormData({
        userName: currentUser.userName || '',
        userEmail: currentUser.userEmail || '',
        userContact: currentUser.userContact || '',
        address: currentUser.address || '',
        gender: currentUser.gender || '',
        dob: currentUser.dob ? new Date(currentUser.dob).toISOString().split('T')[0] : '',
        hobbies: currentUser.hobbies || ''
      });
    }
  }, []); // Empty dependency array to run only on mount

  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would typically call an API to update the user
    // For now, we'll just update the local storage
    try {
      const updatedUser = { ...currentUser, ...formData };
      localStorage.setItem('tm_current_user', JSON.stringify(updatedUser));
      setShowEditModal(false);
      // Show success message or refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

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
          viewAgendaMeetingId ? (
            <div style={{ width: '75%', margin: '0 auto' }}>
              <div className="d-flex justify-content-end align-items-center mb-2">
                <Button variant="outline-secondary" size="sm" onClick={() => setViewAgendaMeetingId(null)}>
                  Back
                </Button>
              </div>
              <Card className="shadow-sm p-3">
                <AgendaView preselectedMeetingId={viewAgendaMeetingId} isMemberView={true} />
              </Card>
            </div>
          ) : selectedMeeting ? (
            <MeetingDetailsView
              meeting={selectedMeeting}
              onBack={() => setSelectedMeeting(null)}
            />
          ) : (
            <ViewMeetings 
              onOpenDetails={(m) => setSelectedMeeting(m)} 
              onOpenAssignedWodPod={() => setActiveTab('assigned-wodpod')}
              onOpenAssignedSpeech={() => setActiveTab('assigned-speech')}
              onOpenAgenda={(mid) => setViewAgendaMeetingId(mid)}
            />
          )
        );
      case 'preferred-role':
        return <PreferredRolesPage onMeetingClick={(meeting) => {
          setSelectedMeeting(meeting);
          setActiveTab('view-meeting');
        }} />;
      case 'assigned-wodpod':
        return (
          <AssignedWodPod onBack={() => setActiveTab('view-meeting')} />
        );
      case 'assigned-speech':
        return (
          <AssignedSpeech onBack={() => setActiveTab('view-meeting')} />
        );
      case 'gem-month':
        return (
          <MemberGemOfMonth />
        );
      case 'meeting-winner':
        return (
          <MemberMeetingWinner />
        );
      case 'profile':
        return null; // We'll handle profile in a modal now
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
              <Nav.Link onClick={() => setShowProfileModal(true)}>
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

      {/* Fixed sidebar like admin */}
      <MemberSidebar activeTab={activeTab} setActiveTab={(id) => {
        if (id === 'view-meeting') setSelectedMeeting(null);
        setActiveTab(id);
      }} />

      {/* Shift content to the right of the fixed 250px sidebar and below navbar */}
      <div
        style={{
          marginLeft: '250px',
          width: 'calc(100% - 250px)',
          marginTop: '56px',
        }}
      >
        <Container fluid className="p-3">
          {renderContent()}
        </Container>
      </div>

      {/* Profile Modal */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>My Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <h5>{currentUser.userName || 'User'}</h5>
                <p className="text-muted">{currentUser.userEmail || 'No email provided'}</p>
              </div>
              
              <div className="mb-3">
                <h6>Contact Information</h6>
                <div className="border rounded p-3">
                  <div className="mb-2">
                    <small className="text-muted d-block">Email</small>
                    <div>{currentUser.userEmail || 'Not provided'}</div>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted d-block">Contact Number</small>
                    <div>{currentUser.userContact || 'Not provided'}</div>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted d-block">Address</small>
                    <div>{currentUser.address || 'Not provided'}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="mb-3">
                <h6>Personal Details</h6>
                <div className="border rounded p-3">
                  <div className="row">
                    <div className="col-6 mb-2">
                      <small className="text-muted d-block">Gender</small>
                      <div>{currentUser.gender || 'Not specified'}</div>
                    </div>
                    <div className="col-6 mb-2">
                      <small className="text-muted d-block">Date of Birth</small>
                      <div>{currentUser.dob ? new Date(currentUser.dob).toLocaleDateString() : 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted d-block">Hobbies</small>
                    <div>{currentUser.hobbies || 'Not specified'}</div>
                  </div>
                  {currentUser.mentorId && (
                    <div className="mb-2">
                      <small className="text-muted d-block">Mentor ID</small>
                      <div>{currentUser.mentorId}</div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-3">
                <h6>Account Information</h6>
                <div className="border rounded p-3">
                  <div className="row">
                    <div className="col-6 mb-2">
                      <small className="text-muted d-block">User ID</small>
                      <div>{currentUser.userId || 'N/A'}</div>
                    </div>
                    <div className="col-6 mb-2">
                      <small className="text-muted d-block">Member Since</small>
                      <div>{currentUser.joinDate ? new Date(currentUser.joinDate).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-6 mb-2">
                      <small className="text-muted d-block">Account Status</small>
                      <div className="d-flex align-items-center">
                        <span className={`me-2 badge ${currentUser.active === 'true' ? 'bg-success' : 'bg-secondary'}`}>
                          {currentUser.active === 'true' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="col-6 mb-2">
                      <small className="text-muted d-block">User Type</small>
                      <div className="text-capitalize">{currentUser.userType || 'user'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="d-flex justify-content-between mt-3">
            <Button 
              variant="outline-primary" 
              onClick={() => {
                setShowProfileModal(false);
                setShowEditModal(true);
              }}
            >
              <Edit size={16} className="me-1" /> Update Profile
            </Button>
            <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
              Close
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Update Profile</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="userName"
                    value={formData.userName || ''}
                    onChange={handleInputChange}
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    name="userEmail"
                    value={formData.userEmail || ''}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control 
                    type="tel" 
                    name="userContact"
                    value={formData.userContact || ''}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3}
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select 
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="dob"
                    value={formData.dob || ''}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Hobbies</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="hobbies"
                    value={formData.hobbies || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Reading, Sports, Music"
                  />
                </Form.Group>

                <div className="border rounded p-3 bg-light">
                  <Form.Group className="mb-2">
                    <Form.Label className="text-muted small mb-0">User ID</Form.Label>
                    <div>{currentUser.userId || 'N/A'}</div>
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label className="text-muted small mb-0">Member Since</Form.Label>
                    <div>{currentUser.joinDate ? new Date(currentUser.joinDate).toLocaleDateString() : 'N/A'}</div>
                  </Form.Group>
                  {currentUser.mentorId && (
                    <Form.Group>
                      <Form.Label className="text-muted small mb-0">Mentor ID</Form.Label>
                      <div>{currentUser.mentorId}</div>
                    </Form.Group>
                  )}
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <Save size={16} className="me-1" /> Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      
    </div>
  );
}

export default MemberDashboard;


