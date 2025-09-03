package com.app.toastmasters.services;

import com.app.toastmasters.entity.AgendaJoin;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;

public interface AgendaJoinService {
    ResponseEntity<ResponseMessage<AgendaJoin>> getAgenda(int userId, int meetingId);
}
