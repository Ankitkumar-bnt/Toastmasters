import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { Trophy, User, FileText } from 'lucide-react';
import { getAllMembers } from '../../api/UserApi';
import { getAllMemberAvailabilityByMeetingId } from '../../api/AvailableMembersApi';
import { addMeetingWinner } from '../../api/MeetingWinnerApi';

const AddWinnerModal = ({ show, onHide, meeting, onWinnerAdded }) => {
  const [availableMembers, setAvailableMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && meeting) {
      fetchAvailableMembers();
      // Reset form
      setSelectedUserId('');
      setDescription('');
      setError(null);
    }
  }, [show, meeting]);

  const fetchAvailableMembers = async () => {
    try {
      setMembersLoading(true);
      
      // Fetch all users first
      const usersResponse = await getAllMembers();
      const allUsers = usersResponse.data.data || [];
      setAllUsers(allUsers);
      
      // Fetch availability data for this specific meeting
      const availabilityResponse = await getAllMemberAvailabilityByMeetingId(meeting.meetingId);
      const availabilityData = availabilityResponse.data.data || availabilityResponse.data || [];
      
      // Map availability data to full user objects
      const availableUsers = availabilityData.map(availability => {
        const user = allUsers.find(u => u.userId === availability.userId);
        return user;
      }).filter(user => user !== undefined && Number(user.deleteStatus) === 1);
      
      setAvailableMembers(availableUsers);
      
      // If no available members found, fallback to all active members
      if (availableUsers.length === 0) {
        const activeMembers = allUsers.filter(member => 
          Number(member.deleteStatus) === 1
        );
        setAvailableMembers(activeMembers);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load available members.');
      
      // Fallback to all members if API fails
      try {
        const response = await getAllMembers();
        const activeMembers = response.data.data.filter(member => 
          Number(member.deleteStatus) === 1
        );
        setAvailableMembers(activeMembers);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
    } finally {
      setMembersLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUserId || !description.trim()) {
      setError('Please select a member and provide a description.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const winnerData = {
        meetingId: meeting.meetingId,
        userId: parseInt(selectedUserId),
        description: description.trim()
      };
      
      await addMeetingWinner(winnerData);
      
      onWinnerAdded?.();
      onHide();
    } catch (err) {
      console.error('Error adding winner:', err);
      setError('Failed to add winner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>
          <Trophy size={24} className="me-2" />
          Add Meeting Winner
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {meeting && (
            <div className="mb-4 p-3 bg-light rounded">
              <h6 className="fw-bold">{meeting.meetingTheme || 'No Theme'}</h6>
              <small className="text-muted">
                {formatDate(meeting.meetingDate)} • {meeting.category || 'Regular'}
              </small>
            </div>
          )}

          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>
              <User size={16} className="me-2" />
              Select Winner
            </Form.Label>
            {membersLoading ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" />
                <small className="ms-2">Loading members...</small>
              </div>
            ) : (
              <Form.Select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
              >
                <option value="">Choose a member...</option>
                {availableMembers.map(member => (
                  <option key={member.userId} value={member.userId}>
                    {member.userName} ({member.userEmail})
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <FileText size={16} className="me-2" />
              Description
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Describe why this member won (e.g., Best Speech, Most Improved, etc.)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            type="submit" 
            disabled={loading || membersLoading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Adding...
              </>
            ) : (
              <>
                <Trophy size={16} className="me-2" />
                Add Winner
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddWinnerModal;
