import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Table, Button, Form, Alert, Spinner, Dropdown } from 'react-bootstrap';
import { Clock, Plus, Save, ArrowLeft, Trash2 } from 'lucide-react';
import { getAgenda, addAgendaRows } from '../../api/AgendaJoinApi';
import { getUserById, getAllMembers } from '../../api/UserApi';
import { getAllMemberAvailability } from '../../api/AvailableMembersApi';

const UpdateAgenda = ({ meetingId, onBack }) => {
  
  const [agendaData, setAgendaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userCache, setUserCache] = useState({});
  const [availableMembers, setAvailableMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const allowDrag = useRef(false);
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    if (meetingId) {
      loadAgendaData();
      loadAvailableMembers();
    }
  }, [meetingId]);

  const loadAgendaData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAgenda(meetingId);
      const agenda = response.data.data?.agenda || [];
      
      // Transform agenda data to include editable fields
      const editableAgenda = agenda.map((item, index) => ({
        ...item,
        id: item.agendaId || `temp-${index}`,
        isNew: false
      }));
      
      setAgendaData(editableAgenda);
    } catch (err) {
      console.error('Error loading agenda:', err);
      setError('Failed to load agenda data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableMembers = async () => {
    try {
      console.log('=== DEBUGGING MEMBER LOADING ===');
      
      // Load all members first
      const membersResponse = await getAllMembers();
      console.log('Full members response:', membersResponse);
      console.log('Members response data:', membersResponse.data);
      
      // Try different possible response structures
      const members = membersResponse.data?.data || membersResponse.data || [];
      console.log('Extracted members array:', members);
      setAllMembers(members);

      // Load availability data
      const availabilityResponse = await getAllMemberAvailability();
      console.log('Full availability response:', availabilityResponse);
      console.log('Availability response data:', availabilityResponse.data);
      
      const allAvailability = availabilityResponse.data?.data || availabilityResponse.data || [];
      console.log('Extracted availability array:', allAvailability);
      console.log('Current meetingId (string):', meetingId);
      console.log('Current meetingId (number):', parseInt(meetingId));
      
      // If no availability data, use all members
      if (allAvailability.length === 0) {
        console.log('No availability data found, using all members');
        const memberDetails = members.map(member => ({
          userId: member.userId,
          userName: member.userName,
          userEmail: member.userEmail
        }));
        console.log('All member details:', memberDetails);
        setAvailableMembers(memberDetails);
        return;
      }
      
      // Filter members available for this specific meeting
      // Based on entity: status = 1 means Available
      const availableForMeeting = allAvailability.filter(
        (availability) => {
          console.log('Checking availability item:', availability);
          
          // Check if availability has meeting object or meetingId
          const meetingIdToCheck = availability.meeting?.meetingId || availability.meetingId;
          const userIdToCheck = availability.user?.userId || availability.userId;
          
          console.log('Meeting ID to check:', meetingIdToCheck, 'Status:', availability.status);
          
          return meetingIdToCheck === parseInt(meetingId) && 
                 availability.status === 1; // 1 means Available
        }
      );

      console.log('Available for meeting (filtered):', availableForMeeting);

      // Get member details for available members
      const availableMemberDetails = availableForMeeting.map(availability => {
        const userIdToFind = availability.user?.userId || availability.userId;
        const member = members.find(m => m.userId === userIdToFind);
        console.log('Looking for user ID:', userIdToFind, 'Found member:', member);
        return member ? {
          userId: member.userId,
          userName: member.userName,
          userEmail: member.userEmail
        } : null;
      }).filter(Boolean);

      console.log('Final available member details:', availableMemberDetails);
      
      // If no available members found, fallback to all members
      if (availableMemberDetails.length === 0) {
        console.log('No available members found, falling back to all members');
        const memberDetails = members.map(member => ({
          userId: member.userId,
          userName: member.userName,
          userEmail: member.userEmail
        }));
        setAvailableMembers(memberDetails);
      } else {
        setAvailableMembers(availableMemberDetails);
      }
      
    } catch (err) {
      console.error('Error loading available members:', err);
      // Fallback to all members if availability API fails
      try {
        const membersResponse = await getAllMembers();
        const members = membersResponse.data?.data || membersResponse.data || [];
        const memberDetails = members.map(member => ({
          userId: member.userId,
          userName: member.userName,
          userEmail: member.userEmail
        }));
        console.log('Fallback member details:', memberDetails);
        setAvailableMembers(memberDetails);
      } catch (fallbackErr) {
        console.error('Error loading fallback members:', fallbackErr);
      }
    }
  };

  const fetchUserData = async (userId) => {
    if (userCache[userId]) return userCache[userId];

    try {
      const response = await getUserById(userId);
      const userData = response.data.data;
      setUserCache(prev => ({ ...prev, [userId]: userData }));
      return userData;
    } catch (err) {
      console.error(`Error fetching user ${userId}:`, err);
      const fallbackUser = { userName: `User ${userId}`, userEmail: 'N/A' };
      setUserCache(prev => ({ ...prev, [userId]: fallbackUser }));
      return fallbackUser;
    }
  };

  const handleAddRow = () => {
    const newRow = {
      id: `new-${Date.now()}`,
      activity: '',
      minTime: 0,
      avgTime: 0,
      maxTime: 0,
      userId: '',
      meetingId: parseInt(meetingId),
      isNew: true
    };
    
    setAgendaData(prev => [...prev, newRow]);
  };

  const handleInputChange = (id, field, value) => {
    setAgendaData(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const handleDeleteRow = (id) => {
    setAgendaData(prev => prev.filter(item => item.id !== id));
  };

  // Drag and Drop handlers
  const handleDragStart = (e, index) => {
    // Only allow drag if mousedown did not start on the Time cell
    if (!allowDrag.current) {
      e.preventDefault();
      return;
    }
    setDragIndex(index);
    try {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    } catch (_) {
      // ignore if dataTransfer not available
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const fromIndex = dragIndex;
    if (fromIndex === null || fromIndex === dropIndex) return;
    const newOrder = [...agendaData];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(dropIndex, 0, moved);
    setAgendaData(newOrder);
    setDragIndex(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Validate required fields
      const invalidRows = agendaData.filter(row => 
        !row.activity.trim() || !row.userId || row.maxTime <= 0
      );
      
      if (invalidRows.length > 0) {
        setError('Please fill in all required fields (Activity, Presenter, and Max Time) for all rows.');
        return;
      }

      // Prepare data for API - only send new rows or modified rows
      const rowsToSave = agendaData.map(row => ({
        activity: row.activity,
        minTime: row.minTime,
        avgTime: row.avgTime,
        maxTime: row.maxTime,
        userId: parseInt(row.userId),
        meetingId: parseInt(meetingId)
      }));

      await addAgendaRows(rowsToSave);
      
      setSuccess(true);
      setTimeout(() => {
        if (onBack) onBack();
      }, 1000);
      
    } catch (err) {
      console.error('Error saving agenda:', err);
      setError('Failed to save agenda. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getSelectedMemberName = (userId) => {
    if (!userId) return "Select a presenter";
    const member = availableMembers.find(m => m.userId === parseInt(userId));
    return member ? `ID:${member.userId} ${member.userName}` : `ID:${userId}`;
  };

  if (loading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading agenda data...</p>
      </div>
    );
  }

  return (
    <>
      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <Button 
                  variant="light" 
                  size="sm" 
                  className="me-3"
                  onClick={onBack}
                >
                  <ArrowLeft size={16} className="me-1" />
                  Back
                </Button>
                <h5 className="mb-0">
                  <Clock className="me-2" size={20} />
                  Update Meeting Agenda
                </h5>
              </div>
              <div>
                <Button 
                  variant="light"
                  className="text-dark"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving || agendaData.length === 0}
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-1" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="me-1" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </Card.Header>
            
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert variant="success">
                  Agenda saved successfully! Redirecting to agenda view...
                </Alert>
              )}

              {agendaData.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No agenda items found. Click "Add Row" to create new agenda items.</p>
                </div>
              ) : (
                <Table responsive bordered hover>
                  <thead>
                    <tr className="text-center">
                      <th style={{ width: '15%' }}>Time</th>
                      <th style={{ width: '10%' }}>Min</th>
                      <th style={{ width: '10%' }}>Avg</th>
                      <th style={{ width: '10%' }}>Max</th>
                      <th style={{ width: '35%' }}>Activity</th>
                      <th style={{ width: '15%' }}>Presenter</th>
                      <th style={{ width: '5%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendaData.map((item, index) => {
                      // Calculate time for this row
                      let currentTime = 0; // Start time in minutes (assuming meeting starts at 0:00)
      
                      // Parse time string to minutes for calculation
                      const parseTimeToMinutes = (timeStr) => {
                        if (!timeStr || timeStr === '') return 0;
        
                        // Handle format like "2:30" or "2" or "30"
                        if (timeStr.includes(':')) {
                          const parts = timeStr.split(':');
                          const hours = parseInt(parts[0]) || 0;
                          const minutes = parseInt(parts[1]) || 0;
                          return hours * 60 + minutes;
                        } else {
                          // If no colon, treat as minutes
                          return parseInt(timeStr) || 0;
                        }
                      };

                      // Calculate cumulative time for the "Time" column
                      for (let i = 0; i < index; i++) {
                        currentTime += parseTimeToMinutes(agendaData[i].maxTime);
                      }

                      const formatTime = (minutes) => {
                        const hours = Math.floor(minutes / 60);
                        const mins = minutes % 60;
                        const displayHour = hours % 12 || 12;
                        const ampm = hours >= 12 ? "PM" : "AM";
                        return `${displayHour}:${mins.toString().padStart(2, "0")} ${ampm}`;
                      };

                      return (
                        <tr 
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                        >
                          <td 
                            className="text-center align-middle"
                            onMouseDown={() => { allowDrag.current = false; }}
                          >
                            <strong>{formatTime(currentTime)}</strong>
                          </td>
                          <td onMouseDown={() => { allowDrag.current = true; }}>
                            <Form.Control
                              type="text"
                              value={item.minTime || ''}
                              onChange={(e) => handleInputChange(item.id, 'minTime', e.target.value)}
                              placeholder="e.g. 2:30"
                            />
                          </td>
                          <td onMouseDown={() => { allowDrag.current = true; }}>
                            <Form.Control
                              type="text"
                              value={item.avgTime || ''}
                              onChange={(e) => handleInputChange(item.id, 'avgTime', e.target.value)}
                              placeholder="e.g. 3:00"
                            />
                          </td>
                          <td onMouseDown={() => { allowDrag.current = true; }}>
                            <Form.Control
                              type="text"
                              value={item.maxTime || ''}
                              onChange={(e) => handleInputChange(item.id, 'maxTime', e.target.value)}
                              placeholder="e.g. 4:00"
                              required
                            />
                          </td>
                          <td onMouseDown={() => { allowDrag.current = true; }}>
                            <Form.Control
                              type="text"
                              value={item.activity}
                              onChange={(e) => handleInputChange(item.id, 'activity', e.target.value)}
                              placeholder="Enter activity description"
                              required
                            />
                          </td>
                          <td onMouseDown={() => { allowDrag.current = true; }}>
                            <Dropdown>
                              <Dropdown.Toggle 
                                variant="outline-secondary" 
                                size="sm" 
                                className="w-100 text-center"
                                style={{ textAlign: 'center', paddingRight: '1.5rem' }}
                              >
                                {getSelectedMemberName(item.userId)}
                              </Dropdown.Toggle>
                              <Dropdown.Menu className="w-100" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                <Dropdown.Item 
                                  onClick={() => handleInputChange(item.id, 'userId', '')}
                                >
                                  <em>Select a presenter</em>
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                {availableMembers.map((member) => (
                                  <Dropdown.Item
                                    key={member.userId}
                                    onClick={() => handleInputChange(item.id, 'userId', member.userId)}
                                  >
                                    ID:{member.userId} {member.userName}
                                  </Dropdown.Item>
                                ))}
                                {availableMembers.length === 0 && (
                                  <Dropdown.Item disabled>
                                    <em>No available members found</em>
                                  </Dropdown.Item>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                          <td className="text-center">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteRow(item.id)}
                              title="Delete row"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
              
              <div className="mt-3 d-flex justify-content-end">
                <Button 
                  variant="outline-primary" 
                  className="me-2"
                  onClick={handleAddRow}
                >
                  <Plus size={16} className="me-1" />
                  Add Row
                </Button>
                <Button 
                  variant="success"
                  onClick={handleSave}
                  disabled={saving || agendaData.length === 0}
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-1" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="me-1" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default UpdateAgenda;