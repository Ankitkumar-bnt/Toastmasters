import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Dropdown, Table, Badge, Alert, Spinner, Modal, Button, Form } from 'react-bootstrap';
import { Calendar, Clock, Users, BookOpen, Award } from 'lucide-react';
import { getAllUpcomingMeetings } from '../../api/MeetingApi';
import { 
  getAgenda, 
  getAllStaticInfo, 
  updateStaticInfoById,
  getAllClubOfficer,
  addClubOfficer,
  updateClubOfficerById,
  deleteClubOfficerById,
  getWordsDataByMeeting,
  updateWordsDataByUserAndMeeting,
  getAllAbbreviations,
  addAbbreviation,
  updateAbbreviationsById,
  deleteAbbreviationsById,
  isAgendaPublished,
  getSpeakerSpeechesByMeeting
} from '../../api/AgendaJoinApi';
import { getUserById } from '../../api/UserApi';
import toastmastersLogo from '../../assets/img/toastmastersLogo.png';
import { getAllAgendaSections } from '../../api/AgendaSectionApi';

const AgendaView = ({ onEditAgenda, preselectedMeetingId, isMemberView = false }) => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [agendaData, setAgendaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [meetingsLoading, setMeetingsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userCache, setUserCache] = useState({});
  const [showClubInfoModal, setShowClubInfoModal] = useState(false);
  const [staticInfoData, setStaticInfoData] = useState([]);
  const [editingInfo, setEditingInfo] = useState({});
  const [updating, setUpdating] = useState(false);
  const [sections, setSections] = useState([]);
  const [sectionById, setSectionById] = useState({});
  const [publishing, setPublishing] = useState(false);
  
  // ========== CACHING SYSTEM ==========
  const [staticDataCache, setStaticDataCache] = useState({
    staticInfo: null,
    clubOfficers: null,
    abbreviations: null,
    sections: null,
    lastUpdated: {
      staticInfo: null,
      clubOfficers: null,
      abbreviations: null,
      sections: null
    }
  });
  const [agendaCache, setAgendaCache] = useState({});
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  // Club Officers Modal States
  const [showOfficersModal, setShowOfficersModal] = useState(false);
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false);
  const [officersData, setOfficersData] = useState([]);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [newOfficer, setNewOfficer] = useState({ leadershipName: '', userId: '' });
  
  // WOD/POD Modal States
  const [showWODModal, setShowWODModal] = useState(false);
  const [showPODModal, setShowPODModal] = useState(false);
  const [wodData, setWODData] = useState([]);
  const [podData, setPODData] = useState([]);
  const [editingWOD, setEditingWOD] = useState({});
  const [editingPOD, setEditingPOD] = useState({});
  
  // Abbreviations Modal States
  const [showAbbreviationsModal, setShowAbbreviationsModal] = useState(false);
  const [showAddAbbreviationModal, setShowAddAbbreviationModal] = useState(false);
  const [abbreviationsData, setAbbreviationsData] = useState([]);
  const [editingAbbreviations, setEditingAbbreviations] = useState([]);
  const [newAbbreviation, setNewAbbreviation] = useState({ abbreviation: '', meaning: '' });
  const [speakerSpeeches, setSpeakerSpeeches] = useState([]);

  // ========== CACHING UTILITY FUNCTIONS ==========
  const isCacheValid = (cacheType) => {
    const lastUpdated = staticDataCache.lastUpdated[cacheType];
    return lastUpdated && (Date.now() - lastUpdated) < CACHE_DURATION;
  };

  const updateCache = (cacheType, data) => {
    setStaticDataCache(prev => ({
      ...prev,
      [cacheType]: data,
      lastUpdated: {
        ...prev.lastUpdated,
        [cacheType]: Date.now()
      }
    }));
  };

  const invalidateCache = (cacheType) => {
    setStaticDataCache(prev => ({
      ...prev,
      [cacheType]: null,
      lastUpdated: {
        ...prev.lastUpdated,
        [cacheType]: null
      }
    }));
  };

  // ========== OPTIMIZED DATA FETCHERS ==========
  const getCachedStaticInfo = async () => {
    if (isCacheValid('staticInfo') && staticDataCache.staticInfo) {
      console.log('Using cached static info');
      return staticDataCache.staticInfo;
    }
    
    console.log('Fetching fresh static info');
    const response = await getAllStaticInfo();
    const data = response.data.data || [];
    updateCache('staticInfo', data);
    return data;
  };

  const getCachedClubOfficers = async () => {
    if (isCacheValid('clubOfficers') && staticDataCache.clubOfficers) {
      console.log('Using cached club officers');
      return staticDataCache.clubOfficers;
    }
    
    console.log('Fetching fresh club officers');
    const response = await getAllClubOfficer();
    const data = response.data.data || [];
    updateCache('clubOfficers', data);
    return data;
  };

  const getCachedAbbreviations = async () => {
    if (isCacheValid('abbreviations') && staticDataCache.abbreviations) {
      console.log('Using cached abbreviations');
      return staticDataCache.abbreviations;
    }
    
    console.log('Fetching fresh abbreviations');
    const response = await getAllAbbreviations();
    const data = response.data.data || [];
    updateCache('abbreviations', data);
    return data;
  };

  const getCachedSections = async () => {
    if (isCacheValid('sections') && staticDataCache.sections) {
      console.log('Using cached sections');
      return staticDataCache.sections;
    }
    
    console.log('Fetching fresh sections');
    const resp = await getAllAgendaSections();
    const list = Array.isArray(resp)
      ? resp
      : Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp?.data?.data)
          ? resp.data.data
          : [];
    updateCache('sections', list);
    return list;
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  useEffect(() => {
    const loadSections = async () => {
      try {
        const list = await getCachedSections();
        setSections(list);
        const map = {};
        list.forEach(s => { map[s.sectionId || s.id] = s.sectionName; });
        setSectionById(map);
      } catch (e) {
        console.warn('Failed to load sections', e?.message);
      }
    };
    loadSections();
  }, []);
  const loadMeetings = async () => {
    try {
      setMeetingsLoading(true);
      const response = await getAllUpcomingMeetings();
      const meetings = response.data.data || [];
      
      // Filter to only show meetings from current day onwards
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of today
      
      const currentAndFutureMeetings = meetings.filter(meeting => {
        if (!meeting.meetingDate) return false;
        const meetingDate = new Date(meeting.meetingDate);
        meetingDate.setHours(0, 0, 0, 0); // Set to start of meeting day
        return meetingDate >= today; // Include today and future dates
      });
      
      // Sort meetings by date (earliest first)
      currentAndFutureMeetings.sort((a, b) => {
        const dateA = new Date(a.meetingDate);
        const dateB = new Date(b.meetingDate);
        return dateA.getTime() - dateB.getTime();
      });
      // Preserve the actual isPublished value from database, check both field names
      const meetingsWithPublishStatus = currentAndFutureMeetings.map(meeting => ({
        ...meeting,
        isPublished: Boolean(meeting.isPublished) || Boolean(meeting.published)
      }));
      console.log('Loaded meetings with publish status:', meetingsWithPublishStatus);
      setMeetings(meetingsWithPublishStatus);
    } catch (err) {
      console.error('Error loading meetings:', err);
      setError('Failed to load meetings');
    } finally {
      setMeetingsLoading(false);
    }
  };

  // ========== AGENDA CACHING ==========
  const getCachedAgenda = async (meetingId) => {
    const cacheKey = `agenda_${meetingId}`;
    const cachedData = agendaCache[cacheKey];
    
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      console.log(`Using cached agenda for meeting ${meetingId}`);
      return cachedData.data;
    }
    
    console.log(`Fetching fresh agenda for meeting ${meetingId}`);
    const response = await getAgenda(meetingId);
    const agendaData = response.data.data;
    
    // Cache the agenda data
    setAgendaCache(prev => ({
      ...prev,
      [cacheKey]: {
        data: agendaData,
        timestamp: Date.now()
      }
    }));
    
    return agendaData;
  };

  const invalidateAgendaCache = (meetingId) => {
    const cacheKey = `agenda_${meetingId}`;
    setAgendaCache(prev => {
      const updated = { ...prev };
      delete updated[cacheKey];
      return updated;
    });
  };

  const handleMeetingSelect = async (meeting) => {
    setSelectedMeeting(meeting);
    setLoading(true);
    setError(null);

    try {
      let agendaResponse = await getCachedAgenda(meeting.meetingId);
      console.log('=== AGENDAVIEW API RESPONSE ===');
      console.log('Agenda response:', agendaResponse);
      let speakerSpeeches = agendaResponse?.speakerSpeeches || [];

      // Fallback to SpeakerSpeechApi if not present or empty
      if (!Array.isArray(speakerSpeeches) || speakerSpeeches.length === 0) {
        try {
          console.log('AgendaView: fetching speakerSpeeches via SpeakerSpeechApi fallback...');
          const ssResp = await getSpeakerSpeechesByMeeting(meeting.meetingId);
          const payload = ssResp?.data ?? ssResp;
          speakerSpeeches = Array.isArray(payload) ? payload : [payload].filter(Boolean);
          console.log('AgendaView: fetched speakerSpeeches via fallback:', speakerSpeeches);
        } catch (e) {
          console.warn('AgendaView: fallback fetch failed:', e?.response || e);
          speakerSpeeches = [];
        }
      }

      // Add PREPARED SPEECHES SESSION if speaker speeches exist
      if (speakerSpeeches && speakerSpeeches.length > 0) {
        setSpeakerSpeeches(speakerSpeeches);
        
        // Add speech rows to agenda if not already present
        let agenda = agendaResponse?.agenda || [];
        
        // Check if a 'prepared speeches' section exists in agenda (by section name on any row)
        const preparedRow = agenda.find(item => String(item?.agendaSection?.sectionName || '').toLowerCase().includes('prepared') && String(item?.agendaSection?.sectionName || '').toLowerCase().includes('speech'));
        const hasSpeechSection = Boolean(preparedRow);
        const preparedSectionId = hasSpeechSection ? (preparedRow?.agendaSection?.sectionId || preparedRow?.sectionId || 1) : 1;
        
        if (!hasSpeechSection) {
          // Find where to insert the speech section (after section ID 1)
          const insertIndex = agenda.findIndex(item => {
            const sectionId = item.sectionId || item.agendaSectionId || item?.agendaSection?.sectionId || 1;
            return sectionId > 1;
          });
          const actualInsertIndex = insertIndex === -1 ? agenda.length : insertIndex;

          // Create explicit header row (sectionId 1 to align with 'No Section')
          const speechHeader = {
            agendaId: `speech-header-${Date.now()}`,
            isSection: true,
            sectionId: 1,
            sectionName: 'PREPARED SPEECHES SESSION'
          };

          // Create speech rows
          const speechRows = speakerSpeeches.map((speech, index) => ({
            agendaId: `speech-${speech.speechId || Date.now()}-${index}`,
            activity: speech.title || 'Speech Title',
            minTime: parseInt(speech.minSpeechTime) || 0,
            avgTime: Math.round(((parseInt(speech.minSpeechTime) || 0) + (parseInt(speech.maxSpeechTime) || 0)) / 2),
            maxTime: parseInt(speech.maxSpeechTime) || 0,
            userId: (speech?.user?.userId) || speech.userId || null,
            sectionId: 1,
            isSpeechRow: true,
            speechData: speech
          }));
          
          // Insert header + speech rows
          agenda.splice(actualInsertIndex, 0, speechHeader, ...speechRows);
          agendaResponse.agenda = agenda;
        } else {
          // Prepared section exists; insert rows under that section id without adding explicit header
          const insertIndex = agenda.findIndex(item => {
            const sid = item.sectionId || item.agendaSectionId || item?.agendaSection?.sectionId || 1;
            return sid > preparedSectionId;
          });
          const actualInsertIndex = insertIndex === -1 ? agenda.length : insertIndex;
          const speechRows = speakerSpeeches.map((speech, index) => ({
            agendaId: `speech-${speech.speechId || Date.now()}-${index}`,
            activity: speech.title || 'Speech Title',
            minTime: parseInt(speech.minSpeechTime) || 0,
            avgTime: Math.round(((parseInt(speech.minSpeechTime) || 0) + (parseInt(speech.maxSpeechTime) || 0)) / 2),
            maxTime: parseInt(speech.maxSpeechTime) || 0,
            userId: (speech?.user?.userId) || speech.userId || null,
            sectionId: preparedSectionId,
            isSpeechRow: true,
            speechData: speech
          }));
          agenda.splice(actualInsertIndex, 0, ...speechRows);
          agendaResponse.agenda = agenda;
        }
      } else {
        setSpeakerSpeeches([]);
      }
      
      setAgendaData(agendaResponse);
      
      // Update selectedMeeting with the latest isPublished status from the backend
      if (agendaResponse?.meeting) {
        const actualPublishStatus = agendaResponse.meeting.isPublished === true || 
                                   agendaResponse.meeting.isPublished === 'true' || 
                                   agendaResponse.meeting.isPublished === 1 ||
                                   agendaResponse.meeting.published === true || 
                                   agendaResponse.meeting.published === 'true' || 
                                   agendaResponse.meeting.published === 1;
        console.log('Backend meeting isPublished/published value:', agendaResponse.meeting.isPublished || agendaResponse.meeting.published, 'Converted to:', actualPublishStatus);
        setSelectedMeeting(prev => ({
          ...prev,
          isPublished: actualPublishStatus
        }));
        
        // Also update the meetings array to keep it in sync
        setMeetings(prevMeetings => prevMeetings.map(m => 
          m.meetingId === meeting.meetingId 
            ? { ...m, isPublished: actualPublishStatus }
            : m
        ));
      }
    } catch (err) {
      console.error('Error loading agenda:', err);
      if (err.code === 'ERR_NETWORK' || err.message.includes('CORS')) {
        setError('Backend server is not running or CORS is not configured. Please start the backend server.');
      } else {
        setError('Failed to load agenda data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // SpeakerSpeeches are now loaded as part of getAgenda
  // const loadSpeakerSpeeches = async (meetingId) => {
  //   // Speeches are loaded via getAgenda API
  // };

  // When coming back from UpdateAgenda, restore the previously selected meeting
  useEffect(() => {
    if (preselectedMeetingId && meetings && meetings.length > 0) {
      const match = meetings.find(m => Number(m.meetingId) === Number(preselectedMeetingId));
      if (match && (!selectedMeeting || Number(selectedMeeting.meetingId) !== Number(preselectedMeetingId))) {
        handleMeetingSelect(match);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedMeetingId, meetings]);

  const togglePublish = async () => {
    if (!selectedMeeting || isMemberView) return;
    try {
      setPublishing(true);
      console.log('Current selectedMeeting.isPublished:', selectedMeeting.isPublished);
      const status = selectedMeeting.isPublished ? 'unpublished' : 'published';
      console.log('Sending status to backend:', status);
      const response = await isAgendaPublished(selectedMeeting.meetingId, status);
      
      // Extract the updated meeting data from the backend response
      console.log('Backend response:', response);
      const updatedMeeting = response?.data?.data || response?.data;
      console.log('Updated meeting from backend:', updatedMeeting);
      
      // Properly convert the backend response to boolean, check both field names
      let newPublishStatus;
      if (updatedMeeting?.isPublished !== undefined || updatedMeeting?.published !== undefined) {
        newPublishStatus = updatedMeeting.isPublished === true || 
                          updatedMeeting.isPublished === 'true' || 
                          updatedMeeting.isPublished === 1 ||
                          updatedMeeting.published === true || 
                          updatedMeeting.published === 'true' || 
                          updatedMeeting.published === 1;
      } else {
        // Fallback: toggle the current state
        newPublishStatus = !selectedMeeting.isPublished;
      }
      console.log('New publish status:', newPublishStatus);
      
      // Update local selectedMeeting state
      setSelectedMeeting(prev => ({ ...prev, isPublished: newPublishStatus }));
      
      // Also update the meetings array to persist the state
      setMeetings(prev => prev.map(meeting => 
        meeting.meetingId === selectedMeeting.meetingId 
          ? { ...meeting, isPublished: newPublishStatus }
          : meeting
      ));
      
      console.log(`Agenda ${newPublishStatus ? 'published' : 'unpublished'} successfully`);
    } catch (e) {
      console.error('Failed to toggle publish:', e?.response || e);
      setError('Failed to update publish status');
    } finally {
      setPublishing(false);
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

  const handleEditClubInfo = async () => {
    if (isMemberView) return;
    try {
      const staticInfo = await getCachedStaticInfo();
      setStaticInfoData(staticInfo);
      
      // Create an object with infoKey as keys for easy editing
      const editingObj = {};
      staticInfo.forEach(item => {
        editingObj[item.infoKey] = item.infoValue;
      });
      
      setEditingInfo(editingObj);
      setShowClubInfoModal(true);
    } catch (err) {
      console.error('Error loading static info:', err);
      setError('Failed to load club information');
    }
  };

  const handleSaveClubInfo = async () => {
    setUpdating(true);
    try {
      // Update each static info item
      const updatePromises = staticInfoData.map(async (item) => {
        if (editingInfo[item.infoKey] !== item.infoValue && item.staticInfoId) {
          await updateStaticInfoById(item.staticInfoId, {
            infoKey: item.infoKey,
            infoValue: editingInfo[item.infoKey]
          });
        }
      });
      
      await Promise.all(updatePromises);
      
      // Invalidate static info cache and update local state
      invalidateCache('staticInfo');
      const updatedStaticInfo = await getCachedStaticInfo();
      setStaticInfoData(updatedStaticInfo);
      
      // Update agenda data locally without full reload
      if (selectedMeeting && agendaData) {
        setAgendaData(prev => ({
          ...prev,
          agendaStaticInfo: updatedStaticInfo
        }));
      }
      
      setShowClubInfoModal(false);
      // toast.success('Club information updated successfully'); // Commented out as toast is not imported
    } catch (err) {
      console.error('Error updating static info:', err);
      setError('Failed to update club information');
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (key, value) => {
    setEditingInfo(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // ================== CLUB OFFICERS HANDLERS ==================
  
  const handleEditOfficers = async () => {
    if (isMemberView) return;
    try {
      const officers = await getCachedClubOfficers();
      setOfficersData(officers);
      setShowOfficersModal(true);
    } catch (err) {
      console.error('Error loading officers:', err);
      setError('Failed to load club officers');
    }
  };

  const handleUpdateOfficer = async (officer) => {
    try {
      await updateClubOfficerById(officer.officerId, {
        leadershipName: officer.leadershipName,
        userId: officer.userId
      });
      
      // Invalidate cache and reload officers data
      invalidateCache('clubOfficers');
      const updatedOfficers = await getCachedClubOfficers();
      setOfficersData(updatedOfficers);
      
      // Update agenda data locally without full reload
      if (selectedMeeting && agendaData) {
        setAgendaData(prev => ({
          ...prev,
          clubOfficers: updatedOfficers
        }));
      }
      
      setEditingOfficer(null);
    } catch (err) {
      console.error('Error updating officer:', err);
      setError('Failed to update officer');
    }
  };

  const handleDeleteOfficer = async (officerId) => {
    try {
      await deleteClubOfficerById(officerId);
      
      // Invalidate cache and reload officers data
      invalidateCache('clubOfficers');
      const updatedOfficers = await getCachedClubOfficers();
      setOfficersData(updatedOfficers);
      
      // Update agenda data locally without full reload
      if (selectedMeeting && agendaData) {
        setAgendaData(prev => ({
          ...prev,
          clubOfficers: updatedOfficers
        }));
      }
    } catch (err) {
      console.error('Error deleting officer:', err);
      setError('Failed to delete officer');
    }
  };

  const handleAddOfficer = async () => {
    if (isMemberView) return;
    try {
      await addClubOfficer(newOfficer);
      
      // Invalidate cache and reload officers data
      invalidateCache('clubOfficers');
      const updatedOfficers = await getCachedClubOfficers();
      setOfficersData(updatedOfficers);
      
      // Update agenda data locally without full reload
      if (selectedMeeting && agendaData) {
        setAgendaData(prev => ({
          ...prev,
          clubOfficers: updatedOfficers
        }));
      }
      
      setNewOfficer({ leadershipName: '', userId: '' });
      setShowAddOfficerModal(false);
    } catch (err) {
      console.error('Error adding officer:', err);
      setError('Failed to add officer');
    }
  };

  // ================== WOD/POD HANDLERS ==================
  
  const handleEditWOD = async () => {
    if (isMemberView) return;
    if (!selectedMeeting) return;
    
    try {
      const response = await getWordsDataByMeeting(selectedMeeting.meetingId);
      const wordsDataList = response.data.data || [];
      
      // Filter for WOD items
      const wodItems = wordsDataList.filter(item => item.wordType?.toUpperCase() === 'WOD');
      
      if (wodItems.length > 0) {
        setWODData(wodItems);
        
        // Create editing object
        const editingObj = {};
        wodItems.forEach(item => {
          editingObj[item.grammarianId] = {
            word: item.word,
            meaning: item.meaning,
            example: item.example
          };
        });
        
        setEditingWOD(editingObj);
        setShowWODModal(true);
      } else {
        setError('No Word of the Day data found for this meeting');
      }
    } catch (err) {
      console.error('Error loading WOD data:', err);
      if (err.code === 'ERR_NETWORK' || err.message.includes('CORS')) {
        setError('CORS Error: Backend server needs CORS configuration for http://localhost:5173. Please configure CORS on your backend server.');
      } else {
        setError('Failed to load Word of the Day data');
      }
    }
  };

  const handleEditPOD = async () => {
    if (isMemberView) return;
    if (!selectedMeeting) return;
    
    try {
      const response = await getWordsDataByMeeting(selectedMeeting.meetingId);
      const wordsDataList = response.data.data || [];
      
      // Filter for POD items
      const podItems = wordsDataList.filter(item => item.wordType?.toUpperCase() === 'POD');
      
      if (podItems.length > 0) {
        setPODData(podItems);
        
        // Create editing object
        const editingObj = {};
        podItems.forEach(item => {
          editingObj[item.grammarianId] = {
            word: item.word,
            meaning: item.meaning,
            example: item.example
          };
        });
        
        setEditingPOD(editingObj);
        setShowPODModal(true);
      } else {
        setError('No Phrase of the Day data found for this meeting');
      }
    } catch (err) {
      console.error('Error loading POD data:', err);
      if (err.code === 'ERR_NETWORK' || err.message.includes('CORS')) {
        setError('CORS Error: Backend server needs CORS configuration for http://localhost:5173. Please configure CORS on your backend server.');
      } else {
        setError('Failed to load Phrase of the Day data');
      }
    }
  };

  const handleSaveWOD = async () => {
    if (isMemberView) return;
    setUpdating(true);
    try {
      const updatePromises = wodData.map(async (item) => {
        const editedData = editingWOD[item.grammarianId];
        if (editedData) {
          await updateWordsDataByUserAndMeeting(item.userId, selectedMeeting.meetingId, {
            word: editedData.word,
            meaning: editedData.meaning,
            example: editedData.example,
            wordType: 'WOD'
          });
        }
      });
      
      await Promise.all(updatePromises);
      
      // Update agenda data locally without full reload
      if (selectedMeeting && agendaData) {
        // Fetch updated WOD data and update grammarian section
        const response = await getWordsDataByMeeting(selectedMeeting.meetingId);
        const wordsDataList = response.data.data || [];
        const updatedWODItems = wordsDataList.filter(item => item.wordType?.toUpperCase() === 'WOD');
        
        setAgendaData(prev => ({
          ...prev,
          grammarian: prev.grammarian ? prev.grammarian.map(item => {
            if (item.wordType?.toUpperCase() === 'WOD') {
              const updatedItem = updatedWODItems.find(wod => wod.grammarianId === item.grammarianId);
              return updatedItem || item;
            }
            return item;
          }) : updatedWODItems
        }));
      }
      
      setShowWODModal(false);
    } catch (err) {
      console.error('Error updating WOD:', err);
      setError('Failed to update Word of the Day');
    } finally {
      setUpdating(false);
    }
  };

  const handleSavePOD = async () => {
    if (isMemberView) return;
    setUpdating(true);
    try {
      const updatePromises = podData.map(async (item) => {
        const editedData = editingPOD[item.grammarianId];
        if (editedData) {
          await updateWordsDataByUserAndMeeting(item.userId, selectedMeeting.meetingId, {
            word: editedData.word,
            meaning: editedData.meaning,
            example: editedData.example,
            wordType: 'POD'
          });
        }
      });
      
      await Promise.all(updatePromises);
      
      // Update agenda data locally without full reload
      if (selectedMeeting && agendaData) {
        // Fetch updated POD data and update grammarian section
        const response = await getWordsDataByMeeting(selectedMeeting.meetingId);
        const wordsDataList = response.data.data || [];
        const updatedPODItems = wordsDataList.filter(item => item.wordType?.toUpperCase() === 'POD');
        
        setAgendaData(prev => ({
          ...prev,
          grammarian: prev.grammarian ? prev.grammarian.map(item => {
            if (item.wordType?.toUpperCase() === 'POD') {
              const updatedItem = updatedPODItems.find(pod => pod.grammarianId === item.grammarianId);
              return updatedItem || item;
            }
            return item;
          }) : [...(prev.grammarian || []), ...updatedPODItems]
        }));
      }
      
      setShowPODModal(false);
    } catch (err) {
      console.error('Error updating POD:', err);
      setError('Failed to update Phrase of the Day');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditAbbreviations = async () => {
    if (isMemberView) return;
    try {
      const abbreviations = await getCachedAbbreviations();
      if (!abbreviations) {
        setError('No abbreviations data found');
        return;
      }
      
      setAbbreviationsData(abbreviations);
      setEditingAbbreviations([...abbreviations]);
      setShowAbbreviationsModal(true);
    } catch (err) {
      console.error('Error loading abbreviations:', err);
      setError('Failed to load abbreviations');
    }
  };

  const handleSaveAbbreviations = async () => {
    if (isMemberView) return;
    setUpdating(true);
    try {
      const updatePromises = editingAbbreviations.map(async (item, index) => {
        const originalItem = abbreviationsData[index];
        if (originalItem && (item.abbreviation !== originalItem.abbreviation || item.meaning !== originalItem.meaning)) {
          await updateAbbreviationsById(originalItem.abbreviationId, {
            abbreviation: item.abbreviation,
            meaning: item.meaning
          });
        }
      });
      
      await Promise.all(updatePromises);
      
      // Invalidate cache and update local state
      invalidateCache('abbreviations');
      const updatedAbbreviations = await getCachedAbbreviations();
      setAbbreviationsData(updatedAbbreviations);
      setEditingAbbreviations([...updatedAbbreviations]);
      
      // Update agenda data locally without full reload
      if (selectedMeeting && agendaData) {
        setAgendaData(prev => ({
          ...prev,
          abbreviations: updatedAbbreviations
        }));
      }
      
      setShowAbbreviationsModal(false);
    } catch (err) {
      console.error('Error updating abbreviations:', err);
      setError('Failed to update abbreviations');
    } finally {
      setUpdating(false);
    }
  };

  const handleAbbreviationChange = (index, field, value) => {
    setEditingAbbreviations(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDeleteAbbreviation = async (abbreviationId, index) => {
    if (isMemberView) return;
    try {
      await deleteAbbreviationsById(abbreviationId);
      
      // Invalidate cache and update local state
      invalidateCache('abbreviations');
      const updatedAbbreviations = await getCachedAbbreviations();
      setEditingAbbreviations([...updatedAbbreviations]);
      setAbbreviationsData(updatedAbbreviations);
      
      // Update agenda data locally without full reload
      if (selectedMeeting && agendaData) {
        setAgendaData(prev => ({
          ...prev,
          abbreviations: updatedAbbreviations
        }));
      }
    } catch (err) {
      console.error('Error deleting abbreviation:', err);
      setError('Failed to delete abbreviation');
    }
  };

  const handleAddAbbreviation = async () => {
    if (isMemberView) return;
    try {
      await addAbbreviation(newAbbreviation);
      
      // Invalidate cache and reload abbreviations data
      invalidateCache('abbreviations');
      const updatedAbbreviations = await getCachedAbbreviations();
      setAbbreviationsData(updatedAbbreviations);
      setEditingAbbreviations([...updatedAbbreviations]);
      
      // Update agenda data locally without full reload
      if (selectedMeeting && agendaData) {
        setAgendaData(prev => ({
          ...prev,
          abbreviations: updatedAbbreviations
        }));
      }
      
      setNewAbbreviation({ abbreviation: '', meaning: '' });
      setShowAddAbbreviationModal(false);
    } catch (err) {
      console.error('Error adding abbreviation:', err);
      setError('Failed to add abbreviation');
    }
  };

  // ================== RENDERERS ==================

  const formatMeetingTitle = (meeting) => {
    if (!meeting) return '';
    const meetingDate = new Date(meeting.meetingDate);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return `${meeting.meetingId}th Chapter Meeting, ${meetingDate.toLocaleDateString('en-US', options)}`;
  };

  const formatMeetingTime = (meeting) => {
    if (!meeting || !meeting.startTime || !meeting.endTime) return '';
    const formatTime = (timeString) => {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    return `${formatTime(meeting.startTime)} to ${formatTime(meeting.endTime)}`;
  };

  const getStaticInfo = (key) => {
    if (!agendaData?.agendaStaticInfo) return '';
    const info = agendaData.agendaStaticInfo.find(item => item.infoKey === key);
    return info ? info.infoValue : '';
  };

  const ClubOfficerItem = ({ officer }) => {
    const [userName, setUserName] = useState("Loading...");

    useEffect(() => {
      const loadUser = async () => {
        const user = await fetchUserData(officer.userId);
        setUserName(user.userName || "N/A");
      };
      loadUser();
    }, [officer.userId]);

    return (
      <div className="mb-2 p-2 border rounded bg-light">
        <div className="d-flex justify-content-between">
          <Badge bg="secondary">{officer.leadershipName}</Badge>
          <span>{userName}</span>
        </div>
      </div>
    );
  };

  const renderClubMembers = () => {
    if (!agendaData?.clubOfficers?.length) {
      return (
        <Card className="mb-4">
          <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <Users className="me-2" size={20} />
              Club Officers
            </h5>
            {!isMemberView && <button className="btn btn-sm btn-light" onClick={handleEditOfficers}>Edit</button>}
          </Card.Header>
          <Card.Body>
            <p className="text-muted">No club officers data available</p>
          </Card.Body>
        </Card>
      );
    }

    const midpoint = Math.ceil(agendaData.clubOfficers.length / 2);
    const leftColumn = agendaData.clubOfficers.slice(0, midpoint);
    const rightColumn = agendaData.clubOfficers.slice(midpoint);

    return (
      <Card className="mb-4">
        <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <Users className="me-2" size={20} />
            Club Officers
          </h5>
          {!isMemberView && <button className="btn btn-sm btn-light" onClick={handleEditOfficers}>Edit</button>}
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              {leftColumn.map((officer, index) => (
                <ClubOfficerItem key={index} officer={officer} />
              ))}
            </Col>
            <Col md={6}>
              {rightColumn.map((officer, index) => (
                <ClubOfficerItem key={index} officer={officer} />
              ))}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
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

  const AgendaTableRow = ({ item, currentTime, sectionName }) => {
    const [presenterName, setPresenterName] = useState("Loading...");
    useEffect(() => {
      const loadPresenter = async () => {
        if (!item?.userId) {
          setPresenterName("N/A");
          return;
        }
        const user = await fetchUserData(item.userId);
        setPresenterName(user?.userName || "N/A");
      };
      loadPresenter();
    }, [item?.userId]);

    // Check if this is a speech section and find matching speech data
    const isInSpeechSection = isSpeechSection(sectionName);
    const matchingSpeech = isInSpeechSection ? 
      speakerSpeeches.find(speech => 
        (speech.user?.userId || speech.userId) === item.userId
      ) : null;

    return (
      <tr>
        <td>{currentTime}</td>
        {(() => {
          const isProvided = (v) => v !== null && v !== undefined && String(v).trim() !== '' && String(v).trim() !== '0';
          const providedVals = [item.minTime, item.avgTime, item.maxTime].filter(isProvided);
          if (providedVals.length === 1) {
            // Merge into one cell (no background) when only one value is provided
            return <td colSpan={3} className="fw-semibold">{providedVals[0]}</td>;
          }
          // Otherwise show three colored cells
          return (
            <>
              <td style={{ backgroundColor: '#84CF6D' }}>{item.minTime || ''}</td>
              <td style={{ backgroundColor: '#F2D918' }}>{item.avgTime || ''}</td>
              <td style={{ backgroundColor: '#ED4734' }}>{item.maxTime || ''}</td>
            </>
          );
        })()}
        <td className="text-start">
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
                  {item.speechData.title || 'Speech Title'}
                </small>
              </div>
            </div>
          ) : (
            matchingSpeech ? (
              <div>
                <div className="d-flex mb-1">
                  <div style={{ width: '15%', padding: '2px' }}>
                    <small className="fw-bold text-primary">
                      {formatPathwaysTrack(matchingSpeech.pathwaysTrack)}
                    </small>
                  </div>
                  <div style={{ width: '15%', padding: '2px' }}>
                    <small className="fw-bold text-success">
                      {formatLevel(matchingSpeech.level)}
                    </small>
                  </div>
                  <div style={{ width: '15%', padding: '2px' }}>
                    <small className="fw-bold text-warning">
                      {formatProjectNo(matchingSpeech.projectNo)}
                    </small>
                  </div>
                  <div style={{ width: '55%', padding: '2px' }}>
                    <small className="text-muted">
                      {matchingSpeech.title || 'Speech Title'}
                    </small>
                  </div>
                </div>
                <div className="text-muted small">
                  {matchingSpeech.title || 'Speech Title'}
                </div>
              </div>
            ) : (
              item.activity
            )
          )}
        </td>
        <td className="text-start">{presenterName}</td>
      </tr>
    );
  };

  const renderAgendaTable = () => {
    if (!agendaData?.agenda?.length || !selectedMeeting) {
      return (
        <Card className="mb-4">
          <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <Clock className="me-2" size={20} />
              Meeting Agenda
            </h5>
            {!isMemberView && (
              <button
                className="btn btn-sm btn-light"
                onClick={() => {
                  if (selectedMeeting?.meetingId) {
                    if (onEditAgenda) {
                      onEditAgenda(selectedMeeting.meetingId);
                    } else {
                      navigate(`/update-agenda/${selectedMeeting.meetingId}`);
                    }
                  }
                }}
              >
                Edit
              </button>
            )}
          </Card.Header>
          <Card.Body>
            <p className="text-muted">No agenda items available</p>
          </Card.Body>
        </Card>
      );
    }

    let currentTime = new Date(`${selectedMeeting.meetingDate}T${selectedMeeting.startTime}`);

    const formatTime = (date) => {
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHour = hours % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
      <Card className="mb-4">
        <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <Clock className="me-2" size={20} />
            Meeting Agenda
          </h5>
          {!isMemberView && (
            <button
              className="btn btn-sm btn-light"
              onClick={() => {
                if (selectedMeeting?.meetingId) {
                  if (onEditAgenda) {
                    onEditAgenda(selectedMeeting.meetingId);
                  } else {
                    navigate(`/update-agenda/${selectedMeeting.meetingId}`);
                  }
                }
              }}
            >
              Edit
            </button>
          )}
        </Card.Header>
        <Card.Body>
          <Table responsive bordered hover style={{ border: "2px solid black" }}>
            <thead>
              <tr className='text-center'>
                <th>Time</th>
                <th>Min</th>
                <th>Avg</th>
                <th>Max</th>
                <th>Activity</th>
                <th>Presenter</th>
              </tr>
            </thead>
            <tbody className='text-center'>
              {agendaData.agenda.map((item, index) => {
                // Render explicit section header rows (e.g., PREPARED SPEECHES SESSION)
                if (item?.isSection) {
                  return (
                    <tr key={`sec-explicit-${item.sectionId || index}`}>
                      <td colSpan={6} className="text-center fw-bold" style={{ backgroundColor: '#f1f3f5' }}>
                        {item.sectionName || sectionById[item.sectionId] || 'Section'}
                      </td>
                    </tr>
                  );
                }

                const rowTime = formatTime(currentTime);
                // Only advance time for data rows with a numeric maxTime
                const maxMins = parseInt(item.maxTime);
                if (Number.isFinite(maxMins)) {
                  currentTime = new Date(currentTime.getTime() + maxMins * 60000);
                }

                const normalizeId = (v) => {
                  const n = parseInt(v);
                  return Number.isFinite(n) && n > 0 ? n : 1;
                };
                const getSectionId = (it) => normalizeId(it?.sectionId || it?.agendaSectionId || it?.agendaSection?.sectionId || 1);
                const currSectionId = getSectionId(item);
                const prevSectionId = index > 0 ? getSectionId(agendaData.agenda[index - 1]) : 1;
                const showHeader = currSectionId !== 1 && currSectionId !== prevSectionId;
                const secName = sectionById[currSectionId];

                // Get current section name for this row (look backwards for the current section)
                let currentSectionName = secName;
                if (!currentSectionName) {
                  // Look backwards to find the current section
                  for (let i = index; i >= 0; i--) {
                    const prevItem = agendaData.agenda[i];
                    const prevSecId = getSectionId(prevItem);
                    const prevSecName = sectionById[prevSecId];
                    if (prevSecName) {
                      currentSectionName = prevSecName;
                      break;
                    }
                  }
                }

                const blockKey = `rowblock-${item.agendaId || item.id || index}`;
                return (
                  <React.Fragment key={blockKey}>
                    {showHeader && secName && (
                      <tr key={`sec-${currSectionId}-${index}`}>
                        <td colSpan={6} className="text-center fw-bold" style={{ backgroundColor: '#f1f3f5' }}>
                          {secName}
                        </td>
                      </tr>
                    )}
                    <AgendaTableRow 
                      key={`row-${item.agendaId || item.id || index}`} 
                      item={item} 
                      currentTime={rowTime} 
                      sectionName={currentSectionName || ''}
                    />
                  </React.Fragment>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    );
  };

  const GrammarianItem = ({ item }) => (
    <div className="mb-3 p-2 border rounded bg-light">
      <h5 className="text-primary">{item.word}</h5>
      <p><strong>Meaning:</strong> {item.meaning}</p>
      <p><strong>Usage:</strong> <em>{item.example}</em></p>
    </div>
  );

  const renderGrammarianSection = () => {
    const wodItems = agendaData?.grammarian?.filter(
      g => (g.wordType || "").trim().toUpperCase() === "WOD"
    ) || [];

    const podItems = agendaData?.grammarian?.filter(
      g => (g.wordType || "").trim().toUpperCase() === "POD"
    ) || [];

    return (
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="bg-warning text-dark d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <BookOpen className="me-2" size={20} />
                Word of the Day (WOD)
              </h5>
              {!isMemberView && <button className="btn btn-sm btn-light" onClick={handleEditWOD}>Edit</button>}
            </Card.Header>
            <Card.Body>
              {wodItems.length > 0 ? (
                wodItems.map((gram, index) => (
                  <GrammarianItem key={index} item={gram} />
                ))
              ) : (
                <p className="text-muted">No word of the day available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <BookOpen className="me-2" size={20} />
                Phrase of the Day (POD)
              </h5>
              {!isMemberView && <button className="btn btn-sm btn-light" onClick={handleEditPOD}>Edit</button>}
            </Card.Header>
            <Card.Body>
              {podItems.length > 0 ? (
                podItems.map((gram, index) => (
                  <GrammarianItem key={index} item={gram} />
                ))
              ) : (
                <p className="text-muted">No phrase of the day available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderAbbreviations = () => {
    if (!agendaData?.abbreviations?.length) {
      return (
        <Row>
          <Col md={12}>
            <Card className="mb-4">
              <Card.Header className="bg-secondary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Abbreviations</h5>
                {!isMemberView && <button className="btn btn-sm btn-light" onClick={handleEditAbbreviations}>Edit</button>}
              </Card.Header>
              <Card.Body>
                <p className="text-muted">No abbreviations available</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      );
    }

    const midpoint = Math.ceil(agendaData.abbreviations.length / 2);
    const leftColumn = agendaData.abbreviations.slice(0, midpoint);
    const rightColumn = agendaData.abbreviations.slice(midpoint);

    return (
      <Row>
        <Col md={12}>
          <Card className="mb-4">
            <Card.Header className="bg-secondary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Abbreviations</h5>
              {!isMemberView && <button className="btn btn-sm btn-light" onClick={handleEditAbbreviations}>Edit</button>}
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  {leftColumn.map((abbr, index) => (
                    <div key={index} className="mb-2 p-2 border rounded bg-light">
                      <div className="d-flex justify-content-between">
                        <strong>{abbr.abbreviation}</strong>
                        <span>{abbr.meaning}</span>
                      </div>
                    </div>
                  ))}
                </Col>
                <Col md={6}>
                  {rightColumn.map((abbr, index) => (
                    <div key={index} className="mb-2 p-2 border rounded bg-light">
                      <div className="d-flex justify-content-between">
                        <strong>{abbr.abbreviation}</strong>
                        <span>{abbr.meaning}</span>
                      </div>
                    </div>
                  ))}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderClubInfo = () => (
    <Card className="mb-4">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <Award className="me-2" size={20} />
          Club Information
        </h5>
        {!isMemberView && <button className="btn btn-sm btn-light" onClick={handleEditClubInfo}>Edit</button>}
      </Card.Header>
      <Card.Body className="text-center">
        <h4 className="mb-2">{getStaticInfo('Club Name') || 'Toastmasters Club'}</h4>
        <p className="text-muted mb-3">
          <strong>Club # {getStaticInfo('Club Id') || 'N/A'}</strong> |{" "}
          <strong>{getStaticInfo('Area') || 'N/A'}</strong> |{" "}
          <strong>{getStaticInfo('District') || 'N/A'}</strong>
        </p>
        <img src={toastmastersLogo} alt="My Photo" width="200" />

        <h6 className="mb-3">
          <strong>Theme:</strong> {selectedMeeting?.meetingTheme || 'N/A'}
        </h6>

        <h5 className="mb-2">{formatMeetingTitle(selectedMeeting)}</h5>

        <p className="text-muted mb-1">
          Inperson Meeting
        </p>

        <p className="text-muted mb-3">
          Time: {formatMeetingTime(selectedMeeting)}
        </p>

        <div className="mt-4 me-5 ms-5 pt-2 px-5 text-justify border border-2 rounded">
          <p>
            <strong>Club Mission:</strong>{" "}
            {getStaticInfo('Club Mission') ||
              'We provide a supportive and positive learning experience in which members are empowered to develop communication and leadership skills, resulting in greater self confidence and personal growth.'}
          </p>
        </div>
      </Card.Body>
    </Card>
  );

  const renderClubInfoModal = () => (
    <Modal show={showClubInfoModal} onHide={() => setShowClubInfoModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Club Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {staticInfoData.length > 0 ? (
          <Form>
            {staticInfoData.map((item, index) => (
              <Form.Group className="mb-3" key={`static-info-${item.staticInfoId || index}`}>
                <Form.Label>
                  <strong>{item.infoKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</strong>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={editingInfo[item.infoKey] || ''}
                  onChange={(e) => handleInputChange(item.infoKey, e.target.value)}
                />
              </Form.Group>
            ))}
          </Form>
        ) : (
          <p>No club information available to edit.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowClubInfoModal(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveClubInfo} disabled={updating}>
          {updating ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const renderOfficersModal = () => (
    <Modal show={showOfficersModal} onHide={() => setShowOfficersModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Edit Club Officers
          <Button 
            variant="success" 
            size="sm" 
            className="ms-3"
            onClick={() => setShowAddOfficerModal(true)}
          >
            Add Officer
          </Button>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {officersData.length > 0 ? (
          <div>
            {officersData.map((officer) => (
              <div key={officer.officerId} className="mb-3 p-3 border rounded">
                {editingOfficer?.officerId === officer.officerId ? (
                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label>Leadership Position</Form.Label>
                          <Form.Control
                            type="text"
                            value={editingOfficer.leadershipName}
                            onChange={(e) => setEditingOfficer({...editingOfficer, leadershipName: e.target.value})}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label>User ID</Form.Label>
                          <Form.Control
                            type="number"
                            value={editingOfficer.userId}
                            onChange={(e) => setEditingOfficer({...editingOfficer, userId: parseInt(e.target.value)})}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="mt-2">
                      <Button 
                        variant="success" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleUpdateOfficer(editingOfficer)}
                      >
                        Save
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => setEditingOfficer(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{officer.leadershipName}</strong>
                      <br />
                      <small className="text-muted">User ID: {officer.userId}</small>
                    </div>
                    <div>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => setEditingOfficer(officer)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteOfficer(officer.officerId)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No club officers available.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowOfficersModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const renderAddOfficerModal = () => (
    <Modal show={showAddOfficerModal} onHide={() => setShowAddOfficerModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Officer</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Leadership Position</Form.Label>
            <Form.Control
              type="text"
              value={newOfficer.leadershipName}
              onChange={(e) => setNewOfficer({...newOfficer, leadershipName: e.target.value})}
              placeholder="Enter leadership position"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>User ID</Form.Label>
            <Form.Control
              type="number"
              value={newOfficer.userId}
              onChange={(e) => setNewOfficer({...newOfficer, userId: e.target.value})}
              placeholder="Enter user ID"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowAddOfficerModal(false)}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleAddOfficer}
          disabled={!newOfficer.leadershipName || !newOfficer.userId}
        >
          Add Officer
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const renderWODModal = () => (
    <Modal show={showWODModal} onHide={() => setShowWODModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Word of the Day</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {wodData.length > 0 ? (
          <Form>
            {wodData.map((item) => (
              <div key={item.grammarianId} className="mb-4 p-3 border rounded">
                <h6>Word Entry {item.grammarianId}</h6>
                <Form.Group className="mb-2">
                  <Form.Label>Word</Form.Label>
                  <Form.Control
                    type="text"
                    value={editingWOD[item.grammarianId]?.word || ''}
                    onChange={(e) => setEditingWOD(prev => ({
                      ...prev,
                      [item.grammarianId]: {
                        ...prev[item.grammarianId],
                        word: e.target.value
                      }
                    }))}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Meaning</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={editingWOD[item.grammarianId]?.meaning || ''}
                    onChange={(e) => setEditingWOD(prev => ({
                      ...prev,
                      [item.grammarianId]: {
                        ...prev[item.grammarianId],
                        meaning: e.target.value
                      }
                    }))}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Example</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={editingWOD[item.grammarianId]?.example || ''}
                    onChange={(e) => setEditingWOD(prev => ({
                      ...prev,
                      [item.grammarianId]: {
                        ...prev[item.grammarianId],
                        example: e.target.value
                      }
                    }))}
                  />
                </Form.Group>
              </div>
            ))}
          </Form>
        ) : (
          <p>No Word of the Day data available.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowWODModal(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveWOD} disabled={updating}>
          {updating ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const renderPODModal = () => (
    <Modal show={showPODModal} onHide={() => setShowPODModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Phrase of the Day</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {podData.length > 0 ? (
          <Form>
            {podData.map((item) => (
              <div key={item.grammarianId} className="mb-4 p-3 border rounded">
                <h6>Phrase Entry {item.grammarianId}</h6>
                <Form.Group className="mb-2">
                  <Form.Label>Phrase</Form.Label>
                  <Form.Control
                    type="text"
                    value={editingPOD[item.grammarianId]?.word || ''}
                    onChange={(e) => setEditingPOD(prev => ({
                      ...prev,
                      [item.grammarianId]: {
                        ...prev[item.grammarianId],
                        word: e.target.value
                      }
                    }))}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Meaning</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={editingPOD[item.grammarianId]?.meaning || ''}
                    onChange={(e) => setEditingPOD(prev => ({
                      ...prev,
                      [item.grammarianId]: {
                        ...prev[item.grammarianId],
                        meaning: e.target.value
                      }
                    }))}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Example</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={editingPOD[item.grammarianId]?.example || ''}
                    onChange={(e) => setEditingPOD(prev => ({
                      ...prev,
                      [item.grammarianId]: {
                        ...prev[item.grammarianId],
                        example: e.target.value
                      }
                    }))}
                  />
                </Form.Group>
              </div>
            ))}
          </Form>
        ) : (
          <p>No Phrase of the Day data available.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowPODModal(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSavePOD} disabled={updating}>
          {updating ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const renderAbbreviationsModal = () => (
    <Modal show={showAbbreviationsModal} onHide={() => setShowAbbreviationsModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Edit Abbreviations
          <Button 
            variant="success" 
            size="sm" 
            className="ms-3"
            onClick={() => setShowAddAbbreviationModal(true)}
          >
            Add Abbreviation
          </Button>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {editingAbbreviations.length > 0 ? (
          <Form>
            {editingAbbreviations.map((item, index) => (
              <div key={index} className="mb-3 p-3 border rounded">
                <Row>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Abbreviation</Form.Label>
                      <Form.Control
                        type="text"
                        value={item.abbreviation || ''}
                        onChange={(e) => handleAbbreviationChange(index, 'abbreviation', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Meaning</Form.Label>
                      <Form.Control
                        type="text"
                        value={item.meaning || ''}
                        onChange={(e) => handleAbbreviationChange(index, 'meaning', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteAbbreviation(item.abbreviationId, index)}
                      className="w-100"
                    >
                      Delete
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}
          </Form>
        ) : (
          <p>No abbreviations available to edit.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowAbbreviationsModal(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveAbbreviations} disabled={updating}>
          {updating ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const renderAddAbbreviationModal = () => (
    <Modal show={showAddAbbreviationModal} onHide={() => setShowAddAbbreviationModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Abbreviation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Abbreviation</Form.Label>
            <Form.Control
              type="text"
              value={newAbbreviation.abbreviation}
              onChange={(e) => setNewAbbreviation({...newAbbreviation, abbreviation: e.target.value})}
              placeholder="Enter abbreviation (e.g., TM, CC, DTM)"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Meaning</Form.Label>
            <Form.Control
              type="text"
              value={newAbbreviation.meaning}
              onChange={(e) => setNewAbbreviation({...newAbbreviation, meaning: e.target.value})}
              placeholder="Enter the full meaning"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowAddAbbreviationModal(false)}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleAddAbbreviation}
          disabled={!newAbbreviation.abbreviation || !newAbbreviation.meaning}
        >
          Add Abbreviation
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <Container fluid>
      {!isMemberView && (
        <>
          <div className="mb-4">
            <h2>Meeting Agenda</h2>
            <p className="text-muted">Select a meeting to view its agenda and details</p>
          </div>

          <Card className="mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={6}>
                  <label className="form-label fw-bold">Select Meeting:</label>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-primary" className="w-400 text-start">
                      {selectedMeeting
                        ? `${selectedMeeting.meetingTheme} - ${new Date(selectedMeeting.meetingDate).toLocaleDateString()}`
                        : 'Choose a meeting...'}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {meetingsLoading ? (
                        <Dropdown.Item disabled>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Loading meetings...
                        </Dropdown.Item>
                      ) : meetings.length === 0 ? (
                        <Dropdown.Item disabled>No upcoming meetings found</Dropdown.Item>
                      ) : (
                        meetings.map((meeting) => (
                          <Dropdown.Item
                            key={meeting.meetingId}
                            onClick={() => handleMeetingSelect(meeting)}
                          >
                            <div>
                              <strong>{meeting.meetingTheme}</strong>
                              <br />
                              <small className="text-muted">
                                {new Date(meeting.meetingDate).toLocaleDateString()} - {meeting.meetingLocation}
                              </small>
                            </div>
                          </Dropdown.Item>
                        ))
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
                <Col md={6} className="d-flex justify-content-end align-items-end">
                  {!isMemberView && selectedMeeting && (
                    <Button
                      variant={selectedMeeting.isPublished ? 'warning' : 'success'}
                      onClick={togglePublish}
                      disabled={publishing}
                    >
                      {publishing ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Processing...
                        </>
                      ) : selectedMeeting.isPublished ? 'Unpublish' : 'Publish'}
                    </Button>
                  )}
                  {loading && (
                    <div className="text-center">
                      <Spinner animation="border" className="me-2" />
                      Loading agenda data...
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </>
      )}

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {selectedMeeting && agendaData && !loading && (
        <>
          {renderClubInfo()}
          {renderClubMembers()}
          {renderAgendaTable()}
          {renderGrammarianSection()}
          {renderAbbreviations()}
        </>
      )}

      {selectedMeeting && !agendaData && !loading && !error && (
        <Alert variant="info">
          Please select speaker and grammarian to load agenda data.
        </Alert>
      )}

      {renderClubInfoModal()}
      {renderOfficersModal()}
      {renderAddOfficerModal()}
      {renderWODModal()}
      {renderPODModal()}
      {renderAbbreviationsModal()}
      {renderAddAbbreviationModal()}
    </Container>
  );
};

export default AgendaView;