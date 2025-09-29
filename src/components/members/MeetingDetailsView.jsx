import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { ArrowLeft, Calendar, Clock, MapPin, Tag, UserCheck } from 'lucide-react';
import { markAvailability, getAvailabilityById } from '../../api/AvailableMembersApi';
import { getMemberPreferredRoles } from '../../api/PreferredRoleApi';
import RoleSelectionModal from './RoleSelectionModal';
import Swal from 'sweetalert2';

const MeetingDetailsView = ({ meeting, onBack, onChooseRole }) => {
  if (!meeting) return null;

  const [selectedAvailability, setSelectedAvailability] = useState(null); // '1' | '0' | '2'
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message: string }
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [preferredRoles, setPreferredRoles] = useState([]); // [string]

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const [y, m, d] = dateString.split('-');
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Preload existing availability for this meeting
  useEffect(() => {
    const preload = async () => {
      const userId = getCurrentUserId();
      const meetingId = meeting?.meetingId;
      if (!userId || !meetingId) return;
      try {
        const resp = await getAvailabilityById(userId);
        // Handle possible shapes: axios response {data}, or ResponseMessage {data: [...]}
        const listCandidate = Array.isArray(resp?.data?.data)
          ? resp.data.data
          : Array.isArray(resp?.data)
          ? resp.data
          : Array.isArray(resp)
          ? resp
          : [];

        const match = listCandidate.find((item) => {
          const mId = item?.meetingId ?? item?.meeting?.meetingId ?? item?.id;
          return String(mId) === String(meetingId);
        });
        if (match) {
          let val = match.availability ?? match.status ?? match.value ?? match.available;
          // Normalize to '1'|'0'|'2'
          if (typeof val === 'boolean') val = val ? '1' : '0';
          if (typeof val === 'number') val = String(val);
          if (typeof val === 'string') {
            const lower = val.toLowerCase();
            if (['available', 'yes', 'true', '1'].includes(lower)) val = '1';
            else if (['not available', 'no', 'false', '0'].includes(lower)) val = '0';
            else if (['tentative', 'maybe', '2'].includes(lower)) val = '2';
          }
          if (val === '0' || val === '1' || val === '2') {
            setSelectedAvailability(val);
          }
        }
      } catch (e) {
        // silent fail; user can still set availability
      }
    };
    preload();
  }, [meeting?.meetingId]);

  // Preload preferred roles for this meeting
  useEffect(() => {
    const loadPreferred = async () => {
      const userId = getCurrentUserId();
      const meetingId = meeting?.meetingId;
      if (!userId || !meetingId) return;
      try {
        const resp = await getMemberPreferredRoles(userId, meetingId);
        const roles = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : []);
        setPreferredRoles(roles || []);
      } catch (e) {
        setPreferredRoles([]);
      }
    };
    loadPreferred();
  }, [meeting?.meetingId]);

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.split(':').slice(0, 2).join(':');
  };

  const categoryVariant = (category) => {
    const c = (category || '').toLowerCase();
    if (c === 'contest') return 'warning';
    if (c === 'special') return 'danger';
    return 'info';
  };

  const getCurrentUserId = () => {
    try {
      const raw = localStorage.getItem('tm_current_user');
      if (!raw) return null;
      const u = JSON.parse(raw);
      return u?.userId || u?.id || null;
    } catch {
      return null;
    }
  };

  const handleAvailabilityChange = async (value) => {
    const userId = getCurrentUserId();
    const meetingId = meeting?.meetingId;
    if (!userId || !meetingId) {
      setFeedback({ type: 'error', message: 'Missing user or meeting information.' });
      return;
    }

    // If selecting the same state, do nothing
    if (value === selectedAvailability) return;

    // Determine if a confirmation is needed
    const current = selectedAvailability; // '1' | '0' | '2' | null
    const target = value; // '1' | '0' | '2'

    const daysUntilMeeting = (() => {
      try {
        const ds = meeting?.meetingDate; // expected YYYY-MM-DD
        if (!ds) return null;
        const [y, m, d] = ds.split('-').map(Number);
        const dt = new Date(y, (m || 1) - 1, d || 1);
        if (Number.isNaN(dt.getTime())) return null;
        const today = new Date();
        dt.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return Math.floor((dt - today) / (1000 * 60 * 60 * 24));
      } catch {
        return null;
      }
    })();

    let proceed = true;
    const reducingAvailability = (current === '1' && (target === '0' || target === '2')) || (current !== '0' && target === '0');

    if (reducingAvailability) {
      if (target === '0' && daysUntilMeeting !== null && daysUntilMeeting >= 0 && daysUntilMeeting <= 7) {
        // Within next 7 days and marking Not Available => Backout warning
        const res = await Swal.fire({
          title: 'Are you want to backout?',
          text: 'This meeting is within the next 7 days. Confirm your unavailability.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No'
        });
        proceed = res.isConfirmed;
      } else {
        // Simple confirmation for Not Available (outside 7 days) or Tentative
        const msg = target === '0' ? 'Mark yourself as Not Available?' : 'Mark yourself as Tentative?';
        const res = await Swal.fire({
          title: 'Are you sure?',
          text: msg,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No'
        });
        proceed = res.isConfirmed;
      }
    }

    if (!proceed) return; // Keep previous selection

    setSelectedAvailability(value);
    setSubmitting(true);
    setFeedback(null);
    try {
      const numeric = Number(value);
      try {
        await markAvailability(numeric, userId, meetingId);
      } catch (err) {
        // Some backends may not accept 0; retry with 2 (Tentative) as a compatibility fallback
        if (numeric === 0) {
          console.warn('markAvailability(0, userId, meetingId) failed; retrying with 2 (tentative).', {
            userId,
            meetingId,
            error: err?.response?.data || err?.message || err
          });
          await markAvailability(2, userId, meetingId);
          // Reflect fallback selection in UI
          setSelectedAvailability('2');
        } else {
          throw err;
        }
      }
      // Do not show success message per requirement
      setFeedback(null);
    } catch (e) {
      console.error('markAvailability failed', e?.response?.data || e);
      setFeedback({ type: 'error', message: 'Failed to update availability. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto' }}>
      <h5 className="mb-4">Meeting Details</h5>
      <div className="mb-3">
        <Button variant="outline-secondary" size="sm" onClick={onBack}>
          <ArrowLeft size={18} className="me-2 text-secondary" />
          Back to meetings
        </Button>
      </div>

      <Card className="shadow rounded-3 border-0">
        <Card.Body className="p-4" style={{ minHeight: '200px' }}>
          {/* Theme and ID */}
          <div className="text-center mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h4 className="mb-0">
                {meeting.meetingTheme || 'No Theme'}
              </h4>
              <Badge bg="secondary" className="ms-2" style={{ fontSize: '0.9rem' }}>
                Meeting ID: {meeting.meetingId || 'N/A'}
              </Badge>
            </div>
            <div className="text-muted">Meeting Details</div>
          </div>

          {/* Date/Day left, Time right */}
          <div className="row mb-3 fs-6">
            <div className="col-md-6">
              <Calendar size={20} className="me-2 text-primary" />
              <strong>Date:</strong>
              <span className="ms-2 fw-semibold">{formatDate(meeting.meetingDate)}</span>
            </div>
            <div className="col-md-6 text-md-end mt-2 mt-md-0">
              <Clock size={20} className="me-2 text-success" />
              <strong>Time:</strong>
              <span className="ms-2 fw-semibold">{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
            </div>
          </div>

          {/* Location left, Category right */}
          <div className="row fs-6">
            <div className="col-md-6">
              <MapPin size={20} className="me-2 text-danger" />
              <strong>Location:</strong>
              <span className="ms-2 fw-semibold">{meeting.meetingLocation || 'N/A'}</span>
            </div>
            <div className="col-md-6 text-md-end mt-2 mt-md-0">
              <Tag size={20} className="me-2 text-warning" />
              <strong>Category:</strong>{' '}
              {meeting.category ? (
                <Badge bg={categoryVariant(meeting.category)} className="ms-2 fs-6">{meeting.category}</Badge>
              ) : (
                <span className="text-muted">N/A</span>
              )}
            </div>
          </div>

        </Card.Body>
      </Card>

      {/* Preferred Roles display */}
      {selectedAvailability === '1' && (
        <Card className="shadow rounded-3 border-0 mt-3">
          <Card.Body className="p-4">
            <h6 className="mb-2">Preferred Roles</h6>
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div className="d-flex flex-wrap gap-2 flex-grow-1">
                {preferredRoles && preferredRoles.length > 0 ? (
                  preferredRoles.map((r, idx) => (
                    <Badge bg="secondary" key={idx}>{r}</Badge>
                  ))
                ) : (
                  <span className="text-muted">No preferred roles selected.</span>
                )}
              </div>
              <Button variant="outline-primary" size="sm" onClick={() => setShowRoleModal(true)} className="ms-auto">
                Edit
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      <Card className="shadow rounded-3 border-0 mt-3">
        <Card.Body className="p-4">
          <h5 className="mb-3">Mark Availability</h5>
          <div className="d-flex flex-wrap align-items-center justify-content-between">
            <div className="d-flex flex-wrap align-items-center gap-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="avail-available"
                  checked={selectedAvailability === '1'}
                  disabled={submitting}
                  onChange={() => handleAvailabilityChange('1')}
                />
                <label className="form-check-label" htmlFor="avail-available">
                  Available
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="avail-not"
                  checked={selectedAvailability === '0'}
                  disabled={submitting}
                  onChange={() => handleAvailabilityChange('0')}
                />
                <label className="form-check-label" htmlFor="avail-not">
                  Not Available
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="avail-tentative"
                  checked={selectedAvailability === '2'}
                  disabled={submitting}
                  onChange={() => handleAvailabilityChange('2')}
                />
                <label className="form-check-label" htmlFor="avail-tentative">
                  Tentative
                </label>
              </div>
              {submitting && <span className="text-muted">Saving...</span>}
              {feedback?.type === 'error' && <span className="text-danger">{feedback.message}</span>}
            </div>
            {selectedAvailability === '1' && (
              <Button
                variant="primary"
                size="sm"
                className="mt-3 mt-md-0"
                onClick={() => setShowRoleModal(true)}
              >
                <UserCheck size={18} className="me-2" />
                Choose Role
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Role selection modal */}
      {showRoleModal && (
        <RoleSelectionModal
          show={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          userId={getCurrentUserId()}
          meetingId={meeting?.meetingId}
          onSaved={(roles) => {
            setShowRoleModal(false);
            setPreferredRoles(Array.isArray(roles) ? roles : []);
            if (onChooseRole) onChooseRole(meeting, roles);
          }}
        />
      )}
    </div>
  );
};

export default MeetingDetailsView;
