import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Badge, Alert, Spinner, Table, Modal, Pagination } from 'react-bootstrap';
import { Calendar, Clock, MapPin, Users, Settings, Plus, Edit, Trash2 } from 'lucide-react';
import { getAllMeetings } from '../../api/MeetingApi';
import { getAllMemberAvailability } from '../../api/AvailableMembersApi';
import { getAllMembers } from '../../api/UserApi';
import { getMemberPreferredRoles, addMemberPreferredRole } from '../../api/PreferredRoleApi';
import { getMemberAssignedRole, addMemberAssignedRole } from '../../api/AssignedRoleApi';
import { getAllRoles, addRole, updateRole, deleteRole } from '../../api/RoleApi';

const AssignRole = () => {
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [availableMembers, setAvailableMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [memberRoles, setMemberRoles] = useState({});
  const [assignedRoles, setAssignedRoles] = useState({});
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Role management states
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleFormData, setRoleFormData] = useState({ roleName: '', description: '' });
  const [allRolesData, setAllRolesData] = useState([]);
  const [currentRolePage, setCurrentRolePage] = useState(1);
  const rolesPerPage = 6;

  useEffect(() => {
    loadUpcomingMeetings();
    loadAllMembers();
    loadAvailableRoles();
  }, []);

  // Auto-select the next upcoming meeting when meetings are loaded
  useEffect(() => {
    if (meetings.length > 0 && !selectedMeeting) {
      // Find the next upcoming meeting (earliest date from today)
      const today = new Date();
      const nextMeeting = meetings.find(meeting => {
        if (!meeting.meetingDate) return false;
        const meetingDate = new Date(meeting.meetingDate);
        const meetingDay = new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate());
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return meetingDay >= todayStart;
      });

      if (nextMeeting) {
        setSelectedMeeting(nextMeeting);
        setSelectedMeetingId(nextMeeting.meetingId);
        loadAvailableMembers(nextMeeting.meetingId);
      }
    }
  }, [meetings, selectedMeeting]);

  const loadUpcomingMeetings = async () => {
    try {
      setLoading(true);
      const response = await getAllMeetings();
      const allMeetings = response.data?.data || response.data || [];
      
      // Filter only current and future meetings (not past meetings)
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
      
      const upcomingMeetings = allMeetings.filter(meeting => {
        if (!meeting.meetingDate) return false;
        const meetingDate = new Date(meeting.meetingDate);
        const meetingDay = new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate());
        return meetingDay >= today; // Include today and future dates
      });

      // Sort meetings by date (earliest first)
      upcomingMeetings.sort((a, b) => {
        const dateA = new Date(a.meetingDate);
        const dateB = new Date(b.meetingDate);
        return dateA - dateB;
      });

      setMeetings(upcomingMeetings);
    } catch (err) {
      setError('Failed to load meetings');
      console.error('Error loading meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllMembers = async () => {
    try {
      const response = await getAllMembers();
      setAllMembers(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error loading members:', err);
    }
  };

  const loadAvailableRoles = async () => {
    try {
      const response = await getAllRoles();
      const roles = response.data?.data || response.data || [];
      setAllRolesData(roles);
      // Extract role names from the response
      const roleNames = roles.map(role => role.roleName || role.name || role);
      setAvailableRoles(roleNames);
    } catch (err) {
      console.error('Error loading roles:', err);
      // Fallback to default roles if API fails
      setAvailableRoles([
        'Toastmaster', 'General Evaluator', 'Timer', 'Ah Counter', 'Grammarian',
        'Table Topics Master', 'Speaker 1', 'Speaker 2', 'Speaker 3',
        'Evaluator 1', 'Evaluator 2', 'Evaluator 3', 'Sergeant at Arms'
      ]);
    }
  };

  const loadAvailableMembers = async (meetingId) => {
    try {
      setLoading(true);
      const availabilityResponse = await getAllMemberAvailability();
      const allAvailability = availabilityResponse.data?.data || availabilityResponse.data || [];
      
      console.log('All availability data:', allAvailability);
      console.log('Looking for meetingId:', meetingId);
      
      // Filter members who are available (status = 1) for the selected meeting
      const availableForMeeting = allAvailability.filter(item => {
        const itemMeetingId = item?.meetingId || item?.meeting?.meetingId || item?.meeting?.id;
        const status = item?.status || item?.availability || item?.availableStatus || -1;
        console.log('Item:', item, 'MeetingId:', itemMeetingId, 'Status:', status);
        return String(itemMeetingId) === String(meetingId) && Number(status) === 1;
      });

      console.log('Available members for meeting:', availableForMeeting);
      setAvailableMembers(availableForMeeting);
      
      // Load preferred and assigned roles for each available member
      await loadMemberRoles(availableForMeeting, meetingId);
    } catch (err) {
      setError('Failed to load available members');
      console.error('Error loading available members:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMemberRoles = async (members, meetingId) => {
    const roles = {};
    const assigned = {};

    for (const member of members) {
      const userId = member?.userId || member?.memberId || member?.user?.userId;
      if (userId) {
        try {
          // Load preferred roles
          const preferredResponse = await getMemberPreferredRoles(userId, meetingId);
          roles[userId] = preferredResponse.data || [];

          // Load assigned roles
          const assignedResponse = await getMemberAssignedRole(userId, meetingId);
          assigned[userId] = assignedResponse.data || [];
        } catch (err) {
          console.error(`Error loading roles for user ${userId}:`, err);
          roles[userId] = [];
          assigned[userId] = [];
        }
      }
    }

    setMemberRoles(roles);
    setAssignedRoles(assigned);
  };

  const handleMeetingSelect = (e) => {
    const meetingId = e.target.value;
    if (meetingId) {
      const meeting = meetings.find(m => String(m.meetingId) === String(meetingId));
      setSelectedMeeting(meeting);
      loadAvailableMembers(meetingId);
    } else {
      setSelectedMeeting(null);
      setAvailableMembers([]);
      setMemberRoles({});
      setAssignedRoles({});
    }
  };

  const handleRoleAssignment = async (userId, role, isAssigned) => {
    try {
      if (isAssigned) {
        // Remove role
        const currentRoles = assignedRoles[userId] || [];
        const updatedRoles = currentRoles.filter(r => r !== role);
        await addMemberAssignedRole(userId, selectedMeeting.meetingId, updatedRoles);
        setAssignedRoles(prev => ({ ...prev, [userId]: updatedRoles }));
      } else {
        // Add role
        const currentRoles = assignedRoles[userId] || [];
        const updatedRoles = [...currentRoles, role];
        await addMemberAssignedRole(userId, selectedMeeting.meetingId, updatedRoles);
        setAssignedRoles(prev => ({ ...prev, [userId]: updatedRoles }));
      }
    } catch (err) {
      setError('Failed to update role assignment');
      console.error('Error updating role assignment:', err);
      setTimeout(() => setError(''), 3000);
    }
  };

  const getMemberName = (member) => {
    const userId = member?.userId || member?.memberId || member?.user?.userId;
    const memberFromList = allMembers.find(m => String(m.userId) === String(userId));
    return memberFromList?.userName || member?.userName || member?.name || member?.user?.userName || 'Unknown';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}, ${weekday}`;
  };

  const getCategoryBadge = (category) => {
    if (!category || category === 'Regular') return null;
    
    const badgeConfig = {
      'Special': { bg: 'danger', text: 'Special' },
      'Contest': { bg: 'warning', text: 'Contest' }
    };
    
    const config = badgeConfig[category];
    if (!config) return null;
    
    return (
      <Badge bg={config.bg} className="ms-2">
        {config.text}
      </Badge>
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const raw = timeString.includes('T') ? timeString.split('T')[1] : timeString;
    const [hh, mm] = raw.split(':');
    return hh && mm ? `${hh}:${mm}` : raw;
  };

  // Role management functions
  const handleManageRoles = () => {
    setCurrentRolePage(1); // Reset to first page when opening modal
    setShowRoleModal(true);
  };

  // Calculate pagination for roles
  const totalRolePages = Math.ceil((allRolesData?.length || 0) / rolesPerPage);
  const startRoleIndex = (currentRolePage - 1) * rolesPerPage;
  const endRoleIndex = startRoleIndex + rolesPerPage;
  const currentRoles = allRolesData?.slice(startRoleIndex, endRoleIndex) || [];

  const handleRolePageChange = (pageNumber) => {
    setCurrentRolePage(pageNumber);
  };

  const handleAddRole = () => {
    setEditingRole(null);
    setRoleFormData({ roleName: '', description: '' });
    setShowRoleForm(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setRoleFormData({ 
      roleName: role.roleName || role.name || '', 
      description: role.description || '' 
    });
    setShowRoleForm(true);
  };

  const handleDeleteRole = async (roleId) => {
    try {
      await deleteRole(roleId);
      loadAvailableRoles();
    } catch (err) {
      setError('Failed to delete role');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSubmitRole = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await updateRole(editingRole.roleId || editingRole.id, roleFormData);
      } else {
        await addRole(roleFormData);
      }
      loadAvailableRoles();
      setShowRoleForm(false);
      setRoleFormData({ roleName: '', description: '' });
    } catch (err) {
      setError('Failed to save role');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div></div>
        <div className="d-flex justify-content-end">
          <Button variant="primary" onClick={() => setShowRoleModal(true)}>
            <Settings size={16} className="me-2" />
            Manage Roles
          </Button>
        </div>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Meeting Selection */}
      <Card className="mb-4">
        <Card.Header className="d-flex align-items-center">
          <Calendar size={18} className="me-2" />
          <h5 className="mb-0">Select Meeting</h5>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Meeting</Form.Label>
            <Form.Select
              value={selectedMeetingId}
              onChange={(e) => {
                const meetingId = e.target.value;
                setSelectedMeetingId(meetingId);
                if (meetingId) {
                  const meeting = meetings.find(m => String(m.meetingId) === String(meetingId));
                  setSelectedMeeting(meeting);
                  loadAvailableMembers(meetingId);
                } else {
                  setSelectedMeeting(null);
                  setAvailableMembers([]);
                }
              }}
              disabled={loading}
            >
              <option value="">Select a meeting...</option>
              {meetings.map(meeting => (
                <option key={meeting.meetingId} value={meeting.meetingId}>
                  {formatDate(meeting.meetingDate)} - {meeting.meetingTheme}{meeting.category === 'Special' ? ` 🔴 ${meeting.category}` : meeting.category === 'Contest' ? ` 🟡 ${meeting.category}` : ''}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Meeting Details */}
      {selectedMeeting && (
        <Card className="mb-4">
          <Card.Header className="d-flex align-items-center">
            <Calendar size={18} className="me-2" />
            <h5 className="mb-0">Meeting Details</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p><strong>Date:</strong> {formatDate(selectedMeeting.meetingDate)}</p>
                <p><strong>Time:</strong> {selectedMeeting.startTime} - {selectedMeeting.endTime}</p>
              </Col>
              <Col md={6}>
                <p><strong>Location:</strong> {selectedMeeting.meetingLocation}</p>
                <p><strong>Theme:</strong> {selectedMeeting.meetingTheme}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Available Members and Role Assignment */}
      {selectedMeeting && (
        <Card>
          <Card.Header className="d-flex align-items-center">
            <Users size={18} className="me-2" />
            <h5 className="mb-0">Available Members & Role Assignment</h5>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <div className="text-center">
                <Spinner animation="border" />
                <p className="mt-2">Loading available members...</p>
              </div>
            ) : availableMembers.length === 0 ? (
              <Alert variant="info">No members are available for this meeting.</Alert>
            ) : (
              <Table responsive>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Preferred Roles</th>
                    <th>Assigned Roles</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {availableMembers.map((member, index) => {
                    const userId = member?.userId || member?.memberId || member?.user?.userId;
                    const memberName = getMemberName(member);
                    const preferredRoles = memberRoles[userId] || [];
                    const currentAssignedRoles = assignedRoles[userId] || [];

                    return (
                      <tr key={index} className="border-0">
                        <td>{memberName}</td>
                        <td>
                          {preferredRoles.length > 0 ? (
                            preferredRoles.map((role, i) => (
                              <Badge key={i} bg="info" className="me-1 mb-1">
                                {role}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted">No preferences</span>
                          )}
                        </td>
                        <td>
                          {currentAssignedRoles.length > 0 ? (
                            currentAssignedRoles.map((role, i) => (
                              <Badge key={i} bg="success" className="me-1 mb-1">
                                {role}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted">Not assigned</span>
                          )}
                        </td>
                        <td>
                          <div>
                            {allRolesData.map((role, roleIndex) => {
                              const isAssigned = currentAssignedRoles.includes(role.roleName);
                              return (
                                <Button
                                  key={roleIndex}
                                  variant={isAssigned ? "outline-danger" : "outline-success"}
                                  size="sm"
                                  onClick={() => handleRoleAssignment(userId, role.roleName, isAssigned)}
                                  className="me-2 mb-1"
                                >
                                  {isAssigned ? (
                                    <>
                                      <strong>Remove:</strong> {role.roleName}
                                    </>
                                  ) : (
                                    <>
                                      <strong>Assign:</strong> {role.roleName}
                                    </>
                                  )}
                                </Button>
                              );
                            })}
                            {allRolesData.length === 0 && (
                              <div className="text-muted mt-2">
                                <small>No roles available</small>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Role Management Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Manage Roles</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6>
              All Roles: {allRolesData.length}
              {totalRolePages > 1 && (
                <span className="text-muted ms-2">
                  (Page {currentRolePage} of {totalRolePages})
                </span>
              )}
            </h6>
            <Button variant="primary" onClick={handleAddRole}>
              <Plus size={16} className="me-2" />
              Add Role
            </Button>
          </div>
          
          <Table responsive>
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRoles.map((role, index) => (
                <tr key={role.roleId || role.id || index}>
                  <td>{role.roleName || role.name}</td>
                  <td>{role.description || 'No description'}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditRole(role)}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteRole(role.roleId || role.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          {totalRolePages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <Pagination>
                <Pagination.First 
                  onClick={() => handleRolePageChange(1)} 
                  disabled={currentRolePage === 1}
                />
                <Pagination.Prev 
                  onClick={() => handleRolePageChange(currentRolePage - 1)} 
                  disabled={currentRolePage === 1}
                />
                
                {[...Array(totalRolePages)].map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <Pagination.Item
                      key={pageNumber}
                      active={pageNumber === currentRolePage}
                      onClick={() => handleRolePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Pagination.Item>
                  );
                })}
                
                <Pagination.Next 
                  onClick={() => handleRolePageChange(currentRolePage + 1)} 
                  disabled={currentRolePage === totalRolePages}
                />
                <Pagination.Last 
                  onClick={() => handleRolePageChange(totalRolePages)} 
                  disabled={currentRolePage === totalRolePages}
                />
              </Pagination>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Role Form Modal */}
      <Modal show={showRoleForm} onHide={() => setShowRoleForm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingRole ? 'Edit Role' : 'Add New Role'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitRole}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Role Name</Form.Label>
              <Form.Control
                type="text"
                value={roleFormData.roleName}
                onChange={(e) => setRoleFormData({ ...roleFormData, roleName: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={roleFormData.description}
                onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRoleForm(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingRole ? 'Update Role' : 'Add Role'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AssignRole;
