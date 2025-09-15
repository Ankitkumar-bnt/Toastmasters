package com.app.toastmasters.services;

import com.app.toastmasters.dto.responseDTO.AgendaJoinDTO;
import com.app.toastmasters.dto.responseDTO.MeetingResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;

public interface AgendaJoinService {
    ResponseEntity<ResponseMessage<AgendaJoinDTO>> getAgenda(int meetingId);

    ResponseEntity<ResponseMessage<MeetingResponseDTO>> isAgendaPublished(int meetingId, String status);
}
