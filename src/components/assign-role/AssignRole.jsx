import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Badge, Alert, Spinner, Table, Modal, Pagination, InputGroup, Dropdown } from 'react-bootstrap';
import { Calendar, Clock, MapPin, Users, Settings, Plus, Edit, Trash2, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import { getAllMeetings, getAllUpcomingMeetings } from '../../api/MeetingApi';
import { getAllMemberAvailability } from '../../api/AvailableMembersApi';
import { getAllMembers } from '../../api/UserApi';
import { getMemberPreferredRoles, addMemberPreferredRole } from '../../api/PreferredRoleApi';
import { getMemberAssignedRole, addMemberAssignedRole } from '../../api/AssignedRoleApi';
import { getAllRoles, addRole, updateRole, deleteRole } from '../../api/RoleApi';
import { getAllMeetingRoleCombineByMeeting } from '../../api/MeetingRoleApi';

const AssignRole = () => {
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [availableMembers, setAvailableMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [memberRoles, setMemberRoles] = useState({});
  const [assignedRoles, setAssignedRoles] = useState({});
  const [availableRoles, setAvailableRoles] = useState([]);
  const [meetingSpecificRoles, setMeetingSpecificRoles] = useState([]);
  const [availableRoleCounts, setAvailableRoleCounts] = useState({});
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
  const ROLES_PER_PAGE = 6; // Set constant for roles per page
  const [totalRolePages, setTotalRolePages] = useState(1);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  
  // Role assignment modal state
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMemberRoles, setSelectedMemberRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allMeetings, setAllMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);

  // Filter meetings based on search term
  useEffect(() => {
    if (!searchTerm) {
      setMeetings(allMeetings);
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = allMeetings.filter(meeting => {
      return (
        (meeting.meetingTitle && meeting.meetingTitle.toLowerCase().includes(searchLower)) ||
        (meeting.meetingTheme && meeting.meetingTheme.toLowerCase().includes(searchLower)) ||
        (meeting.meetingLocation && meeting.meetingLocation.toLowerCase().includes(searchLower)) ||
        (meeting.meetingDate && meeting.meetingDate.toLowerCase().includes(searchLower)) ||
        (meeting.category && meeting.category.toLowerCase().includes(searchLower))
      );
    });
    
    setMeetings(filtered);
  }, [searchTerm, allMeetings]);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        loadUpcomingMeetings(),
        loadAllMembers(),
        loadAvailableRoles()
      ]);
    };
    
    initializeData();
  }, []);

  // Auto-select the next upcoming meeting when meetings are loaded
  useEffect(() => {
    if (meetings.length > 0 && !selectedMeetingId) {
      // Find the next upcoming meeting (earliest date from today)
      const today = new Date();
      const nextMeeting = meetings.find(meeting => {
        if (!meeting.meetingDate) return false;
        const meetingDate = new Date(meeting.meetingDate);
        const meetingDay = new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate());
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return meetingDay >= todayStart;
      }) || meetings[0]; // Fallback to first meeting if no future meetings

      if (nextMeeting) {
        setSelectedMeeting(nextMeeting);
        setSelectedMeetingId(nextMeeting.meetingId);
        loadAvailableMembers(nextMeeting.meetingId);
      }
    }
  }, [meetings]);

  const loadUpcomingMeetings = async () => {
    try {
      setLoading(true);
      const response = await getAllMeetings();
      let meetingsData = response.data.data || [];
      
      // Filter for upcoming meetings (including today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcomingMeetings = meetingsData.filter(meeting => {
        if (!meeting.meetingDate) return false;
        const meetingDay = new Date(meeting.meetingDate);
        meetingDay.setHours(0, 0, 0, 0);
        return meetingDay >= today; // Include today and future dates
      });

      // Sort meetings by date (earliest first)
      upcomingMeetings.sort((a, b) => {
        const dateA = new Date(a.meetingDate);
        const dateB = new Date(b.meetingDate);
        return dateA - dateB;
      });

      setAllMeetings(upcomingMeetings);
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
      setAllMembers(response.data.data || []);
    } catch (err) {
      console.error('Error loading members:', err);
    }
  };

  const loadAvailableRoles = async () => {
    try {
      setIsLoadingRoles(true);
      // Fetch roles from the API
      const response = await getAllRoles();
      
      // Handle the API response - ensure we have an array of roles
      let roles = [];
      if (Array.isArray(response)) {
        roles = response;
      } else if (response && Array.isArray(response.data)) {
        roles = response.data;
      } else if (response && response.data && typeof response.data === 'object') {
        // If the response is an object with role data, convert it to an array
        roles = Object.entries(response.data).map(([id, role]) => ({
          roleId: role.roleId || id,  // Use role.roleId if available, otherwise use the key
          roleName: role.roleName || role.name || role,
          description: role.description || ''
        }));
      }
      
      // Ensure each role has both roleId and roleName properties to match backend
      const processedRoles = roles.map(role => ({
        roleId: role.roleId || role.id,  // Prefer roleId as per backend entity
        roleName: role.roleName || role.name || role,
        description: role.description || ''
      }));
      
      // Update state with all roles
      setAllRolesData(processedRoles);
      
      // Calculate total pages for pagination
      const totalRoles = processedRoles.length;
      const calculatedTotalPages = Math.ceil(totalRoles / ROLES_PER_PAGE);
      setTotalRolePages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
      
      // Reset to first page if current page is out of bounds
      if (currentRolePage > calculatedTotalPages && calculatedTotalPages > 0) {
        setCurrentRolePage(1);
      }
      
      // Extract role names for the role selector
      const roleNames = processedRoles.map(role => role.roleName);
      setAvailableRoles(roleNames);
      
      return processedRoles;
    } catch (err) {
      console.error('Error loading roles:', err);
      setError('Failed to load roles. Using default roles.');
      // Fallback to default roles if API fails
      const defaultRoles = [
        'Toastmaster', 'General Evaluator', 'Timer', 'Ah Counter', 'Grammarian',
        'Table Topics Master', 'Speaker 1', 'Speaker 2', 'Speaker 3',
        'Evaluator 1', 'Evaluator 2', 'Evaluator 3', 'Sergeant at Arms'
      ];
      setAvailableRoles(defaultRoles);
      return defaultRoles.map(name => ({ roleName: name }));
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const loadMeetingSpecificRoles = async (meetingId) => {
    try {
      const response = await getAllMeetingRoleCombineByMeeting(meetingId);
      // Handle ResponseMessage structure
      const rolesData = response.data?.data || response.data || [];
      setMeetingSpecificRoles(rolesData);
      
      // Initialize available role counts and subtract already assigned roles
      const roleCounts = {};
      rolesData.forEach(role => {
        roleCounts[role.roleName] = role.roleCount || 1;
      });
      
      // Subtract already assigned roles from available counts
      Object.values(assignedRoles).forEach(memberRoles => {
        memberRoles.forEach(roleName => {
          if (roleCounts[roleName] > 0) {
            roleCounts[roleName] -= 1;
          }
        });
      });
      
      setAvailableRoleCounts(roleCounts);
      
      return rolesData;
    } catch (err) {
      console.error('Error loading meeting-specific roles:', err);
      setMeetingSpecificRoles([]);
      setAvailableRoleCounts({});
      return [];
    }
  };

  const loadAvailableMembers = async (meetingId) => {
    try {
      setLoading(true);
      const availabilityResponse = await getAllMemberAvailability();
      const allAvailability = availabilityResponse.data.data || [];
      
      console.log('All availability data:', allAvailability);
      console.log('Looking for meetingId:', meetingId);
      
      // Filter members who are available (status = 1) for the selected meeting
      const availableForMeeting = allAvailability.filter(item => {
        const itemMeetingId = item.meetingId || item.meeting.meetingId || item.meeting.id;
        const status = item.status || item.availability || item.availableStatus || -1;
        console.log('Item:', item, 'MeetingId:', itemMeetingId, 'Status:', status);
        return String(itemMeetingId) === String(meetingId) && Number(status) === 1;
      });

      console.log('Available members for meeting:', availableForMeeting);
      setAvailableMembers(availableForMeeting);
      
      // Load meeting-specific roles
      await loadMeetingSpecificRoles(meetingId);
      
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
      const userId = member.userId || member.memberId || member.user.userId;
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

  const handleMeetingChange = async (meetingId) => {
    const meeting = meetings.find(m => m.meetingId === parseInt(meetingId));
    setSelectedMeeting(meeting);
    setSelectedMeetingId(meetingId);
    
    if (meetingId) {
      await Promise.all([
        loadAvailableMembers(meetingId),
        loadMeetingSpecificRoles(meetingId)
      ]);
      // Reset assigned roles when meeting changes
      setAssignedRoles({});
    }
  };

  const handleMeetingSelect = (e) => {
    const meetingId = e.target.value;
    if (meetingId) {
      handleMeetingChange(meetingId);
    } else {
      setSelectedMeeting(null);
      setSelectedMeetingId('');
      setAvailableMembers([]);
      setMemberRoles({});
      setAssignedRoles({});
      setAvailableRoleCounts({});
    }
  };

  const handleOpenAssignRoleModal = (member) => {
    const userId = member.userId || member.memberId || member.user.userId;
    setSelectedMember(member);
    setSelectedMemberRoles(assignedRoles[userId] || []);
    setShowAssignRoleModal(true);
  };

  const handleRoleSelection = (roleName, isSelected) => {
    if (isSelected) {
      setSelectedMemberRoles(prev => prev.filter(role => role !== roleName));
    } else {
      setSelectedMemberRoles(prev => [...prev, roleName]);
    }
  };

  const saveRoleAssignments = async () => {
    if (!selectedMember) return;
    
    const userId = selectedMember.userId || selectedMember.memberId || selectedMember.user.userId;
    
    try {
      // Update local state
      setAssignedRoles(prev => ({
        ...prev,
        [userId]: [...selectedMemberRoles]
      }));

      // Update API - send all selected roles at once
      if (selectedMemberRoles.length > 0) {
        await addMemberAssignedRole(userId, selectedMeetingId, selectedMemberRoles);
        
        // Update available role counts
        setAvailableRoleCounts(prev => {
          const updated = { ...prev };
          selectedMemberRoles.forEach(roleName => {
            if (updated[roleName] > 0) {
              updated[roleName] -= 1;
            }
          });
          return updated;
        });
      }
      
      setSuccess('Roles updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      setShowAssignRoleModal(false);
    } catch (err) {
      console.error('Error updating role assignments:', err);
      setError('Failed to update role assignments');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getMemberName = (member) => {
    const userId = member.userId || member.memberId || member.user.userId;
    const memberFromList = allMembers.find(m => String(m.userId) === String(userId));
    return memberFromList.userName || member.userName || member.name || member.user.userName || 'Unknown';
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
    setShowRoleForm(false);
    setRoleFormData({ roleName: '', description: '' });
  };

  const handleAddRole = () => {
    setRoleFormData({ roleName: '', description: '' });
    setEditingRole(null);
    setShowRoleForm(true);
  };

  const handleEditRole = (role) => {
    setRoleFormData({
      roleName: role.roleName || role.name || '',
      description: role.description || ''
    });
    setEditingRole(role);
    setShowRoleForm(true);
  };

  const handleDeleteRole = async (role) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this role. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      // Make sure we're using the correct roleId field (role.roleId or role.id)
      const roleId = role.roleId || role.id;
      if (!roleId) {
        throw new Error('No valid role ID found for deletion');
      }
      
      console.log('Deleting role with ID:', roleId);
      await deleteRole(roleId);
      
      // Show success message
      await Swal.fire({
        title: 'Deleted!',
        text: 'The role has been deleted.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      // Refresh roles
      await loadAvailableRoles();
    } catch (err) {
      console.error('Error deleting role:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete role';
      
      await Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleSubmitRole = async (e) => {
    e.preventDefault();
    if (!roleFormData.roleName.trim()) {
      setError('Role name is required');
      return;
    }

    try {
      if (editingRole) {
        // Update existing role
        const roleId = editingRole.roleId || editingRole.id;
        await updateRole(roleId, {
          roleName: roleFormData.roleName,
          description: roleFormData.description
        });
        setSuccess('Role updated successfully');
      } else {
        // Add new role
        await addRole({
          roleName: roleFormData.roleName,
          description: roleFormData.description
        });
        setSuccess('Role added successfully');
      }
      
      // Refresh roles
      await loadAvailableRoles();
      setShowRoleForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving role:', err);
      setError(`Failed to ${editingRole ? 'update' : 'add'} role: ${err.message}`);
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <InputGroup className="me-3" style={{ width: '500px' }}>
            <InputGroup.Text>
              <Search size={16} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
        <div className="d-flex">
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
            <Dropdown drop="down">
              <Dropdown.Toggle 
                variant="outline-secondary" 
                id="meeting-dropdown"
                className="w-100 text-start d-flex justify-content-between align-items-center"
                disabled={loading}
              >
                {selectedMeeting 
                  ? `${formatDate(selectedMeeting.meetingDate)} - ${selectedMeeting.meetingTheme || 'No Theme'}`
                  : 'Select a meeting...'
                }
              </Dropdown.Toggle>

              <Dropdown.Menu 
                className="w-100"
                style={{ 
                  maxHeight: '300px',
                  overflowY: 'auto',
                  width: '100%',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                {meetings.length === 0 ? (
                  <Dropdown.Item disabled>No meetings available</Dropdown.Item>
                ) : (
                  meetings.map((meeting) => (
                    <Dropdown.Item
                      key={meeting.meetingId}
                      onClick={() => {
                        setSelectedMeeting(meeting);
                        setSelectedMeetingId(meeting.meetingId);
                        setAvailableMembers([]);
                        setMemberRoles({});
                        setAssignedRoles({});
                        loadAvailableMembers(meeting.meetingId);
                      }}
                      active={selectedMeetingId === meeting.meetingId}
                    >
                      <div>
                        <strong>{formatDate(meeting.meetingDate)}</strong>
                        <br />
                        <small className="text-muted">{meeting.meetingTheme || 'No Theme'}</small>
                      </div>
                    </Dropdown.Item>
                  ))
                )}
              </Dropdown.Menu>
            </Dropdown>
            {meetings.length > 10 && (
              <Form.Text className="text-muted">
                Showing {meetings.length} meetings. Use search above to filter results.
              </Form.Text>
            )}
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
                <p><strong>Time:</strong> {formatTime(selectedMeeting.startTime)} - {formatTime(selectedMeeting.endTime)}</p>
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
                    <th>ID</th>
                    <th>Member</th>
                    <th>Preferred Roles</th>
                    <th>Assigned Roles</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableMembers.map((member, index) => {
                    const userId = member.userId || member.memberId || member.user.userId;
                    const memberName = getMemberName(member);
                    const preferredRoles = memberRoles[userId] || [];
                    const currentAssignedRoles = assignedRoles[userId] || [];

                    return (
                      <tr key={index} className="border-0">
                        <td className="fw-bold">{member.userId || member.memberId || member.user.userId || 'N/A'}</td>
                        <td>{memberName}</td>
                        <td>
                          {preferredRoles.length > 0 ? (
                            <div className="d-flex flex-column">
                              {preferredRoles.map((role, i) => {
                                const roleName = typeof role === 'object' ? (role.roleName || role.name || JSON.stringify(role)) : String(role);
                                return (
                                  <div key={i} className="me-1 mb-1 d-inline-flex">
                                    <Badge bg="info" className="d-inline-flex align-items-center">
                                      <span className="me-1">{i + 1}.</span>
                                      {roleName}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-muted">No preferences</span>
                          )}
                        </td>
                        <td>
                          {currentAssignedRoles.length > 0 ? (
                            <div className="d-flex flex-column">
                              {currentAssignedRoles.map((role, i) => {
                                const roleName = typeof role === 'object' ? (role.roleName || role.name || JSON.stringify(role)) : String(role);
                                return (
                                  <div key={i} className="me-1 mb-1 d-inline-flex">
                                    <Badge bg="success" className="d-inline-flex align-items-center">
                                      {roleName}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-muted">Not assigned</span>
                          )}
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleOpenAssignRoleModal(member)}
                          >
                            Assign Roles
                          </Button>
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

      {/* Role Assignment Modal */}
      <Modal show={showAssignRoleModal} onHide={() => setShowAssignRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Roles</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMember && (
            <>
              <h5>{getMemberName(selectedMember)}</h5>
              <p className="text-muted">Select roles to assign:</p>
              
              <div className="d-flex flex-wrap gap-2 mb-3">
                {meetingSpecificRoles.length > 0 ? (
                  meetingSpecificRoles
                    .filter(role => {
                      const availableCount = availableRoleCounts[role.roleName] || 0;
                      return availableCount > 0;
                    })
                    .map((role) => {
                      const roleName = role.roleName;
                      const isSelected = selectedMemberRoles.includes(roleName);
                      const availableCount = availableRoleCounts[role.roleName] || 0;
                      return (
                        <Button
                          key={`${role.roleId}-${roleName}`}
                          variant={isSelected ? 'primary' : 'outline-secondary'}
                          className="me-2 mb-2"
                          onClick={() => handleRoleSelection(roleName, isSelected)}
                        >
                          {roleName}
                          {availableCount > 1 && (
                            <Badge bg="light" text="dark" className="ms-1">
                              {availableCount}
                            </Badge>
                          )}
                        </Button>
                      );
                    })
                ) : (
                  <p className="text-muted">No roles available for this meeting</p>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignRoleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveRoleAssignments}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Role Management Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} size="lg" onShow={loadAvailableRoles}>
        <Modal.Header closeButton>
          <Modal.Title>Manage Roles</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoadingRoles ? (
            <div className="text-center my-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading roles...</p>
            </div>
          ) : (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6>
                  All Roles: {allRolesData?.length || 0}
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
              
              {allRolesData.length === 0 ? (
                <Alert variant="info">No roles found. Add your first role to get started.</Alert>
              ) : (
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>Role Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const indexOfLastRole = currentRolePage * ROLES_PER_PAGE;
                        const indexOfFirstRole = indexOfLastRole - ROLES_PER_PAGE;
                        const currentRoles = allRolesData.slice(indexOfFirstRole, indexOfLastRole);
                        
                        return currentRoles.length > 0 ? (
                          currentRoles.map((role, index) => {
                            const actualIndex = indexOfFirstRole + index;
                            return (
                              <tr key={role.roleId || role.id || index}>
                                <td>{actualIndex + 1}</td>
                                <td>{role.roleName || role.name || 'N/A'}</td>
                                <td>{role.description || 'No description available'}</td>
                                <td>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => handleEditRole(role)}
                                    title="Edit Role"
                                  >
                                    <Edit size={14} />
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDeleteRole(role)}
                                    title="Delete Role"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center text-muted py-3">
                              No roles found on this page.
                            </td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </Table>
                </div>
              )}
          
              {totalRolePages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    <Pagination.First 
                      onClick={() => setCurrentRolePage(1)} 
                      disabled={currentRolePage === 1}
                    />
                    <Pagination.Prev 
                      onClick={() => setCurrentRolePage(p => Math.max(1, p - 1))} 
                      disabled={currentRolePage === 1}
                    />
                    
                    {Array.from({ length: Math.min(5, totalRolePages) }, (_, i) => {
                      let pageNum;
                      if (totalRolePages <= 5) {
                        pageNum = i + 1;
                      } else if (currentRolePage <= 3) {
                        pageNum = i + 1;
                      } else if (currentRolePage >= totalRolePages - 2) {
                        pageNum = totalRolePages - 4 + i;
                      } else {
                        pageNum = currentRolePage - 2 + i;
                      }
                      
                      return (
                        <Pagination.Item
                          key={pageNum}
                          active={pageNum === currentRolePage}
                          onClick={() => setCurrentRolePage(pageNum)}
                        >
                          {pageNum}
                        </Pagination.Item>
                      );
                    })}
                    
                    <Pagination.Next 
                      onClick={() => setCurrentRolePage(p => Math.min(totalRolePages, p + 1))} 
                      disabled={currentRolePage === totalRolePages}
                    />
                    <Pagination.Last 
                      onClick={() => setCurrentRolePage(totalRolePages)} 
                      disabled={currentRolePage === totalRolePages}
                    />
                  </Pagination>
                </div>
              )}
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
