package com.app.toastmasters.services;

import com.app.toastmasters.dto.requestDTO.MeetingRequestDTO;
import com.app.toastmasters.dto.responseDTO.MeetingResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface MeetingService {

    ResponseEntity<ResponseMessage<MeetingResponseDTO>> addMeeting(MeetingRequestDTO meetingRequestDTO);

    ResponseEntity<ResponseMessage<List<MeetingResponseDTO>>> getAllMeetings();

    ResponseEntity<ResponseMessage<MeetingResponseDTO>> getMeetingById(Integer meetingId);

    ResponseEntity<ResponseMessage<MeetingResponseDTO>> updateMeeting(Integer meetingId, MeetingRequestDTO meetingRequestDTO);

    ResponseEntity<ResponseMessage<MeetingResponseDTO>> deleteMeeting(Integer meetingId);

    ResponseEntity<ResponseMessage<MeetingResponseDTO>> getMeetingByTheme(String meetingTheme);
}
