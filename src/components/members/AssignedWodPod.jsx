import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { Calendar, Clock, PlusCircle, CheckCircle2, Edit } from 'lucide-react';
import { getAllMeetings } from '../../api/MeetingApi';
import { getMemberAssignedRole } from '../../api/AssignedRoleApi';
import { addWordsForMeeting, getWordsDataByMeeting } from '../../api/GrammarianApi';

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

export default function AssignedWodPod({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('WOD'); // 'WOD' | 'POD'
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [form, setForm] = useState({ word: '', meaning: '', example: '' });
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

        // Further filter where user has role 'Grammarian'
        const results = [];
        for (const m of list) {
          try {
            const rolesResp = await getMemberAssignedRole(userId, m.meetingId);
            const roles = pickArray(rolesResp);
            const hasGrammarian = (Array.isArray(roles) ? roles : []).some(r => {
              const name = (r?.roleName || r?.name || r || '').toString().toLowerCase();
              return name.includes('grammarian');
            });
            if (hasGrammarian) results.push(m);
          } catch (e) {
            // ignore 404/no roles
            if (e?.response?.status !== 404) console.warn('Assigned role check failed', e?.message, e?.response?.data);
          }
        }
        setMeetings(results);

        // Preload existing Grammarian words for each meeting
        const existing = {};
        for (const m of results) {
          try {
            const wResp = await getWordsDataByMeeting(m.meetingId);
            const items = pickArray(wResp);
            existing[m.meetingId] = items;
          } catch (err) {
            console.warn('Failed to load existing words for meeting', m.meetingId, err?.message, err?.response?.data);
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

  const alreadyAdded = (meetingId, type) => {
    const items = existingByMeeting[meetingId] || [];
    return items.some(i => (i.wordType || '').toUpperCase() === type.toUpperCase());
  };

  const getExistingEntry = (meetingId, type) => {
    const items = existingByMeeting[meetingId] || [];
    return items.find(i => (i.wordType || '').toUpperCase() === type.toUpperCase());
  };

  const isMeetingPast = (meeting) => {
    if (!meeting?.meetingDate) return false;
    const endTime = meeting.endTime || '23:59:59';
    const meetEnd = new Date(`${meeting.meetingDate}T${endTime}`);
    return meetEnd < new Date();
  };

  const openModal = (meeting, type) => {
    if (isMeetingPast(meeting)) {
      alert('Cannot modify WOD/POD after meeting has ended.');
      return;
    }
    
    setActiveMeeting(meeting);
    setModalType(type);
    
    // Pre-fill form if updating existing entry
    const existing = getExistingEntry(meeting.meetingId, type);
    if (existing) {
      setForm({
        word: existing.word || '',
        meaning: existing.meaning || '',
        example: existing.example || ''
      });
    } else {
      setForm({ word: '', meaning: '', example: '' });
    }
    
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeMeeting || !userId) return;
    try {
      setSubmitting(true);
      const payload = {
        word: form.word,
        meaning: form.meaning,
        example: form.example,
        wordType: modalType,
        userId,
        meetingId: activeMeeting.meetingId
      };
      const saveResp = await addWordsForMeeting(payload);
      console.log('Saved words response:', saveResp);
      // refresh existing cache for meeting
      try {
        const wResp = await getWordsDataByMeeting(activeMeeting.meetingId);
        const pickArray = (r) => {
          if (!r) return [];
          if (Array.isArray(r)) return r;
          if (Array.isArray(r?.data)) return r.data;
          if (Array.isArray(r?.data?.data)) return r.data.data;
          if (Array.isArray(r?.data?.content)) return r.data.content;
          if (Array.isArray(r?.content)) return r.content;
          return [];
        };
        const items = pickArray(wResp);
        setExistingByMeeting(prev => ({ ...prev, [activeMeeting.meetingId]: items }));
      } catch {}
      setShowModal(false);
    } catch (err) {
      console.error('Failed to save WOD/POD', err?.message, err?.response?.data);
      alert(err?.response?.data?.message || err?.response?.data || err.message || 'Failed to save');
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
        <h5>Assigned WOD/POD (as Grammarian)</h5>
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
                    <div className="d-flex gap-2 align-items-center flex-wrap">
                      <Button 
                        size="sm" 
                        variant={alreadyAdded(m.meetingId, 'WOD') ? "outline-primary" : "primary"} 
                        disabled={isMeetingPast(m)}
                        onClick={() => openModal(m, 'WOD')}
                      >
                        {alreadyAdded(m.meetingId, 'WOD') ? (
                          <><Edit size={14} className="me-1"/>Update WOD</>
                        ) : (
                          <><PlusCircle size={14} className="me-1"/>Add WOD</>
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant={alreadyAdded(m.meetingId, 'POD') ? "outline-success" : "success"} 
                        disabled={isMeetingPast(m)}
                        onClick={() => openModal(m, 'POD')}
                      >
                        {alreadyAdded(m.meetingId, 'POD') ? (
                          <><Edit size={14} className="me-1"/>Update POD</>
                        ) : (
                          <><PlusCircle size={14} className="me-1"/>Add POD</>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">No upcoming Grammarian assignments found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {getExistingEntry(activeMeeting?.meetingId, modalType) ? 'Update' : 'Add'} {modalType} for Meeting #{activeMeeting?.meetingId}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>{modalType === 'WOD' ? 'Word' : 'Phrase'}</Form.Label>
              <Form.Control value={form.word} onChange={(e) => setForm(f => ({ ...f, word: e.target.value }))} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Meaning</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.meaning} onChange={(e) => setForm(f => ({ ...f, meaning: e.target.value }))} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Example</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.example} onChange={(e) => setForm(f => ({ ...f, example: e.target.value }))} />
            </Form.Group>
            <div className="text-muted small">Type will be saved as {modalType}.</div>
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
