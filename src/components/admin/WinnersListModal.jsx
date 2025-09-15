import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { Trophy, Edit, Trash2, User, FileText } from 'lucide-react';
import { getMeetingWinnersByMeeting, deleteMeetingWinner, updateMeetingWinner } from '../../api/MeetingWinnerApi';
import { getAllMembers } from '../../api/UserApi';
import { getAllMemberAvailabilityByMeetingId } from '../../api/AvailableMembersApi';

const WinnersListModal = ({ show, onHide, meeting, readOnly = false }) => {
  const [winners, setWinners] = useState([]);
  const [users, setUsers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingWinner, setEditingWinner] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editUserId, setEditUserId] = useState('');

  useEffect(() => {
    if (show && meeting) {
      fetchWinners();
      fetchUsers();
      fetchAvailableMembers();
    }
  }, [show, meeting]);

  const fetchUsers = async () => {
    try {
      const response = await getAllMembers();
      const base = response?.data !== undefined ? response.data : response;
      const list = Array.isArray(base?.data) ? base.data : (Array.isArray(base) ? base : []);
      setUsers(list);
      return list;
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
      return [];
    }
  };

  const fetchAvailableMembers = async () => {
    try {
      // Ensure users are loaded before mapping
      let baseUsers = users;
      if (!Array.isArray(baseUsers) || baseUsers.length === 0) {
        baseUsers = await fetchUsers();
      }

      // Fetch availability data for this specific meeting
      const response = await getAllMemberAvailabilityByMeetingId(meeting.meetingId);
      const base = response?.data !== undefined ? response.data : response;
      const availabilityData = Array.isArray(base?.data) ? base.data : (Array.isArray(base) ? base : []);

      // Map availability data to full user objects
      const availableUsers = availabilityData
        .map((availability) => baseUsers.find((u) => String(u.userId) === String(availability.userId)))
        .filter((user) => user && Number(user.deleteStatus) === 1);

      // If no available members found, fallback to all active users
      const fallback = Array.isArray(baseUsers) ? baseUsers.filter((u) => Number(u.deleteStatus) === 1) : [];
      setAvailableMembers(availableUsers.length > 0 ? availableUsers : fallback);
    } catch (err) {
      console.error('Error fetching available members:', err);
      // Fallback to all users if available members API fails
      const baseUsers = Array.isArray(users) ? users : [];
      const activeUsers = baseUsers.filter((user) => Number(user.deleteStatus) === 1);
      setAvailableMembers(activeUsers);
    }
  };

  const fetchWinners = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMeetingWinnersByMeeting(meeting.meetingId);
      const base = response?.data !== undefined ? response.data : response;
      const list = Array.isArray(base?.data) ? base.data : (Array.isArray(base) ? base : []);
      setWinners(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching winners:', err);
      setWinners([]);
      setError('Failed to load winners for this meeting.');
    } finally {
      setLoading(false);
    }
  };

  const getUserById = (userId) => {
    return users.find(user => user.userId === userId);
  };

  const handleEdit = (winner) => {
    setEditingWinner(winner);
    setEditDescription(winner.description);
    setEditUserId(winner.userId.toString());
  };

  const handleSaveEdit = async () => {
    try {
      await updateMeetingWinner(editingWinner.userId, editingWinner.meetingId, {
        description: editDescription,
        userId: parseInt(editUserId),
        meetingId: editingWinner.meetingId
      });
      setEditingWinner(null);
      setEditDescription('');
      setEditUserId('');
      fetchWinners();
    } catch (err) {
      console.error('Error updating winner:', err);
      setError('Failed to update winner. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingWinner(null);
    setEditDescription('');
    setEditUserId('');
  };

  const handleDelete = async (winner) => {
    try {
      // Try SweetAlert2 dynamically, fallback to window.confirm
      let SwalLib = null;
      try {
        const mod = await import('sweetalert2');
        SwalLib = mod?.default || mod;
      } catch (_) {
        SwalLib = null;
      }

      let confirmRes = { isConfirmed: false };
      if (SwalLib && SwalLib.fire) {
        confirmRes = await SwalLib.fire({
          title: 'Delete winner?',
          text: 'This action cannot be undone.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete',
          cancelButtonText: 'Cancel'
        });
      } else {
        confirmRes.isConfirmed = window.confirm('Are you sure you want to delete this winner?');
      }

      if (!confirmRes.isConfirmed) return;

      await deleteMeetingWinner(
        winner.userId || winner.user?.userId,
        winner.meetingId || winner.meeting?.meetingId || meeting.meetingId
      );

      if (SwalLib && SwalLib.fire) {
        await SwalLib.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
      }
      fetchWinners();
    } catch (err) {
      console.error('Error deleting winner:', err);
      setError('Failed to delete winner. Please try again.');
      try {
        const mod = await import('sweetalert2');
        const SwalLib = mod?.default || mod;
        await SwalLib.fire({ icon: 'error', title: 'Delete failed', text: 'Please try again.' });
      } catch (_e) {
        // ignore if sweetalert2 is unavailable
      }
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
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <Trophy size={24} className="me-2" />
          Meeting Winners
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {meeting && (
          <div className="mb-4 p-3 bg-light rounded">
            <h6 className="fw-bold">{meeting.meetingTheme || 'No Theme'}</h6>
            <small className="text-muted d-flex gap-2">
              {formatDate(meeting.meetingDate)}
              <p className='bg-success text-white pe-2 ps-2 rounded'>{meeting.category || 'General'}</p>
            </small>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading winners...</p>
          </div>
        ) : winners.length === 0 ? (
          <div className="text-center py-5">
            <Trophy size={64} className="text-muted mb-3" />
            <h5>No Winners Yet</h5>
            <p className="text-muted">No winners have been added for this meeting.</p>
          </div>
        ) : (
          <Table responsive striped>
            <thead>
              <tr>
                <th>
                  <User size={16} className="me-1" />
                  Winner
                </th>
                <th>
                  <FileText size={16} className="me-1" />
                  Description
                </th>
                <th>Date Added</th>
                {!readOnly && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {winners.map((winner, index) => {
                const user = availableMembers.find(member => member.userId === winner.userId) || getUserById(winner.userId);
                const isEditing = !readOnly && (editingWinner?.meetingWinnersId === winner.meetingWinnersId);
                
                return (
                  <tr key={winner.meetingWinnersId || index}>
                    <td>
                      <div>
                        <div className="fw-bold">{user?.userName || 'Unknown User'}</div>
                        <small className="text-muted">{user?.userEmail || 'No email'}</small>
                      </div>
                    </td>
                    <td>
                      {isEditing ? (
                        <div className="d-flex flex-column gap-2">
                          <div>
                            <label className="form-label mb-1" style={{fontSize: '0.8rem'}}>Member:</label>
                            <select
                              className="form-select form-select-sm"
                              value={editUserId}
                              onChange={(e) => setEditUserId(e.target.value)}
                            >
                              <option value="">Select Available Member...</option>
                              {availableMembers.map(member => (
                                <option key={member.userId} value={member.userId}>
                                  {member.userName} ({member.userEmail})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="form-label mb-1" style={{fontSize: '0.8rem'}}>Description:</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Winner description (e.g., Best Speaker)"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                            />
                          </div>
                        </div>
                      ) : (
                        <Badge bg="success" className="p-2">
                          {winner.description || 'No description'}
                        </Badge>
                      )}
                    </td>
                    <td>
                      <small className="text-muted">
                        {formatDate(winner.createdAt || winner.createdDate || new Date())}
                      </small>
                    </td>
                    {!readOnly && (
                      <td>
                        <div className="d-flex gap-2">
                          {isEditing ? (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={handleSaveEdit}
                              >
                                Save
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEdit(winner)}
                              >
                                <Edit size={14} />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDelete(winner)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={fetchWinners} disabled={loading}>
          Refresh
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WinnersListModal;
