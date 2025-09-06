package com.app.toastmasters.services;

import com.app.toastmasters.dto.responseDTO.AgendaJoinDTO;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;

public interface AgendaJoinService {
    ResponseEntity<ResponseMessage<AgendaJoinDTO>> getAgenda(int meetingId);
}
