import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Table, Button, Form, Alert, Spinner, Dropdown, Modal } from 'react-bootstrap';
import { Clock, Plus, Save, ArrowLeft, Trash2, Download } from 'lucide-react';
import { getAgenda, addAgendaRows, copyAgendaByMeeting } from '../../api/AgendaJoinApi';
import { getUserById, getAllMembers } from '../../api/UserApi';
import { getAllMemberAvailability } from '../../api/AvailableMembersApi';
import { getMeetingById, getAllUpcomingMeetings } from '../../api/MeetingApi';
import { getAllAgendaSections, addAgendaSection, updateAgendaSection, deleteAgendaSection } from '../../api/AgendaSectionApi';
import { getSpeakerSpeechByMeeting } from '../../api/SpeakerSpeechApi';

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
  const [sections, setSections] = useState([]);
  const [sectionById, setSectionById] = useState({});
  const [selectedSectionId, setSelectedSectionId] = useState(1); // default to 1 as requested
  const [showManageSectionsModal, setShowManageSectionsModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [editingSectionNames, setEditingSectionNames] = useState({}); // { [id]: name }
  const [selectedRowIndex, setSelectedRowIndex] = useState(null); // index of the row clicked/selected
  const [speakerSpeeches, setSpeakerSpeeches] = useState([]); // speaker speech data for the meeting
  const [meetingInfo, setMeetingInfo] = useState(null); // holds meeting date/time
  // Import Agenda modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [fromMeetingId, setFromMeetingId] = useState('');
  const [importing, setImporting] = useState(false);
  const [meetingsList, setMeetingsList] = useState([]);

  const normalizeSectionId = (v) => {
    const n = parseInt(v);
    return Number.isFinite(n) && n > 0 ? n : 1;
  };

  const loadMeetingsList = async () => {
    try {
      const resp = await getAllUpcomingMeetings();
      const list = resp?.data?.data || resp?.data || [];
      setMeetingsList(Array.isArray(list) ? list : []);
    } catch (e) {
      console.warn('Failed to load meetings list for import agenda', e?.message);
      setMeetingsList([]);
    }
  };

  const handleImportAgenda = async () => {
    if (!fromMeetingId || !meetingId) return;
    try {
      setImporting(true);
      setError(null);
      await copyAgendaByMeeting(parseInt(fromMeetingId), parseInt(meetingId));
      await loadAgendaData();
      setShowImportModal(false);
      setFromMeetingId('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500);
    } catch (err) {
      console.error('Import agenda failed:', err?.response || err);
      const data = err?.response?.data;
      let msg = err?.message || 'Failed to import agenda. Please try again.';
      if (typeof data === 'string' && data.trim()) msg = data;
      else if (data && typeof data === 'object') msg = data.message || data.error || JSON.stringify(data);
      setError(msg);
    } finally {
      setImporting(false);
    }
  };

  // Recalculate all data rows' sectionId based on the flow of headers
  // Any row with an invalid/deleted sectionId gets reassigned to nearest header above or 1
  const recalcSectionIdsFromHeaders = (list) => {
    const next = list.map(x => ({ ...x }));
    const validIds = new Set([1, ...(sections || []).map(s => normalizeSectionId(s.sectionId || s.id))]);
    let current = 1;
    for (let i = 0; i < next.length; i++) {
      const row = next[i];
      if (row.isSection) {
        const hdrId = normalizeSectionId(row.sectionId);
        // Keep valid headers, convert invalid ones to section 1
        if (validIds.has(hdrId)) {
          current = hdrId;
          row.sectionId = hdrId;
        } else {
          current = 1;
          row.sectionId = 1;
          // Update section name for invalid headers
          const defaultSection = sections.find(s => normalizeSectionId(s.sectionId || s.id) === 1);
          row.sectionName = defaultSection?.sectionName || 'No Section';
        }
      } else {
        // For data rows, preserve a valid existing sectionId; otherwise inherit from current header
        const existing = normalizeSectionId(row.sectionId || row.agendaSectionId || row?.agendaSection?.sectionId || 0);
        if (validIds.has(existing)) {
          row.sectionId = existing;
        } else {
          row.sectionId = normalizeSectionId(current || 1);
        }
      }
    }
    return next;
  };

  // Helper to get a row's effective section id (works for both data and loaded rows)
  const getRowSectionId = (it) => normalizeSectionId(it?.sectionId || it?.agendaSectionId || it?.agendaSection?.sectionId || 1);

  // Compute the effective section context up to and including the given index
  // This emulates how section flows down until changed by a header or explicit row.sectionId
  const computeEffectiveSectionIdForIndex = (idx) => {
    if (!Array.isArray(agendaData) || agendaData.length === 0) return normalizeSectionId(selectedSectionId || 1);
    let current = 1;
    for (let i = 0; i <= idx && i < agendaData.length; i++) {
      const row = agendaData[i];
      if (row?.isSection) {
        current = normalizeSectionId(row.sectionId);
      } else if (row?.sectionId) {
        current = normalizeSectionId(row.sectionId);
      } else {
        // inherit
        current = normalizeSectionId(current);
      }
    }
    return normalizeSectionId(current || selectedSectionId || 1);
  };

  // Helper functions for speech sections
  const isSpeechSection = (sectionName) => {
    if (!sectionName) return false;
    const name = sectionName.toLowerCase();
    return name.includes('speech');
  };

  const formatPathwaysTrack = (track) => {
    if (!track) return '';
    return track.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
  };

  const formatLevel = (level) => {
    if (!level) return '';
    return `L${level}`;
  };

  const formatProjectNo = (projectNo) => {
    if (!projectNo) return '';
    const num = parseInt(projectNo);
    return Number.isFinite(num) ? `P${num}` : projectNo;
  };

  const calculateAverageTime = (minTime, maxTime) => {
    const min = parseInt(minTime) || 0;
    const max = parseInt(maxTime) || 0;
    if (min === 0 && max === 0) return 0;
    return Math.round((min + max) / 2);
  };

  const getCurrentSectionName = (index) => {
    // Walk backwards to find the current section
    for (let i = index; i >= 0; i--) {
      const row = agendaData[i];
      if (row?.isSection) {
        return row.sectionName;
      }
    }
    // If no explicit header found, check the row's sectionId
    const currentRow = agendaData[index];
    if (currentRow?.sectionId) {
      return sectionById[currentRow.sectionId] || '';
    }
    return '';
  };

  useEffect(() => {
    if (meetingId) {
      loadMeetingInfo();
      loadAgendaData();
      loadAvailableMembers();
      loadAgendaSections();
      loadMeetingsList();
    }
  }, [meetingId]);

  const loadMeetingInfo = async () => {
    try {
      const resp = await getMeetingById(meetingId);
      // Handle common response wrappers
      const data = resp?.data?.data || resp?.data || resp;
      setMeetingInfo(data);
    } catch (e) {
      console.warn('Failed to load meeting info for dynamic time:', e?.message);
      setMeetingInfo(null);
    }
  };

  const loadAgendaData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAgenda(meetingId);
      console.log('=== AGENDA API RESPONSE ===');
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Response data.data:', response.data.data);
      
      let agenda = response.data.data?.agenda || [];
      let speakerSpeeches = response.data.data?.speakerSpeeches || [];
      
      console.log('Extracted agenda:', agenda);
      console.log('Extracted speakerSpeeches (from getAgenda):', speakerSpeeches);
      console.log('SpeakerSpeeches length (from getAgenda):', speakerSpeeches.length);

      // Fallback: if getAgenda did not include speakerSpeeches, fetch directly
      if (!Array.isArray(speakerSpeeches) || speakerSpeeches.length === 0) {
        try {
          console.log('Speaker speeches missing in getAgenda; fetching via SpeakerSpeechApi...');
          const ssResp = await getSpeakerSpeechByMeeting(meetingId);
          const payload = ssResp?.data ?? ssResp;
          // Normalize to array (API may return a single object)
          speakerSpeeches = Array.isArray(payload) ? payload : [payload].filter(Boolean);
          console.log('Fetched speakerSpeeches via fallback:', speakerSpeeches);
        } catch (ssErr) {
          console.warn('Fallback fetch for speakerSpeeches failed:', ssErr?.response || ssErr);
          speakerSpeeches = [];
        }
      }

      // Apply client-side saved order if available (best-effort)
      try {
        const orderKey = `tm_agenda_order_${meetingId}`;
        const stored = JSON.parse(localStorage.getItem(orderKey) || '[]');
        if (Array.isArray(stored) && stored.length) {
          const sig = (r) => `${r.activity || ''}|${r.userId || ''}|${r.minTime || ''}|${r.maxTime || ''}|${r.sectionId || r.agendaSectionId || r?.agendaSection?.sectionId || 1}`;
          const orderMap = new Map(stored.map((s, idx) => [s, idx]));
          agenda = [...agenda].sort((a, b) => {
            const ia = orderMap.get(sig(a));
            const ib = orderMap.get(sig(b));
            if (ia == null && ib == null) return 0;
            if (ia == null) return 1;
            if (ib == null) return -1;
            return ia - ib;
          });
        }
      } catch (_) {}
      
      // Transform agenda data to include editable fields and carry section id if present
      let editableAgenda = agenda.map((item, index) => ({
        ...item,
        id: item.agendaId || `temp-${index}`,
        isNew: false,
        sectionId: normalizeSectionId(item.sectionId || item.agendaSectionId || item.agendaSection?.sectionId || 1)
      }));
      
      // Add PREPARED SPEECHES SESSION if speaker speeches exist
      console.log('Checking if speakerSpeeches exist (final):', speakerSpeeches && speakerSpeeches.length > 0);
      if (speakerSpeeches && speakerSpeeches.length > 0) {
        console.log('Setting speaker speeches:', speakerSpeeches);
        setSpeakerSpeeches(speakerSpeeches);
        // Create speech section header (No section context -> sectionId 1)
        const speechSectionHeader = {
          id: `speech-section-${Date.now()}`,
          isSection: true,
          sectionId: 1,
          sectionName: 'PREPARED SPEECHES SESSION'
        };
        
        // Create speech rows
        const speechRows = speakerSpeeches.map((speech, index) => ({
          id: `speech-${speech.speechId || Date.now()}-${index}`,
          activity: speech.title || 'Speech Title',
          minTime: parseInt(speech.minSpeechTime) || 0,
          avgTime: Math.round(((parseInt(speech.minSpeechTime) || 0) + (parseInt(speech.maxSpeechTime) || 0)) / 2),
          maxTime: parseInt(speech.maxSpeechTime) || 0,
          userId: speech.userId || '',
          meetingId: parseInt(meetingId),
          isNew: false,
          sectionId: 1,
          isSpeechRow: true,
          speechData: speech
        }));
        
        console.log('Speech section header:', speechSectionHeader);
        console.log('Speech rows:', speechRows);
        
        // Prepare a helper empty row (used only if there is no existing No section row)
        const emptyTopRow = {
          id: `new-${Date.now()}`,
          activity: '',
          minTime: 0,
          avgTime: 0,
          maxTime: 0,
          userId: '',
          meetingId: parseInt(meetingId),
          isNew: true,
          sectionId: 1
        };
        // Partition existing agenda so that all sectionId=1 rows are kept at the very top, then speech section, then the rest
        const baseRows = Array.isArray(editableAgenda) ? editableAgenda : [];
        const topNoSectionRows = baseRows.filter(r => !r.isSection && normalizeSectionId(r.sectionId || r.agendaSectionId || r?.agendaSection?.sectionId || 1) === 1);
        const otherRows = baseRows.filter(r => r.isSection || normalizeSectionId(r.sectionId || r.agendaSectionId || r?.agendaSection?.sectionId || 1) !== 1);
        // Rebuild agenda so order is: (conditionally) empty row, all no-section rows, speech header + rows, then other rows
        const prefixRows = topNoSectionRows.length > 0 ? topNoSectionRows : [emptyTopRow];
        editableAgenda = [...prefixRows, speechSectionHeader, ...speechRows, ...otherRows];
        console.log('Updated agenda after inserting speeches:', editableAgenda);
      } else {
        console.log('No speaker speeches found or empty array');
      }
      
      setAgendaData(editableAgenda);
    } catch (err) {
      console.error('Error loading agenda:', err);
      setError('Failed to load agenda data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadAgendaSections = async () => {
    try {
      const resp = await getAllAgendaSections();
      // Handle common wrappers
      const list = Array.isArray(resp)
        ? resp
        : Array.isArray(resp?.data)
          ? resp.data
          : Array.isArray(resp?.data?.data)
            ? resp.data.data
            : [];
      setSections(list);
      const map = {};
      list.forEach(s => { map[(s.sectionId || s.id)] = s.sectionName; });
      setSectionById(map);
      // If sectionId 1 exists use it as default, else first available
      const hasDefault = list.some(s => (s.sectionId || s.id) === 1);
      setSelectedSectionId(hasDefault ? 1 : (list[0]?.sectionId || list[0]?.id || 1));
    } catch (e) {
      // fallback keeps default = 1
      console.warn('Failed to load agenda sections', e?.message);
    }
  };

  // SpeakerSpeeches are now loaded as part of getAgenda, so this function is no longer needed
  // const loadSpeakerSpeeches = async () => {
  //   // Speeches are loaded via getAgenda API
  // };

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
    // Determine insertion index: below selected row if any, else at bottom
    const insertIndex = (selectedRowIndex != null) ? (selectedRowIndex + 1) : agendaData.length;
    // Determine section for this new row based on selection context; else fallback to last header/current selected
    const lastSection = [...agendaData].reverse().find(r => r.isSection);
    const contextSectionId = (selectedRowIndex != null)
      ? computeEffectiveSectionIdForIndex(selectedRowIndex)
      : normalizeSectionId(lastSection?.sectionId || selectedSectionId || 1);

    // Always add a regular row (do not auto-add speech rows)
    const newRow = {
      id: `new-${Date.now()}`,
      activity: '',
      minTime: 0,
      avgTime: 0,
      maxTime: 0,
      userId: '',
      meetingId: parseInt(meetingId),
      isNew: true,
      sectionId: contextSectionId
    };

    setAgendaData(prev => {
      const next = [...prev];
      next.splice(insertIndex, 0, newRow);
      return next;
    });
  };

  const handleAddNoSectionRow = () => {
    const insertIndex = (selectedRowIndex != null) ? (selectedRowIndex + 1) : agendaData.length;
    const newRow = {
      id: `new-${Date.now()}`,
      activity: '',
      minTime: 0,
      avgTime: 0,
      maxTime: 0,
      userId: '',
      meetingId: parseInt(meetingId),
      isNew: true,
      sectionId: 1
    };
    setAgendaData(prev => {
      const next = [...prev];
      next.splice(insertIndex, 0, newRow);
      return next;
    });
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

  // Manage Sections Handlers
  const openManageSections = () => {
    // seed editing names
    const names = {};
    sections.forEach(s => { names[s.sectionId || s.id] = s.sectionName; });
    setEditingSectionNames(names);
    setShowManageSectionsModal(true);
  };

  const handleUpdateSection = async (id) => {
    try {
      const name = editingSectionNames[id];
      if (!name || !String(name).trim()) return;
      await updateAgendaSection(id, { sectionName: name.trim() });
      await loadAgendaSections();
    } catch (e) {
      console.error('Update section failed', e?.response || e);
    }
  };

  const handleDeleteSection = async (id) => {
    if (id === 1) return; // protect No section
    try {
      await deleteAgendaSection(id);
      await loadAgendaSections();

      // Remove any header markers for this section and reassign impacted rows
      setAgendaData(prev => {
        // remove header rows with this section id
        const withoutHeaders = prev.filter(r => !(r.isSection && normalizeSectionId(r.sectionId) === normalizeSectionId(id)));
        // recalc inheritance so rows that pointed to deleted section adopt the nearest header above or 1
        return recalcSectionIdsFromHeaders(withoutHeaders);
      });
    } catch (e) {
      console.error('Delete section failed', e?.response || e);
    }
  };

  const handleAddSection = async () => {
    try {
      if (!newSectionName || !newSectionName.trim()) return;
      const createdResp = await addAgendaSection({ sectionName: newSectionName.trim() });
      const createdName = newSectionName.trim();
      setNewSectionName('');
      setShowAddSectionModal(false);

      // Reload sections and then auto-insert a header marker for the newly created section
      try {
        const resp = await getAllAgendaSections();
        const list = Array.isArray(resp)
          ? resp
          : Array.isArray(resp?.data)
            ? resp.data
            : Array.isArray(resp?.data?.data)
              ? resp.data.data
              : [];
        setSections(list);
        const map = {};
        list.forEach(s => { map[(s.sectionId || s.id)] = s.sectionName; });
        setSectionById(map);

        // Find the newly created section by name
        const newlyCreated = list.find(s => String(s.sectionName).trim().toLowerCase() === createdName.toLowerCase());
        const newId = newlyCreated ? (newlyCreated.sectionId || newlyCreated.id) : null;
        if (newId) {
          setSelectedSectionId(newId);
          // Insert a header marker for this section at the current context
          const headerRow = {
            id: `section-${newId}-${Date.now()}`,
            isSection: true,
            sectionId: normalizeSectionId(newId),
            sectionName: newlyCreated.sectionName
          };
          setAgendaData(prev => {
            const next = [...prev];
            const insertIndex = (selectedRowIndex != null) ? (selectedRowIndex + 1) : next.length;
            next.splice(insertIndex, 0, headerRow);
            return recalcSectionIdsFromHeaders(next);
          });
        }
      } catch (e) {
        console.warn('Failed to reload sections after create', e?.message);
        // Fallback: still reload via existing helper
        await loadAgendaSections();
      }
    } catch (e) {
      console.error('Add section failed', e?.response || e);
    }
  };

  const handleAddSectionHeader = (sectionId) => {
    sectionId = normalizeSectionId(sectionId);
    setSelectedSectionId(sectionId);
    const section = sections.find(s => (s.sectionId || s.id) === sectionId);
    const name = section?.sectionName || 'Section';
    const headerRow = {
      id: `section-${sectionId}-${Date.now()}`,
      isSection: true,
      sectionId: sectionId,
      sectionName: name
    };
    const insertIndex = (selectedRowIndex != null) ? (selectedRowIndex + 1) : agendaData.length;
    setAgendaData(prev => {
      const next = [...prev];
      next.splice(insertIndex, 0, headerRow);
      return recalcSectionIdsFromHeaders(next);
    });
  };

  // Remove a section header row at a given index (does not delete the section entity)
  const handleDeleteSectionHeaderAtIndex = (index) => {
    setAgendaData(prev => {
      if (!prev[index]?.isSection) return prev;
      const next = prev.slice(0, index).concat(prev.slice(index + 1));
      const recalced = recalcSectionIdsFromHeaders(next);
      // adjust selection if needed
      if (selectedRowIndex != null) {
        const newSel = Math.min(recalced.length - 1, Math.max(0, selectedRowIndex - (index <= selectedRowIndex ? 1 : 0)));
        setSelectedRowIndex(Number.isFinite(newSel) ? newSel : null);
      }
      return recalced;
    });
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
    // After reordering, ensure each data row's sectionId reflects the nearest header above
    setAgendaData(recalcSectionIdsFromHeaders(newOrder));
    setDragIndex(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Validate required fields (ignore section header rows and dynamic speech rows)
      const isEmptyRow = (row) => {
        const act = String(row.activity || '').trim();
        const uid = row.userId;
        const min = parseInt(row.minTime) || 0;
        const avg = parseInt(row.avgTime) || 0;
        const max = parseInt(row.maxTime) || 0;
        return act === '' && (!uid || String(uid).trim() === '') && min === 0 && avg === 0 && max === 0;
      };
      const invalidRows = agendaData
        .filter(row => !row.isSection && !row.isSpeechRow)
        .filter(row => {
          // Skip fully empty helper rows
          if (isEmptyRow(row)) return false;
          // Otherwise require fields
          return !String(row.activity || '').trim() || !row.userId || (parseInt(row.maxTime) || 0) <= 0;
        });
      
      if (invalidRows.length > 0) {
        setError('Please fill in all required fields (Activity, Presenter, and Max Time) for all rows.');
        return;
      }

      // Prepare data for API - only send non-section rows with correct section inheritance
      const rowsToSave = [];
      // Ensure we are using a recalculated list to avoid any invalid/deleted section ids
      const workingList = recalcSectionIdsFromHeaders(agendaData);
      let currentSectionId = 1; // default section ID
      
      // Build rows to save and persist client-side order signature for next load
      const orderKey = `tm_agenda_order_${meetingId}`;
      const orderSignatures = [];

      for (const row of workingList) {
        if (row.isSection) {
          // Explicit header row updates the running section
          currentSectionId = normalizeSectionId(row.sectionId);
          continue;
        }
        // Skip dynamic speech rows from being persisted to backend
        if (row.isSpeechRow) {
          continue;
        }
        // Skip fully empty helper rows
        if (isEmptyRow(row)) {
          continue;
        }

        // Prefer the row's own sectionId if present; else use the running section; else default 1
        const effectiveRowSectionId = normalizeSectionId(row.sectionId || currentSectionId || 1);

        const payload = {
          activity: row.activity,
          minTime: row.minTime,
          avgTime: row.avgTime,
          maxTime: row.maxTime,
          userId: parseInt(row.userId),
          meetingId: parseInt(meetingId),
          sectionId: effectiveRowSectionId
        };
        rowsToSave.push(payload);

        // push signature to persist order client-side (only for persisted rows)
        orderSignatures.push(`${payload.activity || ''}|${payload.userId || ''}|${payload.minTime || ''}|${payload.maxTime || ''}|${payload.sectionId || 1}`);
      }

      console.log('Submitting agenda rows:', rowsToSave);
      // Prevent calling API with nothing to save
      if (!rowsToSave.length) {
        setError('Please add at least one agenda row (Activity, Presenter, Max Time) before saving.');
        return;
      }

      await addAgendaRows(rowsToSave);

      // Save order signatures for reload sorting
      try { localStorage.setItem(orderKey, JSON.stringify(orderSignatures)); } catch(_) {}
      
      setSuccess(true);
      setTimeout(() => {
        if (onBack) onBack();
      }, 1000);
      
    } catch (err) {
      console.error('Error saving agenda:', err?.response || err);
      // Extract the most helpful message
      const data = err?.response?.data;
      let msg = err?.message || 'Failed to save agenda. Please try again.';
      if (typeof data === 'string' && data.trim()) {
        msg = data;
      } else if (data && typeof data === 'object') {
        msg = data.message || data.error || JSON.stringify(data);
      }
      // Friendly fallback for 400/422/500
      if (err?.response?.status >= 500 && rowsToSave?.length === 0) {
        msg = 'Please add at least one agenda row (Activity, Presenter, Max Time) before saving.';
      }
      setError(msg);
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

              {/* Manage Sections Modal */}
              <Modal show={showManageSectionsModal} onHide={() => setShowManageSectionsModal(false)} centered size="md">
                <Modal.Header closeButton>
                  <Modal.Title>Manage Sections</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className="mb-3 d-flex justify-content-end">
                    <Button size="sm" variant="primary" onClick={() => setShowAddSectionModal(true)}>
                      <Plus size={14} className="me-1" /> Add Section
                    </Button>
                  </div>
                  {sections && sections.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {sections
                        .filter(s => (s.sectionId || s.id) !== 1)
                        .map((s) => {
                          const id = s.sectionId || s.id;
                          return (
                            <div key={id} className="d-flex align-items-center gap-2">
                              <Form.Control
                                size="sm"
                                value={editingSectionNames[id] ?? s.sectionName}
                                onChange={(e) => setEditingSectionNames(prev => ({ ...prev, [id]: e.target.value }))}
                              />
                              <Button size="sm" variant="outline-success" onClick={() => handleUpdateSection(id)}>Update</Button>
                              <Button size="sm" variant="outline-danger" onClick={() => handleDeleteSection(id)}>Delete</Button>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-muted">No sections available.</div>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowManageSectionsModal(false)}>Close</Button>
                </Modal.Footer>
              </Modal>

              {/* Add Section Modal */}
              <Modal show={showAddSectionModal} onHide={() => setShowAddSectionModal(false)} centered>
                <Modal.Header closeButton>
                  <Modal.Title>Add Section</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form.Group>
                    <Form.Label>Section Name</Form.Label>
                    <Form.Control
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      placeholder="Enter section name"
                    />
                  </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowAddSectionModal(false)}>Cancel</Button>
                  <Button variant="primary" onClick={handleAddSection}>Add</Button>
                </Modal.Footer>
              </Modal>
              <div>
                <Button 
                  variant="warning"
                  className="me-2"
                  size="sm"
                  onClick={openManageSections}
                >
                  Manage Sections
                </Button>
                <Button
                  variant="light"
                  className="text-dark"
                  size="sm"
                  onClick={() => setShowImportModal(true)}
                >
                  <Download size={16} className="me-1" />
                  Import Agenda
                </Button>
              </div>
            </Card.Header>

            {/* Import Agenda Modal */}
            <Modal show={showImportModal} onHide={() => setShowImportModal(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>Import Agenda From Previous Meeting</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Select source meeting</Form.Label>
                  <Form.Select
                    value={fromMeetingId}
                    onChange={(e) => setFromMeetingId(e.target.value)}
                  >
                    <option value="">-- Select Meeting --</option>
                    {meetingsList
                      .filter(m => String(m.meetingId) !== String(meetingId))
                      .map(m => (
                        <option key={m.meetingId} value={m.meetingId}>
                          {`${m.meetingId} - ${m.meetingDate} - ${m.meetingTheme || ''} ${m.category && m.category !== 'Regular' ? `(${m.category})` : ''}`}
                        </option>
                      ))}
                  </Form.Select>
                  <div className="form-text">Imports agenda items from the selected meeting into this meeting.</div>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowImportModal(false)} disabled={importing}>Cancel</Button>
                <Button variant="primary" onClick={handleImportAgenda} disabled={!fromMeetingId || importing}>
                  {importing ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-1" /> Importing...
                    </>
                  ) : (
                    <>
                      <Download size={16} className="me-1" /> Import
                    </>
                  )}
                </Button>
              </Modal.Footer>
            </Modal>
            
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
                      // Calculate time offset for this row (in minutes) based on cumulative maxTime above)
                      let currentMinutesOffset = 0;
      
                      // Parse time string to minutes for calculation
                      const parseTimeToMinutes = (timeVal) => {
                        // Accept numbers, strings like '2:30', '150', etc.
                        if (timeVal === null || timeVal === undefined || timeVal === '') return 0;
                        if (typeof timeVal === 'number' && Number.isFinite(timeVal)) return timeVal;
                        const timeStr = String(timeVal);
                        // Handle format like "2:30" or "2" or "30"
                        if (timeStr.includes(':')) {
                          const parts = timeStr.split(':');
                          const hours = parseInt(parts[0]) || 0;
                          const minutes = parseInt(parts[1]) || 0;
                          return hours * 60 + minutes;
                        }
                        // If no colon, treat as minutes
                        const mins = parseInt(timeStr);
                        return Number.isFinite(mins) ? mins : 0;
                      };

                      // Sum previous rows' maxTime
                      for (let i = 0; i < index; i++) {
                        currentMinutesOffset += parseTimeToMinutes(agendaData[i].maxTime);
                      }

                      // Format time by adding offset to the actual meeting start datetime
                      const formatTimeFromStart = (offsetMinutes) => {
                        if (!meetingInfo?.meetingDate || !meetingInfo?.startTime) return '--:--';
                        const base = new Date(`${meetingInfo.meetingDate}T${meetingInfo.startTime}`);
                        if (isNaN(base.getTime())) return '--:--';
                        const dt = new Date(base.getTime() + offsetMinutes * 60000);
                        const hours = dt.getHours();
                        const minutes = dt.getMinutes().toString().padStart(2, '0');
                        const ampm = hours >= 12 ? 'PM' : 'AM';
                        const displayHour = hours % 12 || 12;
                        return `${displayHour}:${minutes} ${ampm}`;
                      };

                      if (item.isSection) {
                        return (
                          <tr 
                            key={item.id}
                            onClick={() => setSelectedRowIndex(index)}
                            className={selectedRowIndex === index ? 'table-primary' : ''}
                            style={{ cursor: 'pointer' }}
                          >
                            <td colSpan={7} className="fw-bold" style={{ backgroundColor: '#f1f3f5' }}>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="w-100 text-center">{item.sectionName}</span>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm" 
                                  className="ms-2"
                                  title="Delete this section header marker"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteSectionHeaderAtIndex(index); }}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      // For loaded rows without explicit header rows, compute section header when section changes
                      const normalizeId = (v) => {
                        const n = parseInt(v);
                        return Number.isFinite(n) && n > 0 ? n : 1;
                      };
                      const getRowSectionId = (it) => normalizeId(it?.sectionId || it?.agendaSectionId || it?.agendaSection?.sectionId || 1);
                      const currSectionId = getRowSectionId(item);
                      let prevSectionId = 1;
                      for (let i = index - 1; i >= 0; i--) {
                        if (!agendaData[i].isSection) { prevSectionId = getRowSectionId(agendaData[i]); break; }
                        if (agendaData[i].isSection) { prevSectionId = normalizeId(agendaData[i].sectionId); break; }
                      }
                      const shouldShowComputedHeader = currSectionId !== 1 && currSectionId !== prevSectionId;
                      const computedHeaderName = sectionById[currSectionId] || item?.agendaSection?.sectionName || `Section ${currSectionId}`;

                      const blockKey = `edit-rowblock-${item.agendaId || item.id || index}`;
                      return (
                        <React.Fragment key={blockKey}>
                          {shouldShowComputedHeader && computedHeaderName && (
                            <tr key={`hdr-${currSectionId}-${index}`}>
                              <td colSpan={7} className="text-center fw-bold" style={{ backgroundColor: '#f1f3f5' }}>
                                {computedHeaderName}
                              </td>
                            </tr>
                          )}
                          <tr 
                            key={`data-${item.agendaId || item.id || index}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                            onClick={() => setSelectedRowIndex(index)}
                            className={selectedRowIndex === index ? 'table-primary' : ''}
                            style={{ cursor: 'pointer' }}
                          >
                            <td 
                              className="text-center align-middle"
                              onMouseDown={() => { allowDrag.current = false; }}
                            >
                              <strong>{formatTimeFromStart(currentMinutesOffset)}</strong>
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
                              {item.isSpeechRow && item.speechData ? (
                                <div className="d-flex">
                                  <div style={{ width: '10%', padding: '2px' }}>
                                    <small className="fw-bold text-primary">
                                      {formatPathwaysTrack(item.speechData.pathwaysTrack)}
                                    </small>
                                  </div>
                                  <div style={{ width: '10%', padding: '2px' }}>
                                    <small className="fw-bold text-success">
                                      {formatLevel(item.speechData.level)}
                                    </small>
                                  </div>
                                  <div style={{ width: '10%', padding: '2px' }}>
                                    <small className="fw-bold text-warning">
                                      {formatProjectNo(item.speechData.projectNo)}
                                    </small>
                                  </div>
                                  <div style={{ width: '70%', padding: '2px' }}>
                                    <small className="text-muted">
                                      {item.speechData.title || 'Speech title'}
                                    </small>
                                  </div>
                                </div>
                              ) : (
                                <Form.Control
                                  type="text"
                                  value={item.activity}
                                  onChange={(e) => handleInputChange(item.id, 'activity', e.target.value)}
                                  placeholder="Enter activity description"
                                  required
                                />
                              )}
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
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </Table>
              )}
              
              <div className="mt-3 d-flex justify-content-end align-items-center">
                <Dropdown drop="up" className="me-2">
                  <Dropdown.Toggle variant="outline-primary" size="sm" className="d-flex align-items-center">
                    <Plus size={16} className="me-1" />
                    {(() => {
                      const selected = sections.find(s => (s.sectionId || s.id) === selectedSectionId);
                      return selected ? `${selected.sectionName}` : `Add section`;
                    })()}
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    {sections && sections.length > 0 ? (
                      sections.map((sec) => (
                        <Dropdown.Item 
                          key={sec.sectionId || sec.id}
                          onClick={() => handleAddSectionHeader(sec.sectionId || sec.id)}
                        >
                          {sec.sectionName}
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item disabled>No sections found (default: ID 1)</Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
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