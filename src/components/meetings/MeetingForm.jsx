import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { getAllMeetings, addMeeting, getMeetingByTheme, updateMeeting } from '../../api/MeetingApi';
import { getAllRoles } from '../../api/RoleApi';
import { getAllMeetingRoleByMeetingId, addMeetingRoles } from '../../api/MeetingRoleApi';
import { getAllGuest } from '../../api/UserApi';
import { addAvailabilityOfGuest } from '../../api/AvailableMembersApi';

const MeetingForm = ({ show, onHide, onSubmit, editingMeeting, title }) => {
  const [formData, setFormData] = useState({
    meetingDate: '',
    startTime: '17:30',
    endTime: '19:30',
    meetingTheme: '',
    meetingLocation: '',
    category: 'Regular'
  });
  const [loading, setLoading] = useState(false);
  const [existingMeetings, setExistingMeetings] = useState([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [roleLoading, setRoleLoading] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [availableGuests, setAvailableGuests] = useState([]);
  const [guestLoading, setGuestLoading] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState({}); // { [userId]: true }

  // Helpers to normalize date/time formats coming from API/UI
  const normalizeDate = (d) => {
    if (!d) return '';
    try {
      const s = String(d);
      if (s.includes('T')) return s.split('T')[0];
      return s.slice(0, 10);
    } catch {
      return '';
    }
  };

  const fetchGuests = async () => {
    try {
      setGuestLoading(true);
      const response = await getAllGuest();
      const guests = response?.data?.data || response?.data || [];
      setAvailableGuests(Array.isArray(guests) ? guests : []);
    } catch (error) {
      console.error('Error fetching guests:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch guests. Please try again.',
      });
    } finally {
      setGuestLoading(false);
    }
  };

  const normalizeTime = (t) => {
    if (t == null) return '';
    const s = String(t);
    const raw = s.includes('T') ? s.split('T')[1] : s;
    const [hh, mm] = raw.split(':');
    if (!hh) return '';
    const norm = `${String(hh).padStart(2, '0')}:${String(mm || '00').padStart(2, '0')}`;
    return norm;
  };

  const timesEqual = (aStart, aEnd, bStart, bEnd) => {
    return (
      normalizeTime(aStart) === normalizeTime(bStart) &&
      normalizeTime(aEnd) === normalizeTime(bEnd)
    );
  };

  const findNextAvailableSaturday = (startFrom, meetings) => {
    let checkDate = startFrom ? new Date(startFrom) : new Date();

    const dayOfWeek = checkDate.getDay(); // 0 = Sun, 6 = Sat
    let daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
    checkDate.setDate(checkDate.getDate() + daysUntilSaturday);

    for (let i = 0; i < 52; i++) {
      const dateStr = checkDate.toISOString().split('T')[0]; // candidate Saturday

      const hasMeeting = (meetings || []).some(m => {
        if (!m || !m.meetingDate) return false;
        const dbDateStr = m.meetingDate.split('T')[0];
        return dbDateStr === dateStr;
      });

      if (!hasMeeting) {
        return dateStr; 
      }

      checkDate.setDate(checkDate.getDate() + 7);
    }

    return checkDate.toISOString().split('T')[0]; // fallback
  };

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await getAllMeetings();
        const meetings = response?.data?.data || response?.data || [];
        const meetingsArray = Array.isArray(meetings) ? meetings : [];
        setExistingMeetings(meetingsArray);

        if (!editingMeeting) {
          const nextAvailable = findNextAvailableSaturday(new Date(), meetingsArray);
          setFormData(prev => ({
            ...prev,
            meetingDate: nextAvailable
          }));
        }
      } catch (error) {
        console.error('Error fetching meetings:', error);

        // fallback: just pick the next Saturday
        if (!editingMeeting) {
          const today = new Date();
          const dayOfWeek = today.getDay();
          const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
          const nextSaturday = new Date(today);
          nextSaturday.setDate(today.getDate() + daysUntilSaturday);

          setFormData(prev => ({
            ...prev,
            meetingDate: nextSaturday.toISOString().split('T')[0]
          }));
        }
      }
    };

    if (!editingMeeting && show) {
      fetchMeetings();
    }
  }, [editingMeeting, show]);

  // Load data when editing
  useEffect(() => {
    if (editingMeeting) {
      setFormData({
        meetingDate: editingMeeting.meetingDate
          ? editingMeeting.meetingDate.split('T')[0]
          : '',
        startTime: editingMeeting.startTime || '',
        endTime: editingMeeting.endTime || '',
        meetingTheme: editingMeeting.meetingTheme || '',
        meetingLocation: editingMeeting.meetingLocation || '',
        category: editingMeeting.category || 'Regular'
      });

      // Preload roles for this meeting when editing
      const loadMeetingRoles = async () => {
        try {
          const mid = editingMeeting.meetingId ?? editingMeeting.id;
          if (!mid) return;
          const res = await getAllMeetingRoleByMeetingId(mid);
          const items = res?.data?.data || res?.data || [];
          console.log('Meeting roles from server (edit mode):', items);
          
          if (Array.isArray(items)) {
            const mapped = {};
            for (const mr of items) {
              // Try different possible field names for role ID
              const rid = mr.roleId ?? mr.role?.roleId ?? mr.role?.id ?? mr.id;
              const countVal = mr.roleCount ?? mr.count ?? mr.role_count ?? 1;
              const roleName = mr.roleName ?? mr.role?.roleName;
              
              console.log('Processing role (edit mode):', { rid, countVal, roleName, fullObject: mr });
              
              if (rid != null) {
                mapped[rid] = { selected: true, count: String(countVal) };
              } else if (roleName) {
                // If we have roleName but no roleId, we'll need to match it later when availableRoles is loaded
                mapped[`roleName_${roleName}`] = { selected: true, count: String(countVal), roleName };
              }
            }
            console.log('Mapped selected roles (edit mode):', mapped);
            setSelectedRoles(mapped);
          }
        } catch (e) {
          console.error('Failed to load meeting roles:', e);
        }
      };
      loadMeetingRoles();
    } else {
      // Clear selected roles for new meetings
      setSelectedRoles({});
      setSelectedGuests({});
    }
  }, [editingMeeting]);

  // Removed auto-open of roles modal; it opens only on Add Roles button

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchRoles = async () => {
    try {
      setRoleLoading(true);
      const response = await getAllRoles();
      const roles = response?.data?.data || response?.data || [];
      setAvailableRoles(Array.isArray(roles) ? roles : []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch roles. Please try again.',
      });
    } finally {
      setRoleLoading(false);
    }
  };

  const handleAddRoles = async () => {
    // Ensure roles list is present
    if (availableRoles.length === 0) {
      await fetchRoles();
    }

    setShowRoleModal(true);
  };

  const handleAddGuests = async () => {
    setSelectedGuests({}); // Clear previous selections
    if (availableGuests.length === 0) {
      await fetchGuests();
    }
    setShowGuestModal(true);
  };

  const handleGuestSelection = (userId, isSelected) => {
    setSelectedGuests(prev => {
      const updated = { ...prev };
      if (isSelected) {
        updated[userId] = true;
      } else {
        delete updated[userId];
      }
      return updated;
    });
  };

  const handleSelectAllGuests = (isSelected) => {
    if (isSelected) {
      const allGuestIds = {};
      availableGuests.forEach(guest => {
        allGuestIds[guest.userId] = true;
      });
      setSelectedGuests(allGuestIds);
    } else {
      setSelectedGuests({});
    }
  };

  const handleGuestModalSave = () => {
    const count = Object.keys(selectedGuests).filter(id => selectedGuests[id]).length;
    if (count === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Guests Selected',
        text: 'Please select at least one guest.',
      });
      return;
    }

    // Do NOT persist here. Persist only in handleSubmit (Add/Update Meeting).
    setShowGuestModal(false);
    Swal.fire({
      icon: 'info',
      title: 'Guests Selected',
      text: `${count} guest(s) selected. They will be saved when you ${editingMeeting ? 'update' : 'create'} the meeting.`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleRoleSelection = (roleId, isSelected) => {
    setSelectedRoles(prev => {
      const updated = { ...prev };
      if (isSelected) {
        updated[roleId] = { selected: true, count: '1' };
      } else {
        delete updated[roleId];
      }
      return updated;
    });
  };

  const handleRoleCountChange = (roleId, count) => {
    // allow empty string during typing; normalize later on submit
    const next = count === '' ? '' : count;
    setSelectedRoles(prev => ({
      ...prev,
      [roleId]: { ...prev[roleId], count: next }
    }));
  };

  const handleRoleModalSave = () => {
    setShowRoleModal(false);
    Swal.fire({
      icon: 'success',
      title: 'Roles Added',
      text: `${Object.keys(selectedRoles).length} roles selected for this meeting.`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.meetingDate || !formData.startTime || !formData.endTime ||
      !formData.meetingTheme || !formData.meetingLocation) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields.',
      });
      return;
    }

    if (formData.startTime >= formData.endTime) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Time',
        text: 'End time must be after start time.',
      });
      return;
    }

    // Require at least one role when creating a new meeting
    if (!editingMeeting && Object.keys(selectedRoles).length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Roles Required',
        text: 'Please click "Add Roles" and select at least one role for this meeting.',
      });
      return;
    }

    // Duplicate meeting checks (only for creating a new meeting)
    if (!editingMeeting) {
      const targetDate = normalizeDate(formData.meetingDate);
      const targetStart = normalizeTime(formData.startTime);
      const targetEnd = normalizeTime(formData.endTime);

      // Use already loaded meetings; if empty, try to fetch quickly
      let meetingsForCheck = existingMeetings;
      if (!meetingsForCheck || meetingsForCheck.length === 0) {
        try {
          const resp = await getAllMeetings();
          const data = resp?.data?.data || resp?.data || [];
          meetingsForCheck = Array.isArray(data) ? data : [];
        } catch (e) {
          // Ignore fetch error; proceed without duplicate check
        }
      }

      const sameDateMeetings = (meetingsForCheck || []).filter(
        (m) => normalizeDate(m?.meetingDate) === targetDate
      );

      // Exact same date & time should be blocked
      const exactConflict = sameDateMeetings.find((m) =>
        timesEqual(m?.startTime, m?.endTime, targetStart, targetEnd)
      );
      if (exactConflict) {
        await Swal.fire({
          icon: 'error',
          title: 'Duplicate Meeting',
          text: 'A meeting already exists on this date with the same time. Please choose a different time.',
        });
        return;
      }

      // Same date but different time: warn and ask for confirmation
      if (sameDateMeetings.length > 0) {
        const existingTimeRanges = sameDateMeetings
          .map((m) => `${normalizeTime(m?.startTime)} - ${normalizeTime(m?.endTime)}`)
          .join(', ');

        const res = await Swal.fire({
          icon: 'warning',
          title: 'Meeting already scheduled on this date',
          html: `Existing time(s): <b>${existingTimeRanges}</b>.<br/>Do you still want to create another meeting on the same date?`,
          showCancelButton: true,
          confirmButtonText: 'Yes, create',
          cancelButtonText: 'No',
          reverseButtons: true,
        });

        if (!res.isConfirmed) {
          return;
        }
      }
    }

    try {
      setLoading(true);

      if (editingMeeting) {
        // For editing meeting, update meeting first then update roles
        console.log('Editing meeting - Step 1: Updating meeting...');
        await updateMeeting(editingMeeting.meetingId, formData);
        
        // Step 2: Build rolesMap with roleName as key and count as value
        const rolesMap = {};
        for (const [roleId, roleInfo] of Object.entries(selectedRoles)) {
          if (roleInfo.selected) {
            // Find the role name from availableRoles
            const role = availableRoles.find(r => (r.roleId || r.id) === parseInt(roleId));
            if (role && role.roleName) {
              const count = parseInt(roleInfo.count, 10);
              const safeCount = Number.isFinite(count) && count >= 1 ? count : 1;
              rolesMap[role.roleName] = safeCount;
            }
          }
        }
        
        // Step 3: Update meeting roles using addMeetingRoles API
        if (Object.keys(rolesMap).length > 0) {
          console.log('Editing meeting - Step 2: Updating meeting roles...');
          console.log('Meeting ID:', editingMeeting.meetingId);
          console.log('Roles map (roleName → count):', rolesMap);
          await addMeetingRoles(editingMeeting.meetingId, rolesMap);
        }
        
        // Optionally add guest availability when editing
        if (Object.keys(selectedGuests).length > 0) {
          try {
            const ids = Object.keys(selectedGuests).map(id => parseInt(id, 10)).filter(Number.isFinite);
            for (const uid of ids) {
              await addAvailabilityOfGuest(uid, editingMeeting.meetingId);
            }
          } catch (e) {
            console.warn('Failed to add guest availability (edit mode):', e);
          }
        }

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Meeting, roles and guest availability updated successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // For new meeting, implement the three-step API sequence
        
        // Step 1: Call addMeeting API and capture response
        const meetingPayload = {
          ...formData,
          deleteStatus: 1
        };
        
        console.log('Step 1: Creating meeting...');
        const addMeetingResponse = await addMeeting(meetingPayload);
        console.log('Add meeting response:', addMeetingResponse);
        
        // Step 2: Try to get meeting ID from addMeeting response first
        let newMeetingId = null;
        const responseData = addMeetingResponse?.data?.data || addMeetingResponse?.data || addMeetingResponse;
        
        if (responseData) {
          newMeetingId = responseData.meetingId || 
                        responseData.id || 
                        responseData.meeting?.meetingId || 
                        responseData.meeting?.id;
        }
        
        console.log('Meeting ID from addMeeting response:', newMeetingId);
        
        // Fallback: If no ID from response, try getMeetingByTheme
        if (!newMeetingId) {
          console.log('Fallback: Using getMeetingByTheme...');
          try {
            const themeResponse = await getMeetingByTheme(formData.meetingTheme);
            const meetings = themeResponse?.data?.data || themeResponse?.data || [];
            
            if (Array.isArray(meetings) && meetings.length > 0) {
              const sortedMeetings = meetings.sort((a, b) => {
                const dateA = new Date(a.meetingDate || a.createdAt);
                const dateB = new Date(b.meetingDate || b.createdAt);
                return dateB.getTime() - dateA.getTime();
              });
              newMeetingId = sortedMeetings[0].meetingId || sortedMeetings[0].id;
            }
          } catch (themeError) {
            console.warn('getMeetingByTheme failed:', themeError);
          }
        }
        
        // Final fallback: Use getAllMeetings
        if (!newMeetingId) {
          console.log('Final fallback: Using getAllMeetings...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for DB update
          
          const allMeetingsResponse = await getAllMeetings();
          const allMeetings = allMeetingsResponse?.data?.data || allMeetingsResponse?.data || [];
          
          if (Array.isArray(allMeetings)) {
            const recentMeeting = allMeetings
              .filter(meeting => 
                meeting.meetingTheme === formData.meetingTheme &&
                meeting.meetingDate === formData.meetingDate &&
                meeting.meetingLocation === formData.meetingLocation
              )
              .sort((a, b) => {
                const dateA = new Date(a.meetingDate || a.createdAt);
                const dateB = new Date(b.meetingDate || b.createdAt);
                return dateB.getTime() - dateA.getTime();
              })[0];
            
            if (recentMeeting) {
              newMeetingId = recentMeeting.meetingId || recentMeeting.id;
            }
          }
        }
        
        if (!newMeetingId) {
          throw new Error('Could not retrieve the newly created meeting ID using any method');
        }
        
        console.log('Final meeting ID:', newMeetingId);
        
        // Step 3: Build rolesMap with roleName as key and count as value
        const rolesMap = {};
        for (const [roleId, roleInfo] of Object.entries(selectedRoles)) {
          if (roleInfo.selected) {
            // Find the role name from availableRoles
            const role = availableRoles.find(r => (r.roleId || r.id) === parseInt(roleId));
            if (role && role.roleName) {
              const count = parseInt(roleInfo.count, 10);
              const safeCount = Number.isFinite(count) && count >= 1 ? count : 1;
              rolesMap[role.roleName] = safeCount;
            }
          }
        }
        
        // Step 4: Call addMeetingRoles API with roleName → count format
        if (Object.keys(rolesMap).length > 0) {
          console.log('Step 4: Adding meeting roles...');
          console.log('Meeting ID:', newMeetingId);
          console.log('Roles map (roleName → count):', rolesMap);
          await addMeetingRoles(newMeetingId, rolesMap);
        }

        // Step 5: Add guest availability for selected guests
        if (Object.keys(selectedGuests).length > 0) {
          console.log('Step 5: Adding guest availability...');
          const ids = Object.keys(selectedGuests).map(id => parseInt(id, 10)).filter(Number.isFinite);
          for (const uid of ids) {
            try {
              await addAvailabilityOfGuest(uid, newMeetingId);
            } catch (e) {
              console.warn('Failed to add availability for guest', uid, e);
            }
          }
        }
        
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Meeting, roles and guest availability added successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
      }
      
      // Refresh the meetings list before closing the modal
      try {
        // Force refresh the meetings list by calling getAllMeetings
        const refreshResponse = await getAllMeetings();
        console.log('Meetings list refreshed after creation');
        
        // Also call the parent's onSubmit if available (for additional refresh logic)
        if (onSubmit && typeof onSubmit === 'function') {
          await onSubmit({ refresh: true });
        }
      } catch (err) {
        console.warn('Failed to refresh meetings list:', err);
      }
      
      onHide();
      setSelectedRoles({});
      
    } catch (err) {
      console.error('Error submitting meeting:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || err.message || 'Failed to save meeting. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Meeting Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="meetingDate"
                  value={formData.meetingDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]} // prevent past dates
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Meeting Location *</Form.Label>
                <Form.Control
                  type="text"
                  name="meetingLocation"
                  value={formData.meetingLocation}
                  onChange={handleChange}
                  placeholder="Enter meeting location"
                  maxLength={100}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Time *</Form.Label>
                <Form.Control
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Time *</Form.Label>
                <Form.Control
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="align-items-end">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Meeting Type *</Form.Label>
                {editingMeeting && editingMeeting.__viewOnly ? (
                  <Form.Control
                    type="text"
                    name="category"
                    value={formData.category}
                    readOnly
                    className="bg-light"
                  />
                ) : (
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="Regular">Regular</option>
                    <option value="Special">Special</option>
                    <option value="Contest">Contest</option>
                  </Form.Select>
                )}
              </Form.Group>
            </Col>
            <Col md={3} className="text-end">
              <Button
                variant="info"
                onClick={handleAddRoles}
                disabled={loading}
                className="mb-3"
              >
                Add Roles ({Object.keys(selectedRoles).length})
              </Button>
            </Col>
            <Col md={3} className="text-end">
              <Button
                variant="secondary"
                onClick={handleAddGuests}
                disabled={loading}
                className="mb-3"
              >
                Add Guests ({Object.keys(selectedGuests).length})
              </Button>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Meeting Theme *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="meetingTheme"
              value={formData.meetingTheme}
              onChange={handleChange}
              placeholder="Enter meeting theme or agenda"
              maxLength={350}
              required
            />
            <Form.Text className="text-muted">
              Maximum 350 characters
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-end w-100">
            <Button variant="secondary" onClick={onHide} disabled={loading} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : (editingMeeting ? 'Update Meeting' : 'Add Meeting')}
            </Button>
          </div>
        </Modal.Footer>
      </Form>

      {/* Role Selection Modal */}
      <Modal 
        show={showRoleModal} 
        onHide={() => setShowRoleModal(false)} 
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Roles to Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {roleLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading roles...</span>
              </div>
              <p className="mt-2">Loading roles...</p>
            </div>
          ) : (
            <>
              {availableRoles.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th width="50">Select</th>
                      <th>Role Name</th>
                      <th width="100">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableRoles.map((role) => (
                      <tr key={role.roleId ?? role.id}>
                        <td className="text-center">
                          <Form.Check
                            type="checkbox"
                            checked={selectedRoles[role.roleId ?? role.id]?.selected || false}
                            onChange={(e) => handleRoleSelection((role.roleId ?? role.id), e.target.checked)}
                          />
                        </td>
                        <td>
                          <strong>{role.roleName}</strong>
                          {role.roleDescription && (
                            <div className="text-muted small">{role.roleDescription}</div>
                          )}
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            min="1"
                            max="10"
                            value={selectedRoles[role.roleId ?? role.id]?.count ?? ''}
                            onChange={(e) => handleRoleCountChange((role.roleId ?? role.id), e.target.value)}
                            disabled={!selectedRoles[role.roleId ?? role.id]?.selected}
                            size="sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No roles available. Please add roles first.</p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between w-100">
            <div className="text-muted">
              {Object.keys(selectedRoles).length} role(s) selected
            </div>
            <div>
              <Button 
                variant="secondary" 
                onClick={() => setShowRoleModal(false)}
                className="me-2"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleRoleModalSave}
                disabled={Object.keys(selectedRoles).length === 0}
              >
                Save Roles
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Guest Selection Modal */}
      <Modal
        show={showGuestModal}
        onHide={() => setShowGuestModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Guests to Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {guestLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading guests...</span>
              </div>
              <p className="mt-2">Loading guests...</p>
            </div>
          ) : (
            <>
              {availableGuests.length > 0 ? (
                <div className="table-responsive">
                  <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>
                        <Form.Check
                          type="checkbox"
                          checked={availableGuests.length > 0 && Object.keys(selectedGuests).length === availableGuests.length}
                          onChange={(e) => handleSelectAllGuests(e.target.checked)}
                          aria-label="Select all guests"
                        />
                      </th>
                      <th style={{ minWidth: '150px' }}>Name</th>
                      <th style={{ minWidth: '200px' }}>Email</th>
                      <th style={{ minWidth: '120px' }}>Contact</th>
                      <th style={{ width: '100px' }}>Gender</th>
                      <th style={{ width: '120px' }}>DOB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableGuests.map((g) => (
                      <tr key={g.userId}>
                        <td className="text-center">
                          <Form.Check
                            type="checkbox"
                            checked={!!selectedGuests[g.userId]}
                            onChange={(e) => handleGuestSelection(g.userId, e.target.checked)}
                            aria-label={`Select ${g.userName}`}
                          />
                        </td>
                        <td>{g.userName}</td>
                        <td>{g.userEmail}</td>
                        <td>{g.userContact}</td>
                        <td>{g.gender}</td>
                        <td>{g.dob ? new Date(g.dob).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No guests found.</p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between w-100">
            <div className="text-muted">
              {Object.keys(selectedGuests).length} guest(s) selected
            </div>
            <div>
              <Button
                variant="secondary"
                onClick={() => setShowGuestModal(false)}
                className="me-2"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleGuestModalSave()}
                disabled={Object.keys(selectedGuests).length === 0}
              >
                Save Guests
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
};

export default MeetingForm;
