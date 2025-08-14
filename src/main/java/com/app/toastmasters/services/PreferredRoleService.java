package com.app.toastmasters.services;

import com.app.toastmasters.dto.requestDTO.PreferredRoleRequestDTO;
import com.app.toastmasters.dto.responseDTO.PreferredRoleResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public interface PreferredRoleService {
    ResponseEntity<ResponseMessage<PreferredRoleResponseDTO>> addPreferredRole(
            List<String> preferredRoleList,
            int userId,
            int meetingId);

    ResponseEntity<ResponseMessage<List<String>>> getMemberPreferredRole(int userId, int meetingId);

    ResponseEntity<ResponseMessage<String>> deleteMemberPreferredRole(List<String> deleteRoles, int userId, int meetingId);
}
