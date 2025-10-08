import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Badge, Alert, Spinner, Table, Modal, Pagination, InputGroup, Dropdown } from 'react-bootstrap';
import { Calendar, Clock, MapPin, Users, Settings, Plus, Edit, Trash2, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import { getAllMeetings, getAllUpcomingMeetings } from '../../api/MeetingApi';
import { getAllMemberAvailability } from '../../api/AvailableMembersApi';
import { getAllMembers } from '../../api/UserApi';
import { getMemberPreferredRoles, addMemberPreferredRole } from '../../api/PreferredRoleApi';
import { getMemberAssignedRole, addMemberAssignedRole, deleteMemberAssignedRole } from '../../api/AssignedRoleApi';
import { getAllMemberAssignedRolesByMeeting } from '../../api/AssignedRoleApi';
import { assignEvaluators as saveEvaluatorAssignments, getAllAssignedEvaluatorsByMeeting, deleteAssignedEvaluatorById as deleteEvaluatorAssignment } from '../../api/AssignEvaluatorApi';
import { getAllRoles, addRole, updateRole, deleteRole } from '../../api/RoleApi';
import { getAllMeetingRoleCombineByMeeting } from '../../api/MeetingRoleApi';
import { getLast3MeetingRoles } from '../../api/MeetingRoleApi'; // Fixed import

const AssignRole = () => {
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [availableMembers, setAvailableMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [memberRoles, setMemberRoles] = useState({});
  const [assignedRoles, setAssignedRoles] = useState({});
  const [availableRoles, setAvailableRoles] = useState([]);
  const [meetingSpecificRoles, setMeetingSpecificRoles] = useState([]);
  const [availableRoleCounts, setAvailableRoleCounts] = useState({});
  const [roleHistory, setRoleHistory] = useState([]); // Add state for role history
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  
  // Role management states
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleFormData, setRoleFormData] = useState({ roleName: '', description: '' });
  const [allRolesData, setAllRolesData] = useState([]);
  const [currentRolePage, setCurrentRolePage] = useState(1);
  const ROLES_PER_PAGE = 6; // Set constant for roles per page
  const [totalRolePages, setTotalRolePages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  
  // Role assignment modal state
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMemberRoles, setSelectedMemberRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allMeetings, setAllMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);

  // Assign Evaluator states
  const [showAssignEvaluatorModal, setShowAssignEvaluatorModal] = useState(false);
  const [speakerList, setSpeakerList] = useState([]); // [{ userId, memberName }]
  const [evaluatorList, setEvaluatorList] = useState([]); // [{ userId, memberName }]
  const [selectedSpeakerId, setSelectedSpeakerId] = useState('');
  const [selectedEvaluatorId, setSelectedEvaluatorId] = useState('');
  const [pairs, setPairs] = useState([]); // [{ id?, speakerId, speakerName, evaluatorId, evaluatorName, meetingId }]
  const [loadingEvaluatorData, setLoadingEvaluatorData] = useState(false);
  const [initialPairsSnapshot, setInitialPairsSnapshot] = useState(''); // JSON snapshot to detect unsaved changes

  const openAssignEvaluatorModal = async () => {
    if (!selectedMeetingId) return;
    setShowAssignEvaluatorModal(true);
    setLoadingEvaluatorData(true);
    try {
      // Ensure we have members for name lookup
      if (!allMembers || allMembers.length === 0) {
        try {
          const resp = await getAllMembers();
          setAllMembers(resp.data?.data || []);
        } catch (e) {
          console.warn('Could not refresh allMembers:', e?.message);
        }
      }

      // Helper to resolve a display name as `ID - Name`
      const getDisplayNameById = (uid) => {
        const mem = (allMembers || []).find(m => String(m.userId) === String(uid));
        const name = mem?.userName || [mem?.firstName, mem?.lastName].filter(Boolean).join(' ') || `Member #${uid}`;
        return `${uid} - ${name}`;
      };

      // 1) Fetch all assigned roles for the selected meeting
      const assigned = await getAllMemberAssignedRolesByMeeting(selectedMeetingId);
      const assignedList = assigned?.data || assigned?.data?.data || [];

      // Build unique speakers and evaluators lists from roles
      const speakersMap = new Map();
      const evaluatorsMap = new Map();
      const isSpeakerRole = (name) => typeof name === 'string' && name.toLowerCase().startsWith('speaker');
      const isEvaluatorRole = (name) => typeof name === 'string' && name.toLowerCase().startsWith('evaluator');

      assignedList.forEach((item) => {
        const roleName = item.roleName || item.name || '';
        const userId = item.userId || item.user?.userId || item.memberId;
        if (!userId) return;
        if (isSpeakerRole(roleName)) {
          if (!speakersMap.has(String(userId))) {
            speakersMap.set(String(userId), { userId, memberName: getDisplayNameById(userId) });
          }
        }
        if (isEvaluatorRole(roleName)) {
          if (!evaluatorsMap.has(String(userId))) {
            evaluatorsMap.set(String(userId), { userId, memberName: getDisplayNameById(userId) });
          }
        }
      });

      const speakers = Array.from(speakersMap.values());
      const evaluators = Array.from(evaluatorsMap.values());
      setSpeakerList(speakers);
      setEvaluatorList(evaluators);

      // 2) Load existing evaluator assignments for the meeting
      const existingRes = await getAllAssignedEvaluatorsByMeeting(selectedMeetingId);
      const existing = existingRes?.data?.data || [];
      const pairsWithNames = existing.map((a) => ({
        id: a.id,
        meetingId: a.meetingId,
        speakerId: a.speakerId,
        evaluatorId: a.evaluatorId,
        speakerName: getDisplayNameById(a.speakerId),
        evaluatorName: getDisplayNameById(a.evaluatorId),
      }));
      setPairs(pairsWithNames);
      // Save initial snapshot for dirty-check on close
      const snapshot = JSON.stringify(pairsWithNames.map(p => ({ id: p.id || null, speakerId: p.speakerId, evaluatorId: p.evaluatorId })));
      setInitialPairsSnapshot(snapshot);
    } catch (e) {
      console.error('Error loading evaluator assignment data:', e);
      setError('Failed to load evaluator assignment data');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoadingEvaluatorData(false);
    }
  };

  // Helper to refresh evaluator-speaker pairs for a meeting and update UI
  const refreshPairsForMeeting = async (meetingId) => {
    if (!meetingId) return;
    try {
      const existingRes = await getAllAssignedEvaluatorsByMeeting(meetingId);
      const existing = existingRes?.data?.data || [];
      const mapped = existing.map(a => ({
        id: a.id,
        meetingId: Number(a.meetingId || meetingId),
        speakerId: Number(a.speakerId),
        evaluatorId: Number(a.evaluatorId),
        speakerName: getMemberDisplayById(a.speakerId),
        evaluatorName: getMemberDisplayById(a.evaluatorId)
      }));
      setPairs(mapped);
    } catch (e) {
      console.warn('Failed to refresh pairs for meeting', meetingId, e?.message || e);
    }
  };

  // Keep pairs loaded for the selected meeting so the table can show relationships
  useEffect(() => {
    if (selectedMeetingId) {
      refreshPairsForMeeting(selectedMeetingId);
    } else {
      setPairs([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMeetingId]);

  const addPair = async () => {
    console.log('addPair called with:', { selectedSpeakerId, selectedEvaluatorId });
    console.log('Speaker list:', speakerList);
    console.log('Evaluator list:', evaluatorList);
    
    if (!selectedSpeakerId || !selectedEvaluatorId) {
      await Swal.fire({
        icon: 'info',
        title: 'Select both',
        text: 'Please select an evaluator and a speaker before assigning.'
      });
      return;
    }
    
    const speaker = speakerList.find(s => String(s.userId) === String(selectedSpeakerId));
    const evaluator = evaluatorList.find(e => String(e.userId) === String(selectedEvaluatorId));
    
    console.log('Found speaker:', speaker);
    console.log('Found evaluator:', evaluator);
    
    if (!speaker || !evaluator) {
      await Swal.fire({ icon: 'error', title: 'Not found', text: 'Speaker or evaluator not found in lists.' });
      return;
    }

    // Prevent self-assignment: same user cannot evaluate themselves
    if (String(speaker.userId) === String(evaluator.userId)) {
      console.log('Self-assignment prevented');
      Swal.fire({
        icon: 'warning',
        title: 'Not allowed',
        text: 'A member cannot be assigned as their own evaluator.'
      });
      return;
    }

    const exists = pairs.some(p => String(p.speakerId) === String(speaker.userId) && String(p.evaluatorId) === String(evaluator.userId));
    if (exists) {
      await Swal.fire({ icon: 'info', title: 'Already added', text: 'This evaluator-speaker pair is already in the list.' });
      return;
    }

    const confirmAdd = await Swal.fire({
      title: 'Add assignment?',
      html: `<div style="text-align:left">Evaluator: <b>${evaluator.memberName}</b><br/>Speaker: <b>${speaker.memberName}</b></div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Add',
      cancelButtonText: 'Cancel'
    });
    if (!confirmAdd.isConfirmed) return;

    const newPair = {
      meetingId: selectedMeetingId,
      speakerId: speaker.userId,
      evaluatorId: evaluator.userId,
      speakerName: speaker.memberName,
      evaluatorName: evaluator.memberName,
    };
    
    console.log('Adding new pair:', newPair);

    setPairs(prev => [...prev, newPair]);
    setSelectedSpeakerId('');
    setSelectedEvaluatorId('');
  };

  const removePair = async (index) => {
    const result = await Swal.fire({
      title: 'Remove assignment?',
      text: 'This will remove the selected evaluator-speaker pair.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });
    if (!result.isConfirmed) return;
    setPairs(prev => prev.filter((_, i) => i !== index));
  };

  const isPairsDirty = () => {
    try {
      const current = JSON.stringify(pairs.map(p => ({ id: p.id || null, speakerId: p.speakerId, evaluatorId: p.evaluatorId })));
      return current !== initialPairsSnapshot;
    } catch {
      return false;
    }
  };

  const handleCloseAssignEvaluatorModal = async () => {
    if (isPairsDirty()) {
      const res = await Swal.fire({
        title: 'Discard changes?',
        text: 'You have unsaved changes. Do you want to discard them?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Discard',
        cancelButtonText: 'Keep editing',
        reverseButtons: true
      });
      if (!res.isConfirmed) return;
    }
    setShowAssignEvaluatorModal(false);
  };

  const savePairs = async () => {
    const confirm = await Swal.fire({
      title: 'Save assignments?',
      text: 'This will save all evaluator-speaker assignments for this meeting.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel'
    });
    if (!confirm.isConfirmed) return;

    try {
      const payload = pairs.map(p => ({
        id: p.id || null,
        speakerId: Number(p.speakerId),
        evaluatorId: Number(p.evaluatorId),
        meetingId: Number(selectedMeetingId)
      }));
      console.log('Saving evaluator assignments payload:', payload);
      const resp = await saveEvaluatorAssignments(payload);
      console.log('Backend response:', resp);
      // If backend returns ResponseMessage, it will be under resp.data
      const ok = resp?.data?.success !== false; // treat as success unless explicitly false
      if (!ok) throw new Error(resp?.data?.message || 'Save failed');

      // Refresh from backend to get authoritative list (with IDs)
      const refreshed = await getAllAssignedEvaluatorsByMeeting(selectedMeetingId);
      const list = refreshed?.data?.data || [];

      // Ensure we still have allMembers for name resolution
      const getDisplayNameById = (uid) => {
        const mem = (allMembers || []).find(m => String(m.userId) === String(uid));
        const name = mem?.userName || [mem?.firstName, mem?.lastName].filter(Boolean).join(' ') || `Member #${uid}`;
        return `${uid} - ${name}`;
      };
      setPairs(list.map(a => ({
        id: a.id,
        meetingId: a.meetingId,
        speakerId: a.speakerId,
        evaluatorId: a.evaluatorId,
        speakerName: getDisplayNameById(a.speakerId),
        evaluatorName: getDisplayNameById(a.evaluatorId)
      })));

      await Swal.fire({
        icon: 'success',
        title: 'Saved',
        text: 'Evaluator assignments saved successfully.'
      });
      setShowAssignEvaluatorModal(false);
    } catch (e) {
      console.error('Error saving evaluator assignments:', e);
      Swal.fire({ icon: 'error', title: 'Error', text: e.response?.data?.message || e.message || 'Failed to save assignments' });
    }
  };

  // Filter meetings based on search term
  useEffect(() => {
    if (!searchTerm) {
      setMeetings(allMeetings);
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = allMeetings.filter(meeting => {
      return (
        (meeting.meetingTitle && meeting.meetingTitle.toLowerCase().includes(searchLower)) ||
        (meeting.meetingTheme && meeting.meetingTheme.toLowerCase().includes(searchLower)) ||
        (meeting.meetingLocation && meeting.meetingLocation.toLowerCase().includes(searchLower)) ||
        (meeting.meetingDate && meeting.meetingDate.toLowerCase().includes(searchLower)) ||
        (meeting.category && meeting.category.toLowerCase().includes(searchLower))
      );
    });
    
    setMeetings(filtered);
  }, [searchTerm, allMeetings]);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        loadUpcomingMeetings(),
        loadAllMembers(),
        loadAvailableRoles()
      ]);
    };
    
    initializeData();
  }, []);

  // Auto-select the next upcoming meeting when meetings are loaded
  useEffect(() => {
    if (meetings.length > 0 && !selectedMeetingId) {
      // Find the next upcoming meeting (earliest date from today)
      const today = new Date();
      const nextMeeting = meetings.find(meeting => {
        if (!meeting.meetingDate) return false;
        const meetingDate = new Date(meeting.meetingDate);
        const meetingDay = new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate());
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return meetingDay >= todayStart;
      }) || meetings[0]; // Fallback to first meeting if no future meetings

      if (nextMeeting) {
        setSelectedMeeting(nextMeeting);
        setSelectedMeetingId(nextMeeting.meetingId);
        loadAvailableMembers(nextMeeting.meetingId);
      }
    }
  }, [meetings]);

  const loadUpcomingMeetings = async () => {
    try {
      setLoading(true);
      const response = await getAllMeetings();
      let meetingsData = response.data.data || [];
      
      // Filter for upcoming meetings (including today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcomingMeetings = meetingsData.filter(meeting => {
        if (!meeting.meetingDate) return false;
        const meetingDay = new Date(meeting.meetingDate);
        meetingDay.setHours(0, 0, 0, 0);
        return meetingDay >= today; // Include today and future dates
      });

      // Sort meetings by date (earliest first)
      upcomingMeetings.sort((a, b) => {
        const dateA = new Date(a.meetingDate);
        const dateB = new Date(b.meetingDate);
        return dateA - dateB;
      });

      setAllMeetings(upcomingMeetings);
      setMeetings(upcomingMeetings);
    } catch (err) {
      setError('Failed to load meetings');
      console.error('Error loading meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllMembers = async () => {
    try {
      const response = await getAllMembers();
      setAllMembers(response.data.data || []);
    } catch (err) {
      console.error('Error loading members:', err);
    }
  };

  const loadAvailableRoles = async () => {
    try {
      setIsLoadingRoles(true);
      // Fetch roles from the API
      const response = await getAllRoles();
      
      // Handle the API response - ensure we have an array of roles
      let roles = [];
      if (Array.isArray(response)) {
        roles = response;
      } else if (response && Array.isArray(response.data)) {
        roles = response.data;
      } else if (response && response.data && typeof response.data === 'object') {
        // If the response is an object with role data, convert it to an array
        roles = Object.entries(response.data).map(([id, role]) => ({
          roleId: role.roleId || id,  // Use role.roleId if available, otherwise use the key
          roleName: role.roleName || role.name || role,
          description: role.description || ''
        }));
      }
      
      // Ensure each role has both roleId and roleName properties to match backend
      const processedRoles = roles.map(role => ({
        roleId: role.roleId || role.id,  // Prefer roleId as per backend entity
        roleName: role.roleName || role.name || role,
        description: role.description || ''
      }));
      
      // Update state with all roles
      setAllRolesData(processedRoles);
      
      // Calculate total pages for pagination
      const totalRoles = processedRoles.length;
      const calculatedTotalPages = Math.ceil(totalRoles / ROLES_PER_PAGE);
      setTotalRolePages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
      
      // Reset to first page if current page is out of bounds
      if (currentRolePage > calculatedTotalPages && calculatedTotalPages > 0) {
        setCurrentRolePage(1);
      }
      
      // Extract role names for the role selector
      const roleNames = processedRoles.map(role => role.roleName);
      setAvailableRoles(roleNames);
      
      return processedRoles;
    } catch (err) {
      console.error('Error loading roles:', err);
      setError('Failed to load roles. Using default roles.');
      // Fallback to default roles if API fails
      const defaultRoles = [
        'Toastmaster', 'General Evaluator', 'Timer', 'Ah Counter', 'Grammarian',
        'Table Topics Master', 'Speaker 1', 'Speaker 2', 'Speaker 3',
        'Evaluator 1', 'Evaluator 2', 'Evaluator 3', 'Sergeant at Arms'
      ];
      setAvailableRoles(defaultRoles);
      return defaultRoles.map(name => ({ roleName: name }));
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const loadMeetingSpecificRoles = async (meetingId) => {
    try {
      const response = await getAllMeetingRoleCombineByMeeting(meetingId);
      // Handle ResponseMessage structure
      const rolesData = response.data?.data || response.data || [];
      setMeetingSpecificRoles(rolesData);
      
      // Calculate available role counts
      calculateAvailableRoleCounts(rolesData);
      
      return rolesData;
    } catch (err) {
      console.error('Error loading meeting-specific roles:', err);
      setMeetingSpecificRoles([]);
      setAvailableRoleCounts({});
      return [];
    }
  };

  // Helper function to calculate available role counts
  const calculateAvailableRoleCounts = (rolesData) => {
    const roleCounts = {};
    
    // Initialize counts from meeting roles
    rolesData.forEach(role => {
      roleCounts[role.roleName] = role.roleCount || 1;
    });
    
    // Subtract already assigned roles from available counts
    Object.values(assignedRoles).forEach(memberRoles => {
      memberRoles.forEach(roleName => {
        if (roleCounts[roleName] > 0) {
          roleCounts[roleName] -= 1;
        }
      });
    });
    
    setAvailableRoleCounts(roleCounts);
  };

  const loadAvailableMembers = async (meetingId) => {
    try {
      setLoading(true);
      const availabilityResponse = await getAllMemberAvailability();
      const allAvailability = availabilityResponse.data.data || [];
      
      console.log('All availability data:', allAvailability);
      console.log('Looking for meetingId:', meetingId);
      
      // Filter members who are available (status = 1) for the selected meeting
      const availableForMeeting = allAvailability.filter(item => {
        const itemMeetingId = item.meetingId || item.meeting.meetingId || item.meeting.id;
        const status = item.status || item.availability || item.availableStatus || -1;
        console.log('Item:', item, 'MeetingId:', itemMeetingId, 'Status:', status);
        return String(itemMeetingId) === String(meetingId) && Number(status) === 1;
      });

      console.log('Available members for meeting:', availableForMeeting);
      setAvailableMembers(availableForMeeting);
      
      // Load meeting-specific roles
      await loadMeetingSpecificRoles(meetingId);
      
      // Load preferred and assigned roles for each available member
      await loadMemberRoles(availableForMeeting, meetingId);
    } catch (err) {
      setError('Failed to load available members');
      console.error('Error loading available members:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMemberRoles = async (members, meetingId) => {
    const roles = {};
    const assigned = {};

    for (const member of members) {
      const userId = member.userId || member.memberId || member.user.userId;
      if (userId) {
        try {
          // Load preferred roles
          const preferredResponse = await getMemberPreferredRoles(userId, meetingId);
          roles[userId] = preferredResponse.data || [];

          // Load assigned roles
          const assignedResponse = await getMemberAssignedRole(userId, meetingId);
          assigned[userId] = assignedResponse.data || [];
        } catch (err) {
          console.error(`Error loading roles for user ${userId}:`, err);
          roles[userId] = [];
          assigned[userId] = [];
        }
      }
    }

    setMemberRoles(roles);
    setAssignedRoles(assigned);
  };

  const handleMeetingChange = async (meetingId) => {
    const meeting = meetings.find(m => m.meetingId === parseInt(meetingId));
    setSelectedMeeting(meeting);
    setSelectedMeetingId(meetingId);
    
    if (meetingId) {
      await Promise.all([
        loadAvailableMembers(meetingId),
        loadMeetingSpecificRoles(meetingId)
      ]);
      // Reset assigned roles when meeting changes
      setAssignedRoles({});
    }
  };

  const handleMeetingSelect = (e) => {
    const meetingId = e.target.value;
    if (meetingId) {
      handleMeetingChange(meetingId);
    } else {
      setSelectedMeeting(null);
      setSelectedMeetingId('');
      setAvailableMembers([]);
      setMemberRoles({});
      setAssignedRoles({});
      setAvailableRoleCounts({});
    }
  };

  const handleOpenAssignRoleModal = async (member) => {
    const userId = member.userId || member.memberId || member.user?.userId;
    if (!userId) {
      console.error('No user ID found for member:', member);
      return;
    }
    
    setSelectedMember(member);
    setSelectedMemberRoles(assignedRoles[userId] || []);
    
    // Recalculate available role counts when opening modal
    calculateAvailableRoleCounts(meetingSpecificRoles);
    
    try {
      console.log('Fetching role history for user ID:', userId);
      const response = await getLast3MeetingRoles(userId);
      console.log('Raw API response:', response);
      
      // The API returns a map where keys are meeting objects and values are role arrays
      const history = [];
      
      // Check different possible response structures
      const responseData = response.data || response;
      console.log('Response data:', JSON.stringify(responseData, null, 2));
      
      if (responseData) {
        try {
          // Check if response is already an array of MeetingWithRolesDTO
          if (Array.isArray(responseData)) {
            console.log('Response is an array of MeetingWithRolesDTO');
            responseData.forEach(item => {
              if (item && (item.meeting || item.roles)) {
                history.push({
                  meeting: item.meeting || {},
                  roles: Array.isArray(item.roles) ? item.roles : []
                });
              }
            });
          }
          // Handle object response (legacy format)
          else if (typeof responseData === 'object') {
            console.log('Response is an object, processing as legacy format');
            // Try different possible response formats
            let meetingMap = {};
            
            // Case 1: Direct map in response.data.data
            if (responseData.data && typeof responseData.data === 'object') {
              meetingMap = responseData.data;
            } 
            // Case 2: Direct map in response.data
            else {
              meetingMap = responseData;
            }
            
            console.log('Meeting map:', meetingMap);
            
            // Convert the map to an array of { meeting, roles } objects
            for (const [meetingKey, roles] of Object.entries(meetingMap)) {
              try {
                let meeting = {};
                
                // Try to parse meeting if it's a string
                if (typeof meetingKey === 'string' && meetingKey.trim().startsWith('{')) {
                  try {
                    meeting = JSON.parse(meetingKey);
                  } catch (e) {
                    console.warn('Failed to parse meeting key as JSON:', meetingKey);
                    meeting = { meetingTheme: 'Previous Meeting' };
                  }
                } else if (typeof meetingKey === 'object') {
                  meeting = meetingKey;
                } else {
                  meeting = { meetingTheme: meetingKey || 'Previous Meeting' };
                }
                
                // Ensure roles is an array
                const rolesArray = Array.isArray(roles) ? roles : [];
                
                if (rolesArray.length > 0) {
                  history.push({
                    meeting,
                    roles: rolesArray
                  });
                }
              } catch (e) {
                console.error('Error processing meeting entry:', e);
              }
            }
          }
          
          // Sort by meeting date if available
          history.sort((a, b) => {
            const dateA = a.meeting.meetingDate ? new Date(a.meeting.meetingDate) : new Date(0);
            const dateB = b.meeting.meetingDate ? new Date(b.meeting.meetingDate) : new Date(0);
            return dateB - dateA; // Sort newest first
          });
          
          console.log('Processed history:', history);
          setRoleHistory(history);
          
        } catch (error) {
          console.error('Error processing role history:', error);
          setRoleHistory([]);
        }
      }
    } catch (error) {
      console.error('Error fetching role history:', {
        error,
        message: error.message,
        response: error.response?.data
      });
      setRoleHistory([]);
    }
    
    setShowAssignRoleModal(true);
  };

  const handleRoleSelection = (roleName, isSelected) => {
    if (isSelected) {
      setSelectedMemberRoles(prev => prev.filter(role => role !== roleName));
    } else {
      setSelectedMemberRoles(prev => [...prev, roleName]);
    }
  };

  const saveRoleAssignments = async () => {
    if (!selectedMember) return;
    
    const userId = selectedMember.userId || selectedMember.memberId || selectedMember.user.userId;
    const previousRoles = assignedRoles[userId] || [];
    
    try {
      // Update local state
      setAssignedRoles(prev => ({
        ...prev,
        [userId]: [...selectedMemberRoles]
      }));

      // Update API for roles
      // 1) Add/update current selections
      if (selectedMemberRoles.length > 0) {
        await addMemberAssignedRole(userId, selectedMeetingId, selectedMemberRoles);
      }
      // 2) Explicitly delete removed roles to keep backend in sync
      try {
        const prevNorm = (previousRoles || []).map(r => normalizeRoleName(r)).filter(Boolean);
        const nowNorm = (selectedMemberRoles || []).map(r => normalizeRoleName(r)).filter(Boolean);
        const removed = prevNorm.filter(r => !nowNorm.includes(r));
        if (removed.length > 0) {
          await deleteMemberAssignedRole(userId, selectedMeetingId, removed);
        }
      } catch (delErr) {
        console.warn('Failed to delete removed roles (non-fatal):', delErr?.message || delErr);
      }
      
      // Recalculate available role counts after assignment
      const updatedAssignedRoles = {
        ...assignedRoles,
        [userId]: [...selectedMemberRoles]
      };
      
      // Update the assigned roles state and recalculate counts
      setAssignedRoles(updatedAssignedRoles);
      
      // Recalculate role counts with updated assignments
      const roleCounts = {};
      meetingSpecificRoles.forEach(role => {
        roleCounts[role.roleName] = role.roleCount || 1;
      });
      
      // Subtract all assigned roles from counts
      Object.values(updatedAssignedRoles).forEach(memberRoles => {
        memberRoles.forEach(roleName => {
          if (roleCounts[roleName] > 0) {
            roleCounts[roleName] -= 1;
          }
        });
      });
      
      setAvailableRoleCounts(roleCounts);
      

      setSuccess('Roles updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      setShowAssignRoleModal(false);
    } catch (err) {
      console.error('Error updating role assignments:', err);
      setError('Failed to update role assignments');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getMemberName = (member) => {
    const userId = member.userId || member.memberId || member.user.userId;
    const memberFromList = allMembers.find(m => String(m.userId) === String(userId));
    return memberFromList.userName || member.userName || member.name || member.user.userName || 'Unknown';
  };

  // Helper: get display name by userId
  const getMemberDisplayById = (uid) => {
    const mem = (allMembers || []).find(m => String(m.userId) === String(uid));
    const name = mem?.userName || [mem?.firstName, mem?.lastName].filter(Boolean).join(' ') || `Member #${uid}`;
    return `${uid} - ${name}`;
  };

  // Helper: get just the member name by userId
  const getMemberNameById = (uid) => {
    const mem = (allMembers || []).find(m => String(m.userId) === String(uid));
    return mem?.userName || [mem?.firstName, mem?.lastName].filter(Boolean).join(' ') || `Member #${uid}`;
  };

  // Helpers: check if a user currently holds a speaker/evaluator role
  const hasSpeakerRoleFor = (uid) => {
    const roles = assignedRoles?.[uid] || [];
    return roles.some(r => isSpeakerRoleName(normalizeRoleName(r)));
  };
  const hasEvaluatorRoleFor = (uid) => {
    const roles = assignedRoles?.[uid] || [];
    return roles.some(r => isEvaluatorRoleName(normalizeRoleName(r)));
  };

  // Helpers to work with role names safely
  const normalizeRoleName = (r) => (typeof r === 'string' ? r : (r?.roleName || r?.name || ''));
  const isSpeakerRoleName = (name) => typeof name === 'string' && name.toLowerCase().startsWith('speaker');
  const isEvaluatorRoleName = (name) => typeof name === 'string' && name.toLowerCase().startsWith('evaluator');

  // Build ordered candidate list for assigning a specific role type
  // roleType: 'speaker' | 'evaluator'
  const getOrderedCandidatesForType = (roleType) => {
    const isEval = roleType === 'evaluator';
    const selectedId = selectedMember?.userId || selectedMember?.memberId || selectedMember?.user?.userId;
    const candidateIds = (availableMembers || [])
      .map(m => m.userId || m.memberId || m.user?.userId)
      .filter(Boolean)
      .filter(uid => String(uid) !== String(selectedId)); // exclude self

    const items = candidateIds.map(uid => {
      const prefs = memberRoles?.[uid] || [];
      const hasPref = prefs.some(pr => {
        const nm = normalizeRoleName(pr);
        return isEval ? isEvaluatorRoleName(nm) : isSpeakerRoleName(nm);
      });
      const label = getMemberDisplayById(uid);
      return { userId: uid, label, preferred: !!hasPref };
    });

    // Sort: preferred first, then by label
    items.sort((a, b) => {
      if (a.preferred === b.preferred) return a.label.localeCompare(b.label);
      return a.preferred ? -1 : 1;
    });
    return items;
  };

  // Quick-assign a role type to a target member
  const quickAssignRoleToMember = async (targetUserId, roleType) => {
    try {
      if (!selectedMeetingId) {
        await Swal.fire({ icon: 'info', title: 'Select meeting', text: 'Please select a meeting first.' });
        return;
      }
      if (!selectedMember) {
        await Swal.fire({ icon: 'info', title: 'Select member', text: 'Please select a member to create a pairing.' });
        return;
      }
      
      const rolePrefix = roleType === 'evaluator' ? 'Evaluator' : 'Speaker';
      const targetAssigned = assignedRoles?.[targetUserId] || [];
      
      // For evaluator-speaker pairing, we don't need to check if they already have the role type
      // as we want to allow multiple assignments (e.g., one evaluator can evaluate multiple speakers)
      if (roleType !== 'evaluator' && roleType !== 'speaker') {
        const alreadyHasType = targetAssigned.some(r => {
          const nm = normalizeRoleName(r);
          return roleType === 'evaluator' ? isEvaluatorRoleName(nm) : isSpeakerRoleName(nm);
        });
        
        if (alreadyHasType) {
          await Swal.fire({ 
            icon: 'info', 
            title: 'Already assigned', 
            text: `${getMemberDisplayById(targetUserId)} already has a ${rolePrefix} role.` 
          });
          return;
        }
      }

      // For evaluator-speaker pairing, handle the assignment directly
      if (roleType === 'evaluator' || roleType === 'speaker') {
        const selectedId = selectedMember?.userId || selectedMember?.memberId || selectedMember?.user?.userId;
        // Correct mapping:
        // - When assigning an evaluator, the selected member is the speaker, and targetUserId is the evaluator
        // - When assigning a speaker, the selected member is the evaluator, and targetUserId is the speaker
        const speakerId = roleType === 'evaluator' ? selectedId : targetUserId;
        const evaluatorId = roleType === 'evaluator' ? targetUserId : selectedId;

        // Ensure the target user has the necessary role; if not, assign one available slot
        let roleAdded = null;
        if (roleType === 'evaluator') {
          let needsEval = !hasEvaluatorRoleFor(evaluatorId);
          let existingEvalRoles = [];
          if (needsEval) {
            try {
              const res = await getMemberAssignedRole(evaluatorId, selectedMeetingId);
              const fetched = res?.data || [];
              existingEvalRoles = fetched.map(r => normalizeRoleName(r)).filter(Boolean);
              needsEval = !existingEvalRoles.some(n => isEvaluatorRoleName(n));
            } catch (e) { /* fallback to state */ }
          }
          if (needsEval) {
            const candidateRoleNames = (meetingSpecificRoles || [])
              .map(r => r?.roleName)
              .filter(Boolean)
              .filter(n => isEvaluatorRoleName(n));
            let chosenRole = null;
            for (const rn of candidateRoleNames) {
              const available = (availableRoleCounts?.[rn] || 0);
              if (available > 0) { chosenRole = rn; break; }
            }
            if (!chosenRole) {
              await Swal.fire({ icon: 'warning', title: 'No Evaluator slots', text: `${getMemberDisplayById(evaluatorId)} cannot be assigned as Evaluator because no slots are available.` });
              return;
            }
            // Build full updated list for evaluator and persist
            const baseList = existingEvalRoles.length > 0 ? existingEvalRoles : ((assignedRoles?.[evaluatorId] || []).map(normalizeRoleName));
            const updated = Array.from(new Set([...baseList, chosenRole]));
            await addMemberAssignedRole(evaluatorId, selectedMeetingId, updated);
            // Update local state and counts optimistically
            setAssignedRoles(prev => ({ ...prev, [evaluatorId]: updated }));
            setAvailableRoleCounts(prev => ({ ...prev, [chosenRole]: Math.max(0, (prev?.[chosenRole] || 0) - 1) }));
            roleAdded = chosenRole;
          }
        } else {
          let needsSpeaker = !hasSpeakerRoleFor(speakerId);
          let existingSpeakerRoles = [];
          if (needsSpeaker) {
            try {
              const res = await getMemberAssignedRole(speakerId, selectedMeetingId);
              const fetched = res?.data || [];
              existingSpeakerRoles = fetched.map(r => normalizeRoleName(r)).filter(Boolean);
              needsSpeaker = !existingSpeakerRoles.some(n => isSpeakerRoleName(n));
            } catch (e) { /* fallback to state */ }
          }
          if (needsSpeaker) {
            const candidateRoleNames = (meetingSpecificRoles || [])
              .map(r => r?.roleName)
              .filter(Boolean)
              .filter(n => isSpeakerRoleName(n));
            let chosenRole = null;
            for (const rn of candidateRoleNames) {
              const available = (availableRoleCounts?.[rn] || 0);
              if (available > 0) { chosenRole = rn; break; }
            }
            if (!chosenRole) {
              await Swal.fire({ icon: 'warning', title: 'No Speaker slots', text: `${getMemberDisplayById(speakerId)} cannot be assigned as Speaker because no slots are available.` });
              return;
            }
            const baseList = existingSpeakerRoles.length > 0 ? existingSpeakerRoles : ((assignedRoles?.[speakerId] || []).map(normalizeRoleName));
            const updated = Array.from(new Set([...baseList, chosenRole]));
            await addMemberAssignedRole(speakerId, selectedMeetingId, updated);
            setAssignedRoles(prev => ({ ...prev, [speakerId]: updated }));
            setAvailableRoleCounts(prev => ({ ...prev, [chosenRole]: Math.max(0, (prev?.[chosenRole] || 0) - 1) }));
            roleAdded = chosenRole;
          }
        }

        // Check if this exact pair already exists
        const existRes = await getAllAssignedEvaluatorsByMeeting(selectedMeetingId);
        const exists = (existRes?.data?.data || []).some(
          pair => 
            Number(pair.speakerId) === Number(speakerId) && 
            Number(pair.evaluatorId) === Number(evaluatorId)
        );

        if (exists) {
          await Swal.fire({ icon: 'info', title: 'Pair exists', text: 'This evaluator-speaker pair already exists.' });
          return;
        }

        // Add the new pair
        const newPair = { 
          id: null, 
          speakerId: Number(speakerId), 
          evaluatorId: Number(evaluatorId), 
          meetingId: Number(selectedMeetingId) 
        };
        
        // Get existing pairs and add the new one
        const allPairs = (existRes?.data?.data || []).map(p => ({
          id: p.id,
          speakerId: Number(p.speakerId),
          evaluatorId: Number(p.evaluatorId),
          meetingId: Number(p.meetingId || selectedMeetingId)
        }));
        
        allPairs.push(newPair);
        
        // Save all pairs with error handling
        try {
          await saveEvaluatorAssignments(allPairs);
          await refreshPairsForMeeting(selectedMeetingId);
          // Show success message
          const speakerName = getMemberDisplayById(speakerId);
          const evaluatorName = getMemberDisplayById(evaluatorId);
          const text = roleAdded 
            ? `${evaluatorName} assigned as evaluator for ${speakerName}. Also assigned role: ${roleAdded}.`
            : `${evaluatorName} assigned as evaluator for ${speakerName}.`;
          await Swal.fire({ icon: 'success', title: 'Paired', text });
        } catch (saveErr) {
          console.error('Failed to save evaluator-speaker pair:', saveErr);
          await Swal.fire({ icon: 'error', title: 'Save failed', text: 'Could not save evaluator-speaker pair. Please try again.' });
        }
        return;
      }

      // For other role types, use the original logic
      const candidateRoleNames = (meetingSpecificRoles || [])
        .map(r => r?.roleName)
        .filter(Boolean)
        .filter(n => (roleType === 'evaluator' ? isEvaluatorRoleName(n) : isSpeakerRoleName(n)));

      // Check availability based on current counts
      let chosenRole = null;
      for (const rn of candidateRoleNames) {
        const available = (availableRoleCounts?.[rn] || 0);
        if (available > 0) { chosenRole = rn; break; }
      }

      if (!chosenRole) {
        await Swal.fire({ icon: 'warning', title: 'No slots available', text: `No ${rolePrefix} roles are currently available for this meeting.` });
        return;
      }

      const confirm = await Swal.fire({
        title: `Assign ${rolePrefix}?`,
        html: `<div style="text-align:left">Assign <b>${rolePrefix}</b> role <b>${chosenRole}</b> to<br/><b>${getMemberDisplayById(targetUserId)}</b>?</div>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Assign',
        cancelButtonText: 'Cancel'
      });
      if (!confirm.isConfirmed) return;

      const updated = Array.from(new Set([...
        (assignedRoles?.[targetUserId] || []).map(normalizeRoleName),
        chosenRole
      ]));

      // Persist to backend: API expects the full list for that user
      await addMemberAssignedRole(targetUserId, selectedMeetingId, updated);

      // Update local state and recalc counts using the updated snapshot to avoid stale values
      const nextAssigned = { ...assignedRoles, [targetUserId]: updated };
      setAssignedRoles(nextAssigned);
      // Recompute available counts synchronously
      const roleCounts = {};
      (meetingSpecificRoles || []).forEach(r => { roleCounts[r.roleName] = r.roleCount || 1; });
      Object.values(nextAssigned).forEach(list => {
        (list || []).forEach(roleName => {
          if (roleCounts[roleName] > 0) roleCounts[roleName] -= 1;
        });
      });
      setAvailableRoleCounts(roleCounts);

      // Also persist evaluator-speaker pair in assign_evaluator table when applicable
      try {
        const selectedId = selectedMember?.userId || selectedMember?.memberId || selectedMember?.user?.userId;
        let pair = null;
        if (roleType === 'evaluator' && selectedId) {
          // Selected member is a speaker; target user is the evaluator
          pair = { id: null, speakerId: Number(selectedId), evaluatorId: Number(targetUserId), meetingId: Number(selectedMeetingId) };
        } else if (roleType === 'speaker' && selectedId) {
          // Selected member is an evaluator; target user is the speaker
          pair = { id: null, speakerId: Number(targetUserId), evaluatorId: Number(selectedId), meetingId: Number(selectedMeetingId) };
        }
        if (pair) {
          // prevent duplicates
          try {
            const existRes = await getAllAssignedEvaluatorsByMeeting(selectedMeetingId);
            const exist = existRes?.data?.data || [];
            const already = exist.some(a => Number(a.speakerId) === pair.speakerId && Number(a.evaluatorId) === pair.evaluatorId);
            if (!already) {
              const merged = exist.map(a => ({
                id: a.id || null,
                speakerId: Number(a.speakerId),
                evaluatorId: Number(a.evaluatorId),
                meetingId: Number(a.meetingId || selectedMeetingId)
              }));
              merged.push(pair);
              await saveEvaluatorAssignments(merged);
              await refreshPairsForMeeting(selectedMeetingId);
            }
          } catch (err) {
            console.warn('assign_evaluator save check failed:', err?.message || err);
          }
        }
      } catch (pairErr) {
        console.warn('Skipping assign_evaluator persistence:', pairErr?.message || pairErr);
      }

      await Swal.fire({ icon: 'success', title: 'Assigned', text: `${rolePrefix} role assigned to ${getMemberDisplayById(targetUserId)}.` });
    } catch (e) {
      console.error('Quick-assign error:', e?.response || e);
      await Swal.fire({ icon: 'error', title: 'Error', text: e?.response?.data?.message || e?.message || 'Failed to assign role' });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}, ${weekday}`;
  };

  const getCategoryBadge = (category) => {
    if (!category || category === 'Regular') return null;
    
    const badgeConfig = {
      'Special': { bg: 'danger', text: 'Special' },
      'Contest': { bg: 'warning', text: 'Contest' }
    };
    
    const config = badgeConfig[category];
    if (!config) return null;
    
    return (
      <Badge bg={config.bg} className="ms-2">
        {config.text}
      </Badge>
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const raw = timeString.includes('T') ? timeString.split('T')[1] : timeString;
    const [hh, mm] = raw.split(':');
    return hh && mm ? `${hh}:${mm}` : raw;
  };

  // Role management functions
  const handleManageRoles = () => {
    setShowRoleForm(false);
    setRoleFormData({ roleName: '', description: '' });
  };

  const handleAddRole = () => {
    setRoleFormData({ roleName: '', description: '' });
    setEditingRole(null);
    setShowRoleForm(true);
  };

  const handleEditRole = (role) => {
    setRoleFormData({
      roleName: role.roleName || role.name || '',
      description: role.description || ''
    });
    setEditingRole(role);
    setShowRoleForm(true);
  };

  const handleDeleteRole = async (role) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this role. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      // Make sure we're using the correct roleId field (role.roleId or role.id)
      const roleId = role.roleId || role.id;
      if (!roleId) {
        throw new Error('No valid role ID found for deletion');
      }
      
      console.log('Deleting role with ID:', roleId);
      await deleteRole(roleId);
      
      // Show success message
      await Swal.fire({
        title: 'Deleted!',
        text: 'The role has been deleted.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      // Refresh roles
      await loadAvailableRoles();
    } catch (err) {
      console.error('Error deleting role:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete role';
      
      await Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleSubmitRole = async (e) => {
    e.preventDefault();
    if (!roleFormData.roleName.trim()) {
      setError('Role name is required');
      return;
    }

    try {
      if (editingRole) {
        // Update existing role
        const roleId = editingRole.roleId || editingRole.id;
        await updateRole(roleId, {
          roleName: roleFormData.roleName,
          description: roleFormData.description
        });
        setSuccess('Role updated successfully');
      } else {
        // Add new role
        await addRole({
          roleName: roleFormData.roleName,
          description: roleFormData.description
        });
        setSuccess('Role added successfully');
      }
      
      // Refresh roles
      await loadAvailableRoles();
      setShowRoleForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving role:', err);
      setError(`Failed to ${editingRole ? 'update' : 'add'} role: ${err.message}`);
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <InputGroup className="me-3" style={{ width: '500px' }}>
            <InputGroup.Text>
              <Search size={16} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
        <div className="d-flex">
          <Button variant="primary" onClick={() => setShowRoleModal(true)}>
            <Settings size={16} className="me-2" />
            Manage Roles
          </Button>
        </div>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Meeting Selection */}
      <Card className="mb-4">
        <Card.Header className="d-flex align-items-center">
          <Calendar size={18} className="me-2" />
          <h5 className="mb-0">Select Meeting</h5>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Meeting</Form.Label>
            <Dropdown drop="down">
              <Dropdown.Toggle 
                variant="outline-secondary" 
                id="meeting-dropdown"
                className="w-100 text-start d-flex justify-content-between align-items-center"
                disabled={loading}
              >
                {selectedMeeting 
                  ? `${formatDate(selectedMeeting.meetingDate)} - ${selectedMeeting.meetingTheme || 'No Theme'}`
                  : 'Select a meeting...'
                }
              </Dropdown.Toggle>

              <Dropdown.Menu 
                className="w-100"
                style={{ 
                  maxHeight: '300px',
                  overflowY: 'auto',
                  width: '100%',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                {meetings.length === 0 ? (
                  <Dropdown.Item disabled>No meetings available</Dropdown.Item>
                ) : (
                  meetings.map((meeting) => (
                    <Dropdown.Item
                      key={meeting.meetingId}
                      onClick={() => {
                        setSelectedMeeting(meeting);
                        setSelectedMeetingId(meeting.meetingId);
                        setAvailableMembers([]);
                        setMemberRoles({});
                        setAssignedRoles({});
                        loadAvailableMembers(meeting.meetingId);
                      }}
                      active={selectedMeetingId === meeting.meetingId}
                    >
                      <div>
                        <strong>{formatDate(meeting.meetingDate)}</strong>
                        <br />
                        <small className="text-muted">{meeting.meetingTheme || 'No Theme'}</small>
                      </div>
                    </Dropdown.Item>
                  ))
                )}
              </Dropdown.Menu>
            </Dropdown>
            {meetings.length > 10 && (
              <Form.Text className="text-muted">
                Showing {meetings.length} meetings. Use search above to filter results.
              </Form.Text>
            )}
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Meeting Details */}
      {selectedMeeting && (
        <Card className="mb-4">
          <Card.Header className="d-flex align-items-center">
            <Calendar size={18} className="me-2" />
            <h5 className="mb-0">Meeting Details</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p><strong>Date:</strong> {formatDate(selectedMeeting.meetingDate)}</p>
                <p><strong>Time:</strong> {formatTime(selectedMeeting.startTime)} - {formatTime(selectedMeeting.endTime)}</p>
              </Col>
              <Col md={6}>
                <p><strong>Location:</strong> {selectedMeeting.meetingLocation}</p>
                <p><strong>Theme:</strong> {selectedMeeting.meetingTheme}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Available Members and Role Assignment */}
      {selectedMeeting && (
        <Card>
          <Card.Header className="d-flex align-items-center">
            <Users size={18} className="me-2" />
            <h5 className="mb-0">Available Members & Role Assignment</h5>
            <div className="ms-auto">
              <Button variant="danger" size="sm" onClick={openAssignEvaluatorModal}>
                Assign Evaluator
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <div className="text-center">
                <Spinner animation="border" />
                <p className="mt-2">Loading available members...</p>
              </div>
            ) : availableMembers.length === 0 ? (
              <Alert variant="info">No members are available for this meeting.</Alert>
            ) : (
              <Table responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Member</th>
                    <th>Preferred Roles</th>
                    <th>Assigned Roles</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableMembers.map((member, index) => {
                    const userId = member.userId || member.memberId || member.user.userId;
                    const memberName = getMemberName(member);
                    const preferredRoles = memberRoles[userId] || [];
                    const currentAssignedRoles = assignedRoles[userId] || [];

                    return (
                      <tr key={index} className="border-0">
                        <td className="fw-bold">{member.userId || member.memberId || member.user.userId || 'N/A'}</td>
                        <td>{memberName}</td>
                        <td>
                          {preferredRoles.length > 0 ? (
                            <div className="d-flex flex-column">
                              {preferredRoles.map((role, i) => {
                                const roleName = typeof role === 'object' ? (role.roleName || role.name || JSON.stringify(role)) : String(role);
                                return (
                                  <div key={i} className="me-1 mb-1 d-inline-flex align-items-start">
                                    <Badge bg="info" className="d-inline-flex align-items-center align-self-start" style={{ width: 'auto' }}>
                                      <span className="me-1">{i + 1}.</span>
                                      {roleName}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-muted">No preferences</span>
                          )}
                        </td>
                        <td>
                          {currentAssignedRoles.length > 0 ? (
                            <div className="d-flex flex-column">
                              {currentAssignedRoles.map((role, i) => {
                                const roleName = typeof role === 'object' ? (role.roleName || role.name || JSON.stringify(role)) : String(role);
                                const simpleName = normalizeRoleName(roleName);
                                const isSpeaker = isSpeakerRoleName(simpleName);
                                const isEval = isEvaluatorRoleName(simpleName);
                                let relationText = '';
                                if (isSpeaker) {
                                  const related = (pairs || [])
                                    .filter(p => String(p.speakerId) === String(userId))
                                    .filter(p => hasEvaluatorRoleFor(p.evaluatorId)); // show only if evaluator still has evaluator role
                                  if (related.length > 0) {
                                    const names = related.map(r => getMemberNameById(r.evaluatorId)).join(', ');
                                    relationText = `Assigned evaluator ${names}`;
                                  }
                                } else if (isEval) {
                                  const related = (pairs || [])
                                    .filter(p => String(p.evaluatorId) === String(userId))
                                    .filter(p => hasSpeakerRoleFor(p.speakerId)); // show only if speaker still has speaker role
                                  if (related.length > 0) {
                                    const names = related.map(r => getMemberNameById(r.speakerId)).join(', ');
                                    relationText = `Assigned speaker ${names}`;
                                  }
                                }
                                return (
                                  <div key={i} className="me-1 mb-1 d-inline-flex align-items-center flex-wrap gap-2">
                                    <Badge bg="success" className="d-inline-flex align-items-center" style={{ width: 'auto' }}>
                                      {roleName}
                                    </Badge>
                                    {relationText && (
                                      <span className="small">
                                        {relationText}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-muted">Not assigned</span>
                          )}
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleOpenAssignRoleModal(member)}
                          >
                            Assign Roles
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Role Assignment Modal */}
      <Modal 
        show={showAssignRoleModal} 
        onHide={() => setShowAssignRoleModal(false)} 
        size="lg" 
        dialogClassName="modal-90w"
        contentClassName="h-auto max-h-[90vh]"
      >
        <Modal.Header closeButton>
          <Modal.Title>Assign Roles</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {selectedMember && (
            <Row className="g-0">
              {/* Left Side: Role Assignment */}
              <Col md={7} className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <h5 className="sticky-top bg-white pb-2 mb-3" style={{ top: 0, zIndex: 1 }}>
                  {getMemberName(selectedMember)}
                </h5>
                <p className="text-muted mb-3">Select roles to assign:</p>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {meetingSpecificRoles.length > 0 ? (
                    meetingSpecificRoles
                      .filter(role => {
                        const availableCount = availableRoleCounts[role.roleName] || 0;
                        const isSelected = selectedMemberRoles.includes(role.roleName);
                        // Show role if it's available OR if it's already assigned to this member
                        return availableCount > 0 || isSelected;
                      })
                      .map((role) => {
                        const roleName = role.roleName;
                        const isSelected = selectedMemberRoles.includes(roleName);
                        const availableCount = availableRoleCounts[role.roleName] || 0;
                        return (
                          <Button
                            key={`${role.roleId}-${roleName}`}
                            variant={isSelected ? 'primary' : 'outline-secondary'}
                            className="me-2 mb-2"
                            onClick={() => handleRoleSelection(roleName, isSelected)}
                          >
                            {roleName}
                            {availableCount > 1 && (
                              <Badge bg="light" text="dark" className="ms-1">
                                {availableCount}
                              </Badge>
                            )}
                            {isSelected && (
                              <Badge bg="success" className="ms-1">
                                Assigned
                              </Badge>
                            )}
                          </Button>
                        );
                      })
                  ) : (
                    <p className="text-muted">No roles available for this meeting</p>
                  )}
                </div>

                {/* Contextual quick-assign buttons */}
                {(() => {
                  const hasSpeaker = (selectedMemberRoles || []).some(r => isSpeakerRoleName(normalizeRoleName(r)));
                  const hasEvaluator = (selectedMemberRoles || []).some(r => isEvaluatorRoleName(normalizeRoleName(r)));
                  if (!hasSpeaker && !hasEvaluator) return null;
                  const evalCandidates = getOrderedCandidatesForType('evaluator');
                  const spkCandidates = getOrderedCandidatesForType('speaker');
                  return (
                    <div className="mt-3 pt-3 border-top">
                      <div className="small text-muted mb-2">Quick assign related roles</div>
                      <div className="d-flex flex-wrap gap-2">
                        {hasSpeaker && (
                          <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                              Assign Evaluator
                            </Dropdown.Toggle>
                            <Dropdown.Menu style={{ maxHeight: '260px', overflowY: 'auto' }}>
                              {evalCandidates.length === 0 ? (
                                <Dropdown.Item disabled>No members available</Dropdown.Item>
                              ) : (
                                evalCandidates.map(c => (
                                  <Dropdown.Item key={`e-${c.userId}`} onClick={() => quickAssignRoleToMember(c.userId, 'evaluator')}>
                                    {c.label} {c.preferred && (<Badge bg="info" className="ms-1">Preferred</Badge>)}
                                  </Dropdown.Item>
                                ))
                              )}
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
                        {hasEvaluator && (
                          <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                              Assign Speaker
                            </Dropdown.Toggle>
                            <Dropdown.Menu style={{ maxHeight: '260px', overflowY: 'auto' }}>
                              {spkCandidates.length === 0 ? (
                                <Dropdown.Item disabled>No members available</Dropdown.Item>
                              ) : (
                                spkCandidates.map(c => (
                                  <Dropdown.Item key={`s-${c.userId}`} onClick={() => quickAssignRoleToMember(c.userId, 'speaker')}>
                                    {c.label} {c.preferred && (<Badge bg="info" className="ms-1">Preferred</Badge>)}
                                  </Dropdown.Item>
                                ))
                              )}
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </Col>

             {/* Right Side: Role History */}
            <Col md={5} className="border-start p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <h5 className="sticky-top bg-white pb-2 mb-3" style={{ top: 0, zIndex: 1 }}>Recent Role History</h5>
              <div className="pe-2">
                {roleHistory.length > 0 ? (
                  roleHistory.map((item, index) => {
                    try {
                      const meeting = item.meeting || {};
                      let meetingDate = 'N/A';
                      let location = '';
                      let timeRange = '';

                      const meetingId = meeting.meetingId || 'N/A';
                      const meetingDateStr = meeting.meetingDate || null;
                      const theme = meeting.meetingTheme || 'No Theme';
                      
                      if (meetingDateStr) {
                        try {
                          const date = new Date(meetingDateStr);
                          if (!isNaN(date.getTime())) {
                            meetingDate = date.toLocaleDateString('en-GB'); // dd/MM/yyyy
                          }
                        } catch (e) {
                          console.warn('Error formatting date:', e);
                        }
                      }

                      // Format time range if available
                      if (meeting.startTime && meeting.endTime) {
                        const formatTime = (timeStr) => {
                          if (!timeStr) return '';
                          const str = String(timeStr);
                          return str.includes(':') ? str.split(':').slice(0, 2).join(':') : str;
                        };
                        
                        const start = formatTime(meeting.startTime);
                        const end = formatTime(meeting.endTime);
                        if (start && end) {
                          timeRange = `${start} - ${end}`;
                        }
                      }

                      // Build meeting details with ID, theme, and date in a cleaner format
                      const meetingDetails = (
                        <div>
                          <div className="fw-bold">Meeting #{meetingId}</div>
                          <div className="text-muted">{theme}</div>
                          <div className="small">{meetingDate}</div>
                        </div>
                      );

                      // Ensure roles is an array and extract role names
                      const roles = Array.isArray(item.roles) 
                        ? item.roles.map(r => r.roleName || r.name || 'Role').filter(Boolean)
                        : [];

                      return (
                        <div key={index} className="mb-3 p-3 border rounded">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <div className="fw-bold text-primary">Meeting #{meetingId}</div>
                              <div className="fw-medium mb-1">{theme}</div>
                              <div className="text-muted small">
                                <Calendar size={14} className="me-1" />
                                {meetingDate}
                                {timeRange && (
                                  <span className="ms-2">
                                    <Clock size={14} className="me-1" />
                                    {timeRange}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge bg="light" text="dark" className="text-uppercase">
                              {index === 0 ? 'Latest' : `#${index + 1}`}
                            </Badge>
                          </div>
                          
                          {roles.length > 0 ? (
                            <div className="mt-2 pt-2 border-top">
                              <div className="small text-muted mb-1">Assigned Roles:</div>
                              <div className="d-flex flex-wrap gap-1">
                                {roles.map((roleName, roleIndex) => (
                                  <Badge key={roleIndex} bg="info" className="text-nowrap">
                                    {roleName}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 pt-2 border-top">
                              <small className="text-muted">No roles recorded for this meeting</small>
                            </div>
                          )}
                        </div>
                      );
                    } catch (e) {
                      console.warn('Error processing meeting data:', e);
                      return (
                        <div key={index} className="mb-3 p-2 border rounded">
                          <p className="text-muted small">Could not load meeting details</p>
                        </div>
                      );
                    }
                  })
                ) : (
                  <p className="text-muted">No recent role history found</p>
                )}
              </div>
            </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex w-100 align-items-center">
          <div className="d-flex gap-2">
            <Button variant="secondary" onClick={() => setShowAssignRoleModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveRoleAssignments}>
              Save Changes
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Assign Evaluator Modal */}
      <Modal show={showAssignEvaluatorModal} onHide={handleCloseAssignEvaluatorModal}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Evaluator</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingEvaluatorData ? (
            <div className="text-center my-4">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              <div className="mb-3">
                <Row className="align-items-end g-2">
                  <Col md={5}>
                    <Form.Label>Evaluators</Form.Label>
                    <Form.Select
                      value={selectedEvaluatorId}
                      onChange={(e) => setSelectedEvaluatorId(e.target.value)}
                    >
                      <option value="">Select Evaluator</option>
                      {evaluatorList.map((e) => {
                        const used = pairs.some(p => String(p.evaluatorId) === String(e.userId));
                        const isSelfWithCurrentSpeaker = String(e.userId) === String(selectedSpeakerId || '');
                        return (
                          <option key={e.userId} value={e.userId} disabled={isSelfWithCurrentSpeaker}>
                           ID: {e.memberName}{used ? '   ✅' : ''}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Col>
                  <Col md={2} className="d-flex justify-content-center">
                    <Button variant="outline-primary" className="w-100 mt-4" onClick={addPair}>
                      Assign
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Label>Speakers</Form.Label>
                    <Form.Select
                      value={selectedSpeakerId}
                      onChange={(e) => setSelectedSpeakerId(e.target.value)}
                    >
                      <option value="">Select Speaker</option>
                      {speakerList.map((s) => {
                        const used = pairs.some(p => String(p.speakerId) === String(s.userId));
                        const isSelfWithCurrentEvaluator = String(s.userId) === String(selectedEvaluatorId || '');
                        return (
                          <option key={s.userId} value={s.userId} disabled={isSelfWithCurrentEvaluator}>
                           ID: {s.memberName}{used ? '   ✅' : ''}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Col>
                </Row>
              </div>

              {/* Current pairs (TODO-like list) */}
              <div className="mt-3">
                <h6 className="mb-2">Assignments</h6>
                {pairs.length === 0 ? (
                  <Alert variant="info" className="py-2 mb-0">No assignments added yet.</Alert>
                ) : (
                  <Table responsive size="sm" className="align-middle">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Evaluator</th>
                        <th></th>
                        <th>Speaker</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pairs.map((p, idx) => (
                        <tr key={`${p.speakerId}-${p.evaluatorId}-${idx}`}>
                          <td>{idx + 1}</td>
                          <td>
                            <Badge bg="secondary">ID: {p.evaluatorName}</Badge>
                          </td>
                          <td className="text-muted">→</td>
                          <td>
                            <Badge bg="light" text="dark">ID: {p.speakerName}</Badge>
                          </td>
                          <td className="text-end">
                            <Button variant="outline-danger" size="sm" onClick={() => removePair(idx)}>
                              <Trash2 size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="me-auto small text-muted">
            Meeting ID: {selectedMeetingId || '-'}
          </div>
          <Button variant="secondary" onClick={handleCloseAssignEvaluatorModal}>
            Close
          </Button>
          <Button variant="primary" onClick={savePairs} disabled={pairs.length === 0}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Role Management Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} size="lg" onShow={loadAvailableRoles}>
        <Modal.Header closeButton>
          <Modal.Title>Manage Roles</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoadingRoles ? (
            <div className="text-center my-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading roles...</p>
            </div>
          ) : (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6>
                  All Roles: {allRolesData?.length || 0}
                  {totalRolePages > 1 && (
                    <span className="text-muted ms-2">
                      (Page {currentRolePage} of {totalRolePages})
                    </span>
                  )}
                </h6>
                <Button variant="primary" onClick={handleAddRole}>
                  <Plus size={16} className="me-2" />
                  Add Role
                </Button>
              </div>
              
              {allRolesData.length === 0 ? (
                <Alert variant="info">No roles found. Add your first role to get started.</Alert>
              ) : (
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>Role Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const indexOfLastRole = currentRolePage * ROLES_PER_PAGE;
                        const indexOfFirstRole = indexOfLastRole - ROLES_PER_PAGE;
                        const currentRoles = allRolesData.slice(indexOfFirstRole, indexOfLastRole);
                        
                        return currentRoles.length > 0 ? (
                          currentRoles.map((role, index) => {
                            const actualIndex = indexOfFirstRole + index;
                            return (
                              <tr key={role.roleId || role.id || index}>
                                <td>{actualIndex + 1}</td>
                                <td>{role.roleName || role.name || 'N/A'}</td>
                                <td>{role.description || 'No description available'}</td>
                                <td>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => handleEditRole(role)}
                                    title="Edit Role"
                                  >
                                    <Edit size={14} />
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDeleteRole(role)}
                                    title="Delete Role"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center text-muted py-3">
                              No roles found on this page.
                            </td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </Table>
                </div>
              )}
          
              {totalRolePages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    <Pagination.First 
                      onClick={() => setCurrentRolePage(1)} 
                      disabled={currentRolePage === 1}
                    />
                    <Pagination.Prev 
                      onClick={() => setCurrentRolePage(p => Math.max(1, p - 1))} 
                      disabled={currentRolePage === 1}
                    />
                    
                    {Array.from({ length: Math.min(5, totalRolePages) }, (_, i) => {
                      let pageNum;
                      if (totalRolePages <= 5) {
                        pageNum = i + 1;
                      } else if (currentRolePage <= 3) {
                        pageNum = i + 1;
                      } else if (currentRolePage >= totalRolePages - 2) {
                        pageNum = totalRolePages - 4 + i;
                      } else {
                        pageNum = currentRolePage - 2 + i;
                      }
                      
                      return (
                        <Pagination.Item
                          key={pageNum}
                          active={pageNum === currentRolePage}
                          onClick={() => setCurrentRolePage(pageNum)}
                        >
                          {pageNum}
                        </Pagination.Item>
                      );
                    })}
                    
                    <Pagination.Next 
                      onClick={() => setCurrentRolePage(p => Math.min(totalRolePages, p + 1))} 
                      disabled={currentRolePage === totalRolePages}
                    />
                    <Pagination.Last 
                      onClick={() => setCurrentRolePage(totalRolePages)} 
                      disabled={currentRolePage === totalRolePages}
                    />
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Role Form Modal */}
      <Modal show={showRoleForm} onHide={() => setShowRoleForm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingRole ? 'Edit Role' : 'Add New Role'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitRole}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Role Name</Form.Label>
              <Form.Control
                type="text"
                value={roleFormData.roleName}
                onChange={(e) => setRoleFormData({ ...roleFormData, roleName: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={roleFormData.description}
                onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRoleForm(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingRole ? 'Update Role' : 'Add Role'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AssignRole;
