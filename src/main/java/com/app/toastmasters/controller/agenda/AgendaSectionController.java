package com.app.toastmasters.controller.agenda;

import com.app.toastmasters.dto.requestDTO.AgendaSectionRequestDTO;
import com.app.toastmasters.dto.responseDTO.AgendaSectionResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.AgendaSectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/agenda")
public class AgendaSectionController {

    private final AgendaSectionService service;

    public AgendaSectionController(AgendaSectionService service) {
        this.service = service;
    }

    @PostMapping("/addAgendaSection")
    public ResponseEntity<ResponseMessage<AgendaSectionResponseDTO>> addAgendaSection(@RequestBody AgendaSectionRequestDTO dto) {
        return service.addAgendaSection(dto);
    }

    @GetMapping("/getAllAgendaSections")
    public ResponseEntity<ResponseMessage<List<AgendaSectionResponseDTO>>> getAllAgendaSections() {
        return service.getAllAgendaSections();
    }

    @GetMapping("/getAgendaSectionById/{id}")
    public ResponseEntity<ResponseMessage<AgendaSectionResponseDTO>> getAgendaSectionById(@PathVariable int id) {
        return service.getAgendaSectionById(id);
    }

    @PutMapping("/updateAgendaSection/{id}")
    public ResponseEntity<ResponseMessage<AgendaSectionResponseDTO>> updateAgendaSection(@PathVariable int id,
                                                                                         @RequestBody AgendaSectionRequestDTO dto) {
        return service.updateAgendaSection(id, dto);
    }

    @DeleteMapping("/deleteAgendaSection/{id}")
    public ResponseEntity<ResponseMessage<String>> deleteAgendaSection(@PathVariable int id) {
        return service.deleteAgendaSection(id);
    }
}
