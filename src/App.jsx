import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { getAllMembers, addMember, updateMember, deleteUserById, getAllGuest } from './api/UserApi';
import { getAllMeetings, addMeeting, updateMeeting, deleteMeeting } from './api/MeetingApi';
import { addMeetingRoles } from './api/MeetingRoleApi';
import AdminHeader from './components/admin/AdminHeader';
import AdminSidebar from './components/admin/AdminSidebar';
import MemberForm from './components/admin/members/MemberForm';
import GuestForm from './components/admin/members/GuestForm';
import MembersList from './components/admin/members/MembersList';
import MeetingForm from './components/meetings/MeetingForm';
import MeetingsList from './components/meetings/MeetingsList';
import MeetingDetails from './components/meetings/MeetingDetails';
import DashboardStats from './components/admin/dashboard/DashboardStats';
import { Modal, Table } from 'react-bootstrap';
import AssignRole from './components/assign-role/AssignRole';
import AgendaView from './components/agenda/AgendaView';
import UpdateAgenda from './components/agenda/updateAgenda';
import GemOfMonthModal from './components/admin/GemOfMonthModal';
import MeetingWinner from './components/admin/MeetingWinner';
import BackoutsModal from './components/admin/BackoutsModal';
import { Users, UserPlus, Calendar, FileText } from 'lucide-react';
import './App.css';

