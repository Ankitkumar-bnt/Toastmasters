package com.app.toastmasters.services;

import com.app.toastmasters.dto.responseDTO.AssignedRoleResponseDTO;
import com.app.toastmasters.dto.responseDTO.PreferredRoleResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface AssignedRoleService{

    ResponseEntity<ResponseMessage<AssignedRoleResponseDTO>> addAssignedRole(List<String> assignedRoleList, int userId, int meetingId);

    ResponseEntity<ResponseMessage<List<String>>> getMemberAssignedRole(int userId, int meetingId);

    ResponseEntity<ResponseMessage<String>> deleteMemberAssignedRole(List<String> deleteRoles, int userId, int meetingId);
}
