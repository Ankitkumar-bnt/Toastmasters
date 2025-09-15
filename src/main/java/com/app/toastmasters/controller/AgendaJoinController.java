package com.app.toastmasters.controller;

import com.app.toastmasters.dto.responseDTO.AgendaJoinDTO;
import com.app.toastmasters.dto.responseDTO.MeetingResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.AgendaJoinService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/agenda")
public class AgendaJoinController {

    private final AgendaJoinService agendaJoinService;

    public AgendaJoinController(AgendaJoinService agendaJoinService) {
        this.agendaJoinService = agendaJoinService;
    }

    @GetMapping("/getAgenda/{meetingId}")
    public ResponseEntity<ResponseMessage<AgendaJoinDTO>> getAgenda(@PathVariable int meetingId){
        return agendaJoinService.getAgenda(meetingId);
    }

    @PostMapping("/isAgendaPublished/{meetingId}/{status}")
    public ResponseEntity<ResponseMessage<MeetingResponseDTO>> isAgendaPublished(
            @PathVariable int meetingId, @PathVariable String status){
        return agendaJoinService.isAgendaPublished(meetingId, status);
    }
}
