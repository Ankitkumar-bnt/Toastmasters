package com.app.toastmasters.controller;

import com.app.toastmasters.dto.requestDTO.AgendaRequestDTO;
import com.app.toastmasters.dto.responseDTO.AgendaResponseDTO;
import com.app.toastmasters.entity.Agenda;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.AgendaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/agenda")
public class AgendaController {

    private final AgendaService agendaService;

    public AgendaController(AgendaService agendaService) {
        this.agendaService = agendaService;
    }

    @PostMapping("/addAgendaRows")
    public ResponseEntity<ResponseMessage<List<AgendaResponseDTO>>> addAgendaRows(@RequestBody List<AgendaRequestDTO> agendaRows){

        return agendaService.addAgendaRows(agendaRows);
    }

    @GetMapping("/getAllAgendaRows")
    public ResponseEntity<ResponseMessage<List<AgendaResponseDTO>>> getAllAgendaRows(){
        return agendaService.getAllAgendaRows();
    }

    @GetMapping("/getAgendaRowsByMeeting/{meetingId}")
    public ResponseEntity<ResponseMessage<List<AgendaResponseDTO>>> getAgendaRowsByMeeting(@PathVariable int meetingId){
        return agendaService.getAgendaRowsByMeeting(meetingId);
    }

    @PostMapping("/copyAgendaByMeeting/{fromMeetingId}/{toMeetingId}")
    public ResponseEntity<ResponseMessage<List<AgendaResponseDTO>>> copyAgendaByMeeting(
            @PathVariable int fromMeetingId, @PathVariable int toMeetingId){
        return agendaService.copyAgendaByMeeting(fromMeetingId, toMeetingId);
    }
}
