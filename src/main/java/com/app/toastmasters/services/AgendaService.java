package com.app.toastmasters.services;

import com.app.toastmasters.dto.requestDTO.AgendaRequestDTO;
import com.app.toastmasters.dto.responseDTO.AgendaResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface AgendaService {
    ResponseEntity<ResponseMessage<List<AgendaResponseDTO>>> addAgendaRows(List<AgendaRequestDTO> agendaRows);
}