function App({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meetingsLoading, setMeetingsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showGuestsModal, setShowGuestsModal] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingGuest, setEditingGuest] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [editingAgendaMeetingId, setEditingAgendaMeetingId] = useState(null);
  const [selectedAgendaMeetingId, setSelectedAgendaMeetingId] = useState(null);
  const [showGemOfMonthModal, setShowGemOfMonthModal] = useState(false);
  const [showBackoutsModal, setShowBackoutsModal] = useState(false);
  const [guests, setGuests] = useState([]);
  const [guestsLoading, setGuestsLoading] = useState(false);

  // Update activeTab based on current route (keep dashboard default on "/")
  useEffect(() => {
    if (location.pathname === '/') {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  // Handle gem of month modal
  useEffect(() => {
    if (activeTab === 'gem-of-month') {
      setShowGemOfMonthModal(true);
      setActiveTab('dashboard'); // Reset to dashboard after opening modal
    }
  }, [activeTab]);

  useEffect(() => {
    loadUsers();
    loadMeetings();
  }, []);

  // BackoutsModal handles its own data fetching

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllMembers();
      setUsers(res.data.data);
    } catch (err) {
      console.error('Error fetching users:', err.response || err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load members. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMeetings = async () => {
    try {
      setMeetingsLoading(true);
      const res = await getAllMeetings();
      const allMeetings = res.data.data || [];
      
      // Sort meetings by date (earliest first)
      allMeetings.sort((a, b) => {
        if (!a.meetingDate || !b.meetingDate) return 0;
        const dateA = new Date(a.meetingDate);
        const dateB = new Date(b.meetingDate);
        
        // Check if dates are valid
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
        
        return dateB.getTime() - dateA.getTime();
      });
      
      setMeetings(allMeetings);
    } catch (err) {
      console.error('Error fetching meetings:', err.response || err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load meetings. Please try again.',
      });
    } finally {
      setMeetingsLoading(false);
    }
  };

  const handleAddMember = () => {
    setEditingUser(null);
    setShowMemberForm(true);
  };

  const handleAddGuest = () => {
    setEditingGuest(null);
    setShowGuestForm(true);
  };

  const handleViewGuests = async () => {
    setShowGuestsModal(true);
    await loadGuests();
  };

  const loadGuests = async () => {
    try {
      setGuestsLoading(true);
      const res = await getAllGuest();
      const list = res?.data?.data || res?.data || [];
      setGuests(Array.isArray(list) ? list : []);
    } catch (e) {
      setGuests([]);
    } finally {
      setGuestsLoading(false);
    }
  };

  const handleEditMember = (user) => {
    setEditingUser(user);
    setShowMemberForm(true);
  };

  const handleSubmitMember = async (userData) => {
    try {
      if (editingUser) {
        await updateMember({ ...userData, userId: editingUser.userId });
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Member updated successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await addMember(userData);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Member added successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
      }
      loadUsers();
    } catch (err) {
      throw err; // Let the form handle the error
    }
  };

  const handleSubmitGuest = async (guestData) => {
    try {
      if (editingGuest) {
        await updateMember({ ...guestData, userId: editingGuest.userId });
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Guest updated successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await addMember(guestData);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Guest added successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
      }
      setEditingGuest(null);
      await loadUsers();
      if (showGuestsModal) await loadGuests();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteMember = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this action!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteUserById(id);
        loadUsers();
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Member has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete member. Please try again.',
        });
      }
    }
  };

  const handleAddMeeting = () => {
    setEditingMeeting(null);
    setShowMeetingForm(true);
  };

  const handleEditMeeting = (meeting) => {
    // If invoked from row click for viewing details
    if (meeting && meeting.__viewOnly) {
      setEditingMeeting(meeting);
      setActiveTab('meeting-details');
      return;
    }
    setEditingMeeting(meeting);
    setShowMeetingForm(true);
  };

  const handleSubmitMeeting = async (meetingData) => {
    try {
      // Check if this is just a refresh request from MeetingForm
      if (meetingData && meetingData.refresh) {
        await loadMeetings();
        return;
      }

      // Build roles map from MeetingForm payload (for editing meetings)
      const entries = Object.entries(meetingData.selectedRoles || {});
      const rolesMap = Object.fromEntries(
        entries
          .filter(([, v]) => v && v.selected && Number(v.count) >= 1)
          .map(([rid, v]) => [rid, Number(v.count)])
      );

      if (editingMeeting) {
        // Update meeting first
        await updateMeeting(editingMeeting.meetingId, meetingData);
        // Then persist roles for this meeting
        const meetingId = editingMeeting.meetingId ?? editingMeeting.id;
        if (meetingId && Object.keys(rolesMap).length > 0) {
          try {
            await addMeetingRoles(meetingId, rolesMap);
          } catch (e) {
            console.error('Failed to save meeting roles (update):', e);
            // Non-blocking warning; meeting is updated already
            Swal.fire({
              icon: 'warning',
              title: 'Roles Not Saved',
              text: 'Meeting updated, but roles could not be saved. Please try again from Add Roles.',
            });
          }
        }
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Meeting updated successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        await loadMeetings();
      }
      // Note: New meeting creation is now handled directly in MeetingForm
    } catch (err) {
      throw err; // Let the form handle the error
    }
  };

  const handleDeleteMeeting = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this action!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteMeeting(id);
        loadMeetings();
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Meeting has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete meeting. Please try again.',
        });
      }
    }
  };

  const handleLogout = () => {
    // Call the parent logout handler to redirect to login page
    if (onLogout) {
      onLogout();
    }
  };

  const renderDashboard = () => (
    <div>
      <div className="mb-4">
        <h2>Dashboard Overview</h2>
        <p className="text-muted">Welcome to the Member Management System</p>
      </div>
      
      <DashboardStats 
        totalMembers={users.filter(u => Number(u.deleteStatus) === 1).length}
        totalMeetings={meetings.length}
        onMeetingsClick={() => setActiveTab('meetings')}
        onBackoutsClick={() => setShowBackoutsModal(true)}
      />
      
      <Row className="g-4">
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 hover-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('members')}>
            <Card.Body className="text-center">
              <Users size={48} className="text-primary mb-3" />
              <h5>View Members</h5>
              <p className="text-muted mb-0">Manage all registered members</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 hover-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('assign-role')}>
            <Card.Body className="text-center">
              <UserPlus size={48} className="text-success mb-3" />
              <h5>Assign Role</h5>
              <p className="text-muted mb-0">Assign roles to members</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 hover-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('meetings')}>
            <Card.Body className="text-center">
              <Calendar size={48} className="text-info mb-3" />
              <h5>Meetings</h5>
              <p className="text-muted mb-0">Total: {meetings.length}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100 hover-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('agenda')}>
            <Card.Body className="text-center">
              <FileText size={48} className="text-warning mb-3" />
              <h5>Agenda</h5>
              <p className="text-muted mb-0">View meeting agendas</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderAddMember = () => (
    <div>
      <div className="mb-4">
        <h2>Add New Member</h2>
        <p className="text-muted">Register a new member to the system</p>
      </div>
      
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <UserPlus size={64} className="text-primary mb-4" />
          <h4>Ready to Add a New Member?</h4>
          <p className="text-muted mb-4">Click the button below to open the member registration form</p>
          <div className="d-flex justify-content-center gap-2">
            <Button variant="primary" size="lg" onClick={handleAddMember}>
              <UserPlus size={20} className="me-2" />
              Open Registration Form
            </Button>
            <Button variant="outline-primary" size="lg" onClick={handleAddGuest}>
              Add Guest
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  const renderMembers = () => (
    <div>
      <div className="mb-4">
        <h2>Members Management</h2>
        <p className="text-muted">View, edit, and manage all registered members</p>
      </div>
      
      <MembersList
        users={users}
        loading={loading}
        onEdit={handleEditMember}
        onDelete={handleDeleteMember}
        onAdd={handleAddMember}
        onViewGuests={handleViewGuests}
      />
    </div>
  );

  const renderMeetings = () => (
    <div>
      <div className="mb-4">
        <h2>Meetings Management</h2>
        <p className="text-muted">Schedule, edit, and manage club meetings</p>
      </div>
      
      <MeetingsList
        meetings={meetings}
        loading={meetingsLoading}
        onEdit={handleEditMeeting}
        onDelete={handleDeleteMeeting}
        onAdd={handleAddMeeting}
      />
    </div>
  );

  const renderMeetingDetails = () => (
    <div>
      <div className="mb-4">
        <h2>Meeting Details</h2>
        <p className="text-muted">View details and set member availability</p>
      </div>
      <Card className="shadow-sm p-4">
        <MeetingDetails
          meeting={editingMeeting}
          users={users}
          onBack={() => setActiveTab('meetings')}
        />
      </Card>
    </div>
  );

  const renderAssignRole = () => (
    <div>
      <div className="mb-4">
        <h2>Assign Roles</h2>
        <p className="text-muted">Assign roles to available members for upcoming meetings</p>
      </div>
      <AssignRole />
    </div>
  );

  const renderAgenda = () => (
    <div>
      <div className="mb-4">
        {/* <h2>Meeting Agenda</h2>
        <p className="text-muted">View and manage meeting agendas</p> */}
      </div>
      {editingAgendaMeetingId ? (
        <UpdateAgenda
          meetingId={editingAgendaMeetingId}
          onBack={() => {
            // Return to agenda tab with the same meeting selected
            setEditingAgendaMeetingId(null);
            setActiveTab('agenda');
          }}
        />
      ) : (
        <AgendaView
          preselectedMeetingId={selectedAgendaMeetingId}
          onEditAgenda={(mid) => {
            if (mid) {
              setActiveTab('agenda');
              setSelectedAgendaMeetingId(mid);
              setEditingAgendaMeetingId(mid);
            }
          }}
        />
      )}
    </div>
  );

  const renderMeetingWinner = () => <MeetingWinner />;

  const renderContent = () => {
    return (
      <>
        {(() => {
          switch (activeTab) {
            case 'dashboard':
              return renderDashboard();
            case 'add-member':
              return renderAddMember();
            case 'members':
              return renderMembers();
            case 'meetings':
              return renderMeetings();
            case 'meeting-details':
              return renderMeetingDetails();
            case 'assign-role':
              return renderAssignRole();
            case 'agenda':
              return renderAgenda();
            case 'meeting-winner':
              return renderMeetingWinner();
            default:
              return (
                <Card className="shadow-sm">
                  <Card.Body className="text-center py-5">
                    <h4>Coming Soon</h4>
                    <p className="text-muted">This feature is under development.</p>
                  </Card.Body>
                </Card>
              );
          }
        })()}

        <MemberForm
          show={showMemberForm}
          onHide={() => setShowMemberForm(false)}
          onSubmit={handleSubmitMember}
          editingUser={editingUser}
          title={editingUser ? 'Edit Member' : 'Add New Member'}
        />

        <GuestForm
          show={showGuestForm}
          onHide={() => setShowGuestForm(false)}
          onSubmit={handleSubmitGuest}
          title={editingGuest ? 'Edit Guest' : 'Add Guest'}
          editingGuest={editingGuest}
        />

        <MeetingForm
          show={showMeetingForm}
          onHide={() => setShowMeetingForm(false)}
          onSubmit={handleSubmitMeeting}
          editingMeeting={editingMeeting}
          title={editingMeeting ? 'Edit Meeting' : 'Add New Meeting'}
        />

        <GemOfMonthModal
          show={showGemOfMonthModal}
          onHide={() => setShowGemOfMonthModal(false)}
        />

        <BackoutsModal
          show={showBackoutsModal}
          onHide={() => setShowBackoutsModal(false)}
          users={users}
          meetings={meetings}
        />

        <Modal show={showGuestsModal} onHide={() => setShowGuestsModal(false)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Guests</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {guestsLoading ? (
              <div className="text-center py-4 text-muted">Loading guests...</div>
            ) : guests.length === 0 ? (
              <div className="text-center py-4 text-muted">No guests found.</div>
            ) : (
              <div className="table-responsive">
                <Table striped hover size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Contact</th>
                      <th>Gender</th>
                      <th>DOB</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guests.map((g, idx) => (
                      <tr key={g.userId}>
                        <td>{idx + 1}</td>
                        <td>{g.userName}</td>
                        <td>{g.userEmail}</td>
                        <td>{g.userContact}</td>
                        <td>{g.gender}</td>
                        <td>{g.dob ? new Date(g.dob).toLocaleDateString() : '-'}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => {
                                setEditingGuest(g);
                                setShowGuestForm(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={async () => {
                                const result = await Swal.fire({
                                  title: 'Are you sure?',
                                  text: "You won't be able to revert this action!",
                                  icon: 'warning',
                                  showCancelButton: true,
                                  confirmButtonColor: '#dc3545',
                                  cancelButtonColor: '#6c757d',
                                  confirmButtonText: 'Yes, delete it!'
                                });
                                if (result.isConfirmed) {
                                  try {
                                    await deleteUserById(g.userId);
                                    await loadGuests();
                                    await loadUsers();
                                    Swal.fire({
                                      icon: 'success',
                                      title: 'Deleted!',
                                      text: 'Guest has been deleted successfully.',
                                      timer: 2000,
                                      showConfirmButton: false,
                                    });
                                  } catch (err) {
                                    Swal.fire({
                                      icon: 'error',
                                      title: 'Error',
                                      text: 'Failed to delete guest. Please try again.'
                                    });
                                  }
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Modal.Body>
        </Modal>
      </>
    );
  };

  return (
    <div className="min-vh-100 bg-light">
      <AdminHeader onLogout={onLogout} />
      <div className="d-flex">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-grow-1 p-4" style={{ marginLeft: '250px', width: 'calc(100% - 250px)' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;