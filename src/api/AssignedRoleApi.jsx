import axios from 'axios';

const BASE_URL = '/api';

// Add member assigned roles
export const addMemberAssignedRole = async (userId, meetingId, assignedRoleList) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/addMemberAssignedRole/${userId}/${meetingId}`,
      assignedRoleList,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding assigned roles:', error);
    throw error;
  }
};

// Get member assigned roles
export const getMemberAssignedRole = async (userId, meetingId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/getMemberAssignedRole/${userId}/${meetingId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned roles:', error);
    throw error;
  }
};

// Delete member assigned roles
export const deleteMemberAssignedRole = async (userId, meetingId, deleteRoles) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/deleteAssignedRole/${userId}/${meetingId}`,
      { data: deleteRoles }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting assigned roles:', error);
    throw error;
  }
};

// Get all assigned roles for a specific meeting (workaround using existing APIs)
export const getAllMemberAssignedRolesByMeeting = async (meetingId) => {
  try {
    // Import getAllMembers here to avoid circular dependency
    const { getAllMembers } = await import('./UserApi');
    
    // Get all members
    const membersResponse = await getAllMembers();
    const members = membersResponse.data?.data || [];
    
    // Get assigned roles for each member
    const allAssignedRoles = [];
    
    for (const member of members) {
      try {
        const userId = member.userId || member.id;
        if (userId) {
          const assignedResponse = await getMemberAssignedRole(userId, meetingId);
          const assignedRoles = assignedResponse.data || [];
          
          // Add each assigned role to the collection
          assignedRoles.forEach(role => {
            allAssignedRoles.push({
              userId: userId,
              meetingId: meetingId,
              roleName: role.roleName || role.name || role,
              memberName: member.firstName + ' ' + member.lastName,
              ...role
            });
          });
        }
      } catch (memberError) {
        // Skip members with no assigned roles (404 is expected)
        if (memberError.response?.status !== 404) {
          console.warn(`Error fetching roles for member ${member.userId}:`, memberError.message);
        }
      }
    }
    
    return {
      success: true,
      data: allAssignedRoles
    };
  } catch (error) {
    console.error('Error fetching all assigned roles for meeting:', error);
    throw error;
  }
};

// Get last 3 meeting roles for a user
export const getLast3MeetingRoles = async (userId) => {
  try {
    console.log(`Fetching last 3 meeting roles for user ${userId}`);
    const response = await axios.get(
      `${BASE_URL}/getLast3MeetingRoles/${userId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('Raw API response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    
    // Handle different response formats
    let responseData = response.data;
    
    // If the response is a string, try to parse it as JSON
    if (typeof responseData === 'string') {
      try {
        responseData = JSON.parse(responseData);
      } catch (e) {
        console.warn('Response is not valid JSON, using as-is');
      }
    }
    
    // If the response has a data property, use that
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      return {
        ...responseData,
        data: responseData.data || {}
      };
    }
    
    // If the response is already an object, return it as is
    if (responseData && typeof responseData === 'object') {
      return {
        success: true,
        message: 'Success',
        data: responseData
      };
    }
    
    // If we get here, the response format is unexpected
    console.warn('Unexpected response format:', responseData);
    return {
      success: false,
      message: 'Unexpected response format',
      data: {}
    };
    
  } catch (error) {
    console.error('Error in getLast3MeetingRoles:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    
    return { 
      success: false, 
      message: error.message,
      data: {},
      error: error.response?.data || error.message
    };
  }
};
