package com.app.toastmasters.controller;

import com.app.toastmasters.entity.AgendaJoin;
import com.app.toastmasters.entity.AgendaJoinDTO;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.AgendaJoinService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/agenda")
public class AgendaJoinController {

    private final AgendaJoinService agendaJoinService;

    public AgendaJoinController(AgendaJoinService agendaJoinService) {
        this.agendaJoinService = agendaJoinService;
    }

    @GetMapping("/getAgenda/{userId}/{meetingId}")
    public ResponseEntity<ResponseMessage<AgendaJoinDTO>> getAgenda(
            @PathVariable int userId, @PathVariable int meetingId){
        return agendaJoinService.getAgenda(userId, meetingId);
    }


}
