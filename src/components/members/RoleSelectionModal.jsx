import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, ListGroup, Spinner, Alert, Badge } from 'react-bootstrap';
import { getAllRoles } from '../../api/RoleApi';
import { addMemberPreferredRole, getMemberPreferredRoles } from '../../api/PreferredRoleApi';
import { getAllMemberAssignedRolesByMeeting } from '../../api/AssignedRoleApi';
import { getAllMeetingRoleCombineByMeeting } from '../../api/MeetingRoleApi';

const RoleSelectionModal = ({ show, onClose, userId, meetingId, onSaved }) => {
  const [allRoles, setAllRoles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const maxSelectable = 3;
  const canSelectMore = selected.length < maxSelectable;

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!meetingId) {
        setError('Meeting ID is required');
        return;
      }

      // Fetch meeting-specific roles with counts
      const rolesRes = await getAllMeetingRoleCombineByMeeting(meetingId);
      const rolesData = rolesRes.data?.data || rolesRes.data || [];
      
      // Fetch all assigned roles for this meeting to calculate availability
      const allAssignedRes = await getAllMemberAssignedRolesByMeeting(meetingId);
      const allAssignedData = allAssignedRes.data?.data || allAssignedRes.data || [];
      
      // Calculate available counts for each role
      const roleCounts = {};
      rolesData.forEach(role => {
        roleCounts[role.roleName] = role.roleCount || 1;
      });
      
      // Subtract assigned roles from available counts
      allAssignedData.forEach(assignment => {
        const roleName = assignment.roleName || assignment.role?.roleName;
        if (roleName && roleCounts[roleName] > 0) {
          roleCounts[roleName] -= 1;
        }
      });
      
      // Filter roles to show only those that are truly available (not assigned to anyone)
      const availableRoles = rolesData.filter(role => {
        const hasAvailableSlots = roleCounts[role.roleName] > 0;
        return hasAvailableSlots;
      }).map(role => ({
        ...role,
        availableCount: roleCounts[role.roleName] || 0
      }));
      
      setAllRoles(availableRoles);

      // Fetch existing preferred roles for this user+meeting
      if (userId && meetingId) {
        const prefResp = await getMemberPreferredRoles(userId, meetingId);
        const prefList = Array.isArray(prefResp?.data) ? prefResp.data : (Array.isArray(prefResp) ? prefResp : []);
        const preferredRoleNames = prefList.map(role => 
          typeof role === 'string' ? role : (role.roleName || role.name || role)
        );
        setSelected(preferredRoleNames.slice(0, maxSelectable));
      }
    } catch (e) {
      setError('Failed to load roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      loadData();
    } else {
      // reset between openings
      setSelected([]);
      setAllRoles([]);
      setError(null);
      setLoading(false);
      setSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const toggleRole = (roleName) => {
    setSelected((prev) => {
      const exists = prev.includes(roleName);
      if (exists) return prev.filter((r) => r !== roleName);
      if (prev.length >= maxSelectable) return prev; // do not exceed
      return [...prev, roleName];
    });
  };

  const handleSave = async () => {
    if (!userId || !meetingId) {
      setError('Missing user or meeting info.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await addMemberPreferredRole(userId, meetingId, selected);
      if (onSaved) onSaved(selected);
      onClose();
    } catch (e) {
      setError('Failed to save preferred roles.');
    } finally {
      setSaving(false);
    }
  };

  const headerNote = useMemo(() => (
    <small className="text-muted">Choose up to {maxSelectable} roles</small>
  ), []);

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Choose Roles {headerNote}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <ListGroup>
            {allRoles && allRoles.length > 0 ? (
              allRoles.map((role, idx) => {
                const name = role?.roleName || role?.name || String(role);
                const checked = selected.includes(name);
                const disabled = !checked && !canSelectMore;
                return (
                  <ListGroup.Item key={idx} action onClick={() => !disabled && toggleRole(name)}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <input
                          type="checkbox"
                          className="form-check-input me-2"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleRole(name)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {name}
                        {role.availableCount > 1 && (
                          <Badge bg="light" text="dark" className="ms-2">
                            {role.availableCount} available
                          </Badge>
                        )}
                      </div>
                      {checked && (
                        <Badge bg="success">
                          {selected.indexOf(name) + 1}
                          {['st', 'nd', 'rd'][selected.indexOf(name)] || 'th'}
                        </Badge>
                      )}
                    </div>
                  </ListGroup.Item>
                );
              })
            ) : (
              <div className="text-muted">No roles found.</div>
            )}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div className="me-auto text-muted">
          {selected.length}/{maxSelectable} selected
        </div>
        <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving || selected.length === 0}>
          {saving ? 'Saving...' : 'Save Roles'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RoleSelectionModal;
