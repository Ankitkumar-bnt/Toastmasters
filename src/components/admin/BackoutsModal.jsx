import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Table, Tabs, Tab, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { Users, Calendar, BarChart2 } from 'lucide-react';
import { getAllBackouts, getBackoutsByMeeting } from '../../api/BackoutApi';

const monthKey = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
};

const BackoutsModal = ({ show, onHide, users = [], meetings = [] }) => {
  const [activeTab, setActiveTab] = useState('user');

  // User-wise totals
  const [loadingTotals, setLoadingTotals] = useState(false);
  const [totals, setTotals] = useState([]); // [{ userId, totalBackoutCount }]
  const [totalsError, setTotalsError] = useState(null);

  // Meeting-wise
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [meetingBackouts, setMeetingBackouts] = useState([]); // list of backout rows
  const [loadingMeeting, setLoadingMeeting] = useState(false);
  const [meetingError, setMeetingError] = useState(null);

  // Monthly
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [monthlyCounts, setMonthlyCounts] = useState({}); // { userId: count }
  const [monthlyError, setMonthlyError] = useState(null);

  // Derived maps
  const userById = useMemo(() => {
    const m = {};
    (users || []).forEach(u => {
      const id = u.userId ?? u.id;
      if (id != null) m[id] = u;
    });
    return m;
  }, [users]);

  const sortedMeetings = useMemo(() => {
    const list = Array.isArray(meetings) ? [...meetings] : [];
    list.sort((a, b) => {
      const da = a.meetingDate ? new Date(a.meetingDate) : new Date(0);
      const db = b.meetingDate ? new Date(b.meetingDate) : new Date(0);
      return db - da; // desc
    });
    return list;
  }, [meetings]);

  const currentMonthKey = useMemo(() => monthKey(new Date()), []);

  useEffect(() => {
    if (show) {
      // default meeting selection to the most recent
      if (!selectedMeetingId && sortedMeetings.length > 0) {
        setSelectedMeetingId(sortedMeetings[0].meetingId);
      }
      loadTotals();
    } else {
      // reset state when closed
      setActiveTab('user');
      setMeetingBackouts([]);
      setMonthlyCounts({});
      setTotalsError(null);
      setMeetingError(null);
      setMonthlyError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  useEffect(() => {
    if (show && selectedMeetingId) {
      loadMeetingBackouts(selectedMeetingId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMeetingId, show]);

  const loadTotals = async () => {
    try {
      setLoadingTotals(true);
      setTotalsError(null);
      const res = await getAllBackouts();
      const base = res?.data !== undefined ? res.data : res;
      const list = Array.isArray(base?.data) ? base.data : (Array.isArray(base) ? base : []);
      // Some backends return aggregated totals { userId, totalBackoutCount }
      // Others may return raw entries [{ backoutId, userId, meetingId }].
      let rows = [];
      if (list.length > 0 && (list[0].totalBackoutCount != null || list[0].count != null)) {
        rows = list.map(r => ({
          userId: r.userId ?? r.user?.userId,
          totalBackoutCount: r.totalBackoutCount ?? r.count ?? 0
        }));
      } else {
        // group raw entries by userId
        const grouped = {};
        list.forEach(r => {
          const uid = r.userId ?? r.user?.userId;
          if (uid == null) return;
          grouped[uid] = (grouped[uid] || 0) + 1;
        });
        rows = Object.entries(grouped).map(([uid, cnt]) => ({ userId: Number(uid), totalBackoutCount: cnt }));
      }
      rows.sort((a, b) => (b.totalBackoutCount || 0) - (a.totalBackoutCount || 0));
      setTotals(rows);
    } catch (e) {
      setTotalsError('Failed to load totals.');
      setTotals([]);
    } finally {
      setLoadingTotals(false);
    }
  };

  const loadMeetingBackouts = async (meetingId) => {
    try {
      setLoadingMeeting(true);
      setMeetingError(null);
      const res = await getBackoutsByMeeting(meetingId);
      const base = res?.data !== undefined ? res.data : res;
      const list = Array.isArray(base?.data) ? base.data : (Array.isArray(base) ? base : []);
      setMeetingBackouts(Array.isArray(list) ? list : []);
    } catch (e) {
      setMeetingBackouts([]);
      setMeetingError('Failed to load meeting backouts.');
    } finally {
      setLoadingMeeting(false);
    }
  };

  const loadMonthly = async () => {
    try {
      setLoadingMonthly(true);
      setMonthlyError(null);

      // Find meetings in the current month
      const meetingsInMonth = sortedMeetings.filter(m => {
        if (!m?.meetingDate) return false;
        return monthKey(m.meetingDate) === currentMonthKey;
      });

      // Fetch backouts for these meetings and aggregate per user
      const counts = {};
      await Promise.all(
        meetingsInMonth.map(async (m) => {
          try {
            const r = await getBackoutsByMeeting(m.meetingId);
            const base = r?.data !== undefined ? r.data : r;
            const rows = Array.isArray(base?.data) ? base.data : (Array.isArray(base) ? base : []);
            rows.forEach(row => {
              const uid = row.userId ?? row.user?.userId;
              if (uid == null) return;
              counts[uid] = (counts[uid] || 0) + 1;
            });
          } catch (_) { /* ignore single meeting failures */ }
        })
      );

      setMonthlyCounts(counts);
    } catch (e) {
      setMonthlyCounts({});
      setMonthlyError('Failed to load monthly backouts.');
    } finally {
      setLoadingMonthly(false);
    }
  };

  const renderUserTotals = () => (
    <div>
      {totalsError && <Alert variant="danger">{totalsError}</Alert>}
      {loadingTotals ? (
        <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>
      ) : totals.length === 0 ? (
        <div className="text-center text-muted py-4">No backouts found.</div>
      ) : (
        <div className="table-responsive">
          <Table striped hover className="mb-0">
            <thead>
              <tr>
                <th><Users size={16} className="me-1" />Member</th>
                <th className="text-end">Total Backouts</th>
              </tr>
            </thead>
            <tbody>
              {totals.map((row, idx) => {
                const uid = row.userId ?? row.user?.userId;
                const name = userById[uid]?.userName || row.userName || row.memberName || `User #${uid}`;
                return (
                  <tr key={idx}>
                    <td>{name}</td>
                    <td className="text-end">{row.totalBackoutCount ?? row.count ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );

  const renderMeetingWise = () => {
    // group meetingBackouts by user for this meeting
    const grouped = {};
    (meetingBackouts || []).forEach(b => {
      const uid = b.userId ?? b.user?.userId;
      if (uid == null) return;
      grouped[uid] = (grouped[uid] || 0) + 1;
    });
    const rows = Object.entries(grouped).map(([uid, count]) => ({ uid: Number(uid), count }));

    return (
      <div>
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <Form.Label className="mb-0 me-2"><Calendar size={16} className="me-1" />Select Meeting:</Form.Label>
          <Form.Select
            value={selectedMeetingId || ''}
            onChange={(e) => setSelectedMeetingId(Number(e.target.value))}
            style={{ maxWidth: 360 }}
          >
            {sortedMeetings.map(m => (
              <option key={m.meetingId} value={m.meetingId}>
                {m.meetingTheme || 'Meeting'} — {m.meetingDate ? new Date(m.meetingDate).toLocaleDateString() : ''}
              </option>
            ))}
          </Form.Select>
          <Button variant="outline-secondary" size="sm" onClick={() => selectedMeetingId && loadMeetingBackouts(selectedMeetingId)}>
            Refresh
          </Button>
        </div>

        {meetingError && <Alert variant="danger">{meetingError}</Alert>}
        {loadingMeeting ? (
          <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>
        ) : rows.length === 0 ? (
          <div className="text-center text-muted py-4">No backouts for this meeting.</div>
        ) : (
          <div className="table-responsive">
            <Table striped hover className="mb-0">
              <thead>
                <tr>
                  <th><Users size={16} className="me-1" />Member</th>
                  <th className="text-end">Backouts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.uid}>
                    <td>{userById[r.uid]?.userName || `User #${r.uid}`}</td>
                    <td className="text-end">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    );
  };

  const renderMonthly = () => {
    const totalMonthly = Object.values(monthlyCounts).reduce((a, b) => a + b, 0);
    const rows = Object.entries(monthlyCounts)
      .map(([uid, count]) => ({ uid: Number(uid), count }))
      .sort((a, b) => b.count - a.count);

    return (
      <div>
        <div className="d-flex align-items-center gap-2 mb-3">
          <Badge bg="info" text="dark"><BarChart2 size={14} className="me-1" />Current Month</Badge>
          <Button variant="outline-secondary" size="sm" onClick={loadMonthly}>Refresh</Button>
          <div className="ms-auto text-muted">Total: {totalMonthly}</div>
        </div>
        {monthlyError && <Alert variant="danger">{monthlyError}</Alert>}
        {loadingMonthly ? (
          <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>
        ) : rows.length === 0 ? (
          <div className="text-center text-muted py-4">No backouts recorded this month.</div>
        ) : (
          <div className="table-responsive">
            <Table striped hover className="mb-0">
              <thead>
                <tr>
                  <th><Users size={16} className="me-1" />Member</th>
                  <th className="text-end">Backouts (This Month)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.uid}>
                    <td>{userById[r.uid]?.userName || `User #${r.uid}`}</td>
                    <td className="text-end">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal show={show} onHide={onHide} centered size="xl" dialogClassName="backouts-modal-xl">
      <Modal.Header closeButton>
        <Modal.Title>Track Backouts</Modal.Title>
      </Modal.Header>
      <Modal.Body className="backouts-modal-body">
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'user')} className="mb-3">
          <Tab eventKey="user" title="User-wise Totals">
            {renderUserTotals()}
          </Tab>
          <Tab eventKey="meeting" title="Meeting-wise">
            {renderMeetingWise()}
          </Tab>
          <Tab eventKey="monthly" title="Monthly (Per User)">
            {renderMonthly()}
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BackoutsModal;
