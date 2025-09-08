package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.requestDTO.AgendaSectionRequestDTO;
import com.app.toastmasters.dto.responseDTO.AgendaSectionResponseDTO;
import com.app.toastmasters.entity.agenda.AgendaSection;
import com.app.toastmasters.exceptions.EmptyListException;
import com.app.toastmasters.exceptions.EmptyObjectException;
import com.app.toastmasters.mapper.AgendaSectionMapper;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.AgendaSectionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AgendaSectionServiceImpl implements AgendaSectionService {

    private final AgendaSectionRepository repository;
    private final AgendaSectionMapper mapper;

    public AgendaSectionServiceImpl(AgendaSectionRepository repository, AgendaSectionMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public ResponseEntity<ResponseMessage<AgendaSectionResponseDTO>> addAgendaSection(AgendaSectionRequestDTO requestDTO) {
        AgendaSection section = mapper.toEntity(requestDTO);
        AgendaSection saved = repository.save(section);
        ResponseMessage<AgendaSectionResponseDTO> response =
                new ResponseMessage<>(HttpStatus.CREATED, Constant.AGENDA_SECTION_ADDED_SUCCESS, mapper.toDto(saved));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<AgendaSectionResponseDTO>>> getAllAgendaSections() {
        List<AgendaSection> list = repository.findAll();
        if (list.isEmpty()) throw new EmptyListException(Constant.EMPTY_LIST);

        List<AgendaSectionResponseDTO> responseList = list.stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());

        ResponseMessage<List<AgendaSectionResponseDTO>> response =
                new ResponseMessage<List<AgendaSectionResponseDTO>>(HttpStatus.OK, Constant.AGENDA_SECTION_DISPLAY_SUCCESS, responseList);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<ResponseMessage<AgendaSectionResponseDTO>> getAgendaSectionById(int sectionId) {
        AgendaSection section = repository.findById(sectionId)
                .orElseThrow(() -> new EmptyObjectException(Constant.AGENDA_SECTION_NOT_FOUND));
        ResponseMessage<AgendaSectionResponseDTO> response =
                new ResponseMessage<>(HttpStatus.OK, Constant.AGENDA_SECTION_DISPLAY_SUCCESS, mapper.toDto(section));
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<ResponseMessage<AgendaSectionResponseDTO>> updateAgendaSection(int sectionId, AgendaSectionRequestDTO requestDTO) {
        AgendaSection section = repository.findById(sectionId)
                .orElseThrow(() -> new EmptyObjectException(Constant.AGENDA_SECTION_NOT_FOUND));

        section.setSectionName(requestDTO.getSectionName());
        AgendaSection updated = repository.save(section);

        ResponseMessage<AgendaSectionResponseDTO> response =
                new ResponseMessage<>(HttpStatus.OK, Constant.AGENDA_SECTION_UPDATED_SUCCESS, mapper.toDto(updated));
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<ResponseMessage<String>> deleteAgendaSection(int sectionId) {
        AgendaSection section = repository.findById(sectionId)
                .orElseThrow(() -> new EmptyObjectException(Constant.AGENDA_SECTION_NOT_FOUND));

        repository.delete(section);

        ResponseMessage<String> response =
                new ResponseMessage<>(HttpStatus.OK, Constant.AGENDA_SECTION_DELETED_SUCCESS, "Section deleted successfully");
        return ResponseEntity.ok(response);
    }
}
