import React, { useState } from 'react';
import { Card, Spinner, Badge, Row, Col } from 'react-bootstrap';
import useMeetingData from '../../hooks/useMeetingData';
import { addMemberPreferredRole, deleteMemberPreferredRole } from '../../api/PreferredRoleApi';

const MeetingCard = ({ meeting, userId, members, onMeetingClick }) => {
  const { 
    loading,
    error,
    preferredRoles,
    assignedRoles,
    availableRoles,
    availabilityStatus,
    assignedEvaluators,
    assignedSpeakers,
  } = useMeetingData(meeting.meetingId, userId, members);

  const [updatingPreferences, setUpdatingPreferences] = useState({});

  const getRoleName = (role) => {
    if (!role) return '';
    if (typeof role === 'string') return role;
    return role.roleName || role.role_name || role.name || JSON.stringify(role);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleRolePreferenceToggle = async (roleName) => {
    const updateKey = `${meeting.meetingId}-${roleName}`;
    setUpdatingPreferences(prev => ({ ...prev, [updateKey]: true }));

    try {
      const isCurrentlyPreferred = preferredRoles.some(r => getRoleName(r) === roleName);
      if (isCurrentlyPreferred) {
        await deleteMemberPreferredRole(userId, meeting.meetingId, [roleName]);
      } else {
        await addMemberPreferredRole(userId, meeting.meetingId, [roleName]);
      }
      // Data will auto-refresh via hook re-trigger if we manage state correctly, 
      // but for now, a page refresh might be needed or a manual refetch function from the hook.
    } catch (err) {
      console.error('Error updating role preference:', err);
    } finally {
      setUpdatingPreferences(prev => ({ ...prev, [updateKey]: false }));
    }
  };

  // Do not block render on loading; show lightweight placeholders in sections instead

  if (error) {
    return (
        <Col>
            <Card className="h-100 shadow-sm border-danger">
                <Card.Header>{meeting.meetingTheme || 'Meeting'}</Card.Header>
                <Card.Body>{error}</Card.Body>
            </Card>
        </Col>
    )
  }

  const borderClass = availabilityStatus === 1 ? 'border-success' : availabilityStatus === 0 ? 'border-danger' : availabilityStatus === 2 ? 'border-warning' : 'border-primary';
  const statusColor = availabilityStatus === 1 ? '#198754' : availabilityStatus === 0 ? '#dc3545' : availabilityStatus === 2 ? '#ffc107' : '#0d6efd';

  return (
    <Col>
      <Card 
        className={`h-100 shadow-sm hover-card border-2 ${borderClass}`}
        style={{ cursor: 'pointer', borderLeft: `6px solid ${statusColor}` }}
        onClick={() => onMeetingClick(meeting)}
      >
        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{meeting.meetingTheme || 'No Theme'}</h5>
          <Badge bg="secondary" className="ms-2">ID: {meeting.meetingId}</Badge>
        </Card.Header>
        <Card.Body style={{ minHeight: '260px' }}>
            <div className="mb-3">
                <div className="text-muted small">Date</div>
                <div>{formatDate(meeting.meetingDate)}</div>
            </div>

            <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold">Available Roles</span>
                    {!loading && <Badge bg="light" text="dark" className="small">{availableRoles.length} roles</Badge>}
                </div>
                <div className="d-flex flex-wrap gap-1">
                    {loading ? (
                        <span className="text-muted small">Loading roles...</span>
                    ) : availableRoles.length > 0 ? (
                        availableRoles.map((role, idx) => {
                            const isPreferred = preferredRoles.some(r => getRoleName(r) === role.roleName);
                            const isUpdating = updatingPreferences[`${meeting.meetingId}-${role.roleName}`];
                            return (
                                <Badge 
                                    key={`avail-${idx}`} 
                                    bg={isPreferred ? "info" : "secondary"} 
                                    className="me-1 mb-1 d-flex align-items-center"
                                    style={{ cursor: isUpdating ? 'wait' : 'pointer', opacity: isUpdating ? 0.6 : 1, transition: 'all 0.2s' }}
                                    onClick={(e) => { e.stopPropagation(); !isUpdating && handleRolePreferenceToggle(role.roleName); }}
                                    title={isPreferred ? 'Click to remove preference' : 'Click to add preference'}
                                >
                                    {role.roleName}
                                    {role.availableCount > 1 && <span className="ms-1 badge bg-light text-dark">{role.availableCount}</span>}
                                    {isPreferred && <span className="ms-1">★</span>}
                                    {isUpdating && <Spinner size="sm" className="ms-1" />}
                                </Badge>
                            );
                        })
                    ) : <span className="text-muted">No roles available</span>}
                </div>
            </div>

            <div className="mb-3">
                <div className="fw-semibold mb-2">Your Preferred Roles</div>
                <div className="d-flex flex-wrap gap-1">
                    {loading ? (
                        <span className="text-muted small">Loading...</span>
                    ) : preferredRoles.length > 0 ? (
                        preferredRoles.map((role, idx) => (
                            <Badge key={`pref-${idx}`} bg="info" className="me-1 mb-1">{getRoleName(role)}</Badge>
                        ))
                    ) : <span className="text-muted">No preferred roles</span>}
                </div>
            </div>

            <div className="mb-2">
                <div className="fw-semibold mb-2">Your Assigned Roles</div>
                <div className="d-flex flex-wrap gap-1">
                    {loading ? (
                        <span className="text-muted small">Loading...</span>
                    ) : assignedRoles.length > 0 ? (
                        assignedRoles.map((role, idx) => (
                            <Badge key={`assigned-${idx}`} bg="success" className="me-1 mb-1">{getRoleName(role)}</Badge>
                        ))
                    ) : <span className="text-muted">No roles assigned</span>}
                </div>
            </div>

            {!loading && assignedEvaluators.length > 0 && (
                <div>
                    <div className="fw-semibold mb-2">Assigned Evaluators</div>
                    <div className="d-flex flex-wrap gap-1">
                        {assignedEvaluators.map((label, idx) => <Badge key={`eval-${idx}`} bg="secondary" className="me-1 mb-1">{label}</Badge>)}
                    </div>
                </div>
            )}

            {!loading && assignedSpeakers.length > 0 && (
                <div className="mt-2">
                    <div className="fw-semibold mb-2">Assigned Speakers</div>
                    <div className="d-flex flex-wrap gap-1">
                        {assignedSpeakers.map((label, idx) => <Badge key={`spk-${idx}`} bg="info" className="me-1 mb-1">{label}</Badge>)}
                    </div>
                </div>
            )}
        </Card.Body>
      </Card>
    </Col>
  );
};

export default MeetingCard;
