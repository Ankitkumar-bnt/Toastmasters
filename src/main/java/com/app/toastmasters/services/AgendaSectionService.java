package com.app.toastmasters.services;

import com.app.toastmasters.dto.requestDTO.AgendaSectionRequestDTO;
import com.app.toastmasters.dto.responseDTO.AgendaSectionResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface AgendaSectionService {
    ResponseEntity<ResponseMessage<AgendaSectionResponseDTO>> addAgendaSection(AgendaSectionRequestDTO requestDTO);

    ResponseEntity<ResponseMessage<List<AgendaSectionResponseDTO>>> getAllAgendaSections();

    ResponseEntity<ResponseMessage<AgendaSectionResponseDTO>> getAgendaSectionById(int sectionId);

    ResponseEntity<ResponseMessage<AgendaSectionResponseDTO>> updateAgendaSection(int sectionId, AgendaSectionRequestDTO requestDTO);

    ResponseEntity<ResponseMessage<String>> deleteAgendaSection(int sectionId);
}
