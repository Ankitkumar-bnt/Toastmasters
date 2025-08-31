package com.app.toastmasters.services;

import com.app.toastmasters.dto.responseDTO.MeetingResponseDTO;
import com.app.toastmasters.dto.responseDTO.MeetingRoleResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

public interface MeetingRoleService {
    ResponseEntity<ResponseMessage<List<MeetingRoleResponseDTO>>> addMeetingRoles(Map<String, Integer> roles, int meetingId);

    ResponseEntity<ResponseMessage<List<MeetingRoleResponseDTO>>> getAllMeetingRole();

    ResponseEntity<ResponseMessage<List<MeetingRoleResponseDTO>>> getAllMeetingRoleByMeetingId(int meetingId);

    ResponseEntity<ResponseMessage<List<MeetingRoleResponseDTO>>> getAllMeetingRoleByMeetingTheme(String meetingTheme);
}
