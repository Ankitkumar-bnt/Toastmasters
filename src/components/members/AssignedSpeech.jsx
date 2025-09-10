import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Button, Modal, Form, Spinner, Row, Col } from 'react-bootstrap';
import { Calendar, Clock, PlusCircle, Edit } from 'lucide-react';
import { getAllMeetings } from '../../api/MeetingApi';
import { getMemberAssignedRole } from '../../api/AssignedRoleApi';
import { addSpeakerSpeech, getSpeakerSpeechByMeeting, updateSpeakerSpeechByMeeting } from '../../api/SpeakerSpeechApi';
import Swal from 'sweetalert2';

const isUpcoming = (meeting) => {
  if (!meeting?.meetingDate) return false;
  const endTime = meeting.endTime || '23:59:59';
  const meetEnd = new Date(`${meeting.meetingDate}T${endTime}`);
  return meetEnd >= new Date();
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const [y, m, d] = dateString.split('-');
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

const formatTime = (timeString) => (timeString ? timeString.split(':').slice(0, 2).join(':') : 'N/A');

export default function AssignedSpeech({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [form, setForm] = useState({
    pathwaysTrack: '',
    level: 1,
    projectNo: 1,
    maxSpeechTime: 7,
    minSpeechTime: 5,
    title: '',
    objective: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [existingByMeeting, setExistingByMeeting] = useState({});

  const currentUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('tm_current_user')) || {}; } catch { return {}; }
  }, []);

  const userId = currentUser?.userId || currentUser?.id;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const resp = await getAllMeetings();

        const pickArray = (r) => {
          if (!r) return [];
          if (Array.isArray(r)) return r;
          if (Array.isArray(r?.data)) return r.data;
          if (Array.isArray(r?.data?.data)) return r.data.data;
          if (Array.isArray(r?.data?.content)) return r.data.content;
          if (Array.isArray(r?.content)) return r.content;
          return [];
        };

        let list = pickArray(resp);

        // Filter upcoming only
        list = (list || []).filter(isUpcoming);

        // Further filter where user has role 'Speaker'
        const results = [];
        for (const m of list) {
          try {
            const rolesResp = await getMemberAssignedRole(userId, m.meetingId);
            const roles = pickArray(rolesResp);
            const hasSpeaker = (Array.isArray(roles) ? roles : []).some(r => {
              const name = (r?.roleName || r?.name || r || '').toString().toLowerCase();
              return name.includes('speaker');
            });
            if (hasSpeaker) results.push(m);
          } catch (e) {
            if (e?.response?.status !== 404) console.warn('Assigned role check failed', e?.message, e?.response?.data);
          }
        }
        setMeetings(results);

        // Preload existing speeches (list) for each meeting
        const existing = {};
        for (const m of results) {
          try {
            const speechResp = await getSpeakerSpeechByMeeting(m.meetingId);
            const list = pickArray(speechResp);
            existing[m.meetingId] = list;
          } catch (err) {
            console.warn('Failed to load existing speech for meeting', m.meetingId, err?.message, err?.response?.data);
          }
        }
        setExistingByMeeting(existing);
      } catch (e) {
        console.error(e);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    if (userId) load();
  }, [userId]);

  const alreadyAdded = (meetingId) => {
    const items = existingByMeeting[meetingId] || [];
    return (items || []).some(i => (i?.userId || i?.user?.userId || i?.user?.id) === userId);
  };

  const getExistingSpeech = (meetingId) => {
    const items = existingByMeeting[meetingId] || [];
    return (items || []).find(i => (i?.userId || i?.user?.userId || i?.user?.id) === userId) || null;
  };

  const isMeetingPast = (meeting) => {
    if (!meeting?.meetingDate) return false;
    const endTime = meeting.endTime || '23:59:59';
    const meetEnd = new Date(`${meeting.meetingDate}T${endTime}`);
    return meetEnd < new Date();
  };

  const openModal = (meeting) => {
    if (isMeetingPast(meeting)) {
      alert('Cannot modify speech after meeting has ended.');
      return;
    }
    
    setActiveMeeting(meeting);
    
    // Pre-fill form if updating existing speech
    const existing = getExistingSpeech(meeting.meetingId);
    if (existing) {
      setForm({
        pathwaysTrack: existing.pathwaysTrack || '',
        level: existing.level || 1,
        projectNo: existing.projectNo || 1,
        maxSpeechTime: existing.maxSpeechTime || 7,
        minSpeechTime: existing.minSpeechTime || 5,
        title: existing.title || '',
        objective: existing.objective || ''
      });
    } else {
      setForm({
        pathwaysTrack: '',
        level: 1,
        projectNo: 1,
        maxSpeechTime: 7,
        minSpeechTime: 5,
        title: '',
        objective: ''
      });
    }
    
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeMeeting || !userId) return;
    try {
      setSubmitting(true);
      const payload = {
        pathwaysTrack: form.pathwaysTrack,
        level: parseInt(form.level),
        projectNo: parseInt(form.projectNo),
        maxSpeechTime: parseInt(form.maxSpeechTime),
        minSpeechTime: parseInt(form.minSpeechTime),
        title: form.title,
        objective: form.objective,
        userId,
        meetingId: activeMeeting.meetingId
      };
      // Choose add or update based on existing record
      const exists = alreadyAdded(activeMeeting.meetingId);
      const saveResp = exists
        ? await updateSpeakerSpeechByMeeting(activeMeeting.meetingId, userId, payload)
        : await addSpeakerSpeech(payload);
      console.log('Saved speech response:', saveResp);
      
      // refresh existing cache for meeting
      try {
        const speechResp = await getSpeakerSpeechByMeeting(activeMeeting.meetingId);
        const list = (() => {
          if (Array.isArray(speechResp)) return speechResp;
          if (Array.isArray(speechResp?.data)) return speechResp.data;
          if (Array.isArray(speechResp?.data?.data)) return speechResp.data.data;
          if (Array.isArray(speechResp?.data?.content)) return speechResp.data.content;
          if (Array.isArray(speechResp?.content)) return speechResp.content;
          return [];
        })();
        setExistingByMeeting(prev => ({
          ...prev,
          [activeMeeting.meetingId]: list
        }));

        // Success popup with latest saved data
        const mySpeech = (list || []).find(i => (i?.userId || i?.user?.userId || i?.user?.id) === userId);
        if (mySpeech) {
          const html = `
            <div style="text-align:left">
              <div><strong>Title:</strong> ${mySpeech.title || ''}</div>
              <div><strong>Pathways Track:</strong> ${mySpeech.pathwaysTrack || ''}</div>
              <div><strong>Level:</strong> ${mySpeech.level ?? ''}</div>
              <div><strong>Project #:</strong> ${mySpeech.projectNo ?? ''}</div>
              <div><strong>Time:</strong> ${mySpeech.minSpeechTime ?? ''} - ${mySpeech.maxSpeechTime ?? ''} min</div>
              ${mySpeech.objective ? `<div><strong>Objective:</strong> ${mySpeech.objective}</div>` : ''}
            </div>
          `;
          await Swal.fire({
            icon: 'success',
            title: alreadyAdded(activeMeeting.meetingId) ? 'Speech updated' : 'Speech added',
            html,
            confirmButtonText: 'OK'
          });
        } else {
          await Swal.fire({ icon: 'success', title: 'Saved', text: 'Your speech has been saved.' });
        }
      } catch {}
      setShowModal(false);
    } catch (err) {
      console.error('Failed to save speech', err?.message, err?.response?.data);
      await Swal.fire({ icon: 'error', title: 'Failed to save', text: err?.response?.data?.message || err?.response?.data || err.message || 'Failed to save' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div style={{ width: '88%', margin: '0 auto' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Assigned Speech (as Speaker)</h5>
        {onBack && (
          <Button variant="outline-secondary" size="sm" onClick={onBack}>Back</Button>
        )}
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3"><Calendar size={16} className="me-2" />Date</th>
                <th className="px-3 py-3"><Clock size={16} className="me-2" />Time</th>
                <th className="px-3 py-3">Theme</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.length ? meetings.map(m => (
                <tr key={m.meetingId}>
                  <td className="px-3 py-3 fw-semibold">{m.meetingId}</td>
                  <td className="px-3 py-3">{formatDate(m.meetingDate)}</td>
                  <td className="px-3 py-3">{formatTime(m.startTime)} - {formatTime(m.endTime)}</td>
                  <td className="px-3 py-3">{m.meetingTheme || 'N/A'}</td>
                  <td className="px-3 py-3">
                    <Button 
                      size="sm" 
                      variant={alreadyAdded(m.meetingId) ? "outline-primary" : "primary"} 
                      disabled={isMeetingPast(m)}
                      onClick={() => openModal(m)}
                    >
                      {alreadyAdded(m.meetingId) ? (
                        <><Edit size={14} className="me-1"/>Update Speech</>
                      ) : (
                        <><PlusCircle size={14} className="me-1"/>Add Speech</>
                      )}
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">No upcoming Speaker assignments found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {getExistingSpeech(activeMeeting?.meetingId) ? 'Update' : 'Add'} Speech for Meeting #{activeMeeting?.meetingId}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Pathways Track</Form.Label>
                  <Form.Control 
                    value={form.pathwaysTrack} 
                    onChange={(e) => setForm(f => ({ ...f, pathwaysTrack: e.target.value }))} 
                    placeholder="e.g., Dynamic Leadership"
                    required 
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Level</Form.Label>
                  <Form.Control 
                    type="number" 
                    min="1" 
                    max="5"
                    value={form.level} 
                    onChange={(e) => setForm(f => ({ ...f, level: e.target.value }))} 
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Project Number</Form.Label>
                  <Form.Control 
                    type="number" 
                    min="1"
                    value={form.projectNo} 
                    onChange={(e) => setForm(f => ({ ...f, projectNo: e.target.value }))} 
                    required 
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Min Speech Time (minutes)</Form.Label>
                  <Form.Control 
                    type="number" 
                    min="1" 
                    max="20"
                    value={form.minSpeechTime} 
                    onChange={(e) => setForm(f => ({ ...f, minSpeechTime: e.target.value }))} 
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Max Speech Time (minutes)</Form.Label>
                  <Form.Control 
                    type="number" 
                    min="1" 
                    max="20"
                    value={form.maxSpeechTime} 
                    onChange={(e) => setForm(f => ({ ...f, maxSpeechTime: e.target.value }))} 
                    required 
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Speech Title</Form.Label>
              <Form.Control 
                value={form.title} 
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} 
                placeholder="Enter your speech title"
                required 
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Objective</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={form.objective} 
                onChange={(e) => setForm(f => ({ ...f, objective: e.target.value }))} 
                placeholder="Describe the objective of your speech"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
