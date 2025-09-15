package com.app.toastmasters.services;

import com.app.toastmasters.dto.requestDTO.MeetingWinnerRequestDTO;
import com.app.toastmasters.dto.responseDTO.MeetingWinnerResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface MeetingWinnerService {
    ResponseEntity<ResponseMessage<MeetingWinnerResponseDTO>> addMeetingWinner(MeetingWinnerRequestDTO meetingWinnerRequestDTO);

    ResponseEntity<ResponseMessage<List<MeetingWinnerResponseDTO>>> getAllMeetingWinner();

    ResponseEntity<ResponseMessage<List<MeetingWinnerResponseDTO>>> getAllMeetingWinnerByMeeting(int meetingId);

    ResponseEntity<ResponseMessage<List<MeetingWinnerResponseDTO>>> getAllMeetingWinnerByUser(int userId);

    ResponseEntity<ResponseMessage<MeetingWinnerResponseDTO>> updateMeetingWinnerByUserAndMeeting(MeetingWinnerRequestDTO dto, int userId, int meetingId);

    ResponseEntity<ResponseMessage<MeetingWinnerResponseDTO>> deleteMeetingWinnerByUserAndMeeting(int userId, int meetingId);
}
