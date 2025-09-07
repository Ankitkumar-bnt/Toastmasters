package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.requestDTO.AgendaRequestDTO;
import com.app.toastmasters.dto.responseDTO.AgendaResponseDTO;
import com.app.toastmasters.entity.Agenda;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.exceptions.EmptyListException;
import com.app.toastmasters.exceptions.MeetingNotFoundException;
import com.app.toastmasters.mapper.AgendaMapper;
import com.app.toastmasters.repository.AgendaRepository;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.MeetingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AgendaServiceImpl implements AgendaService{

    private final AgendaRepository agendaRepository;
    private final MeetingRepository meetingRepository;
    private final AgendaMapper mapper;

    public AgendaServiceImpl(AgendaRepository agendaRepository, MeetingRepository meetingRepository, AgendaMapper mapper) {
        this.agendaRepository = agendaRepository;
        this.meetingRepository = meetingRepository;
        this.mapper = mapper;
    }

    @Override
    public ResponseEntity<ResponseMessage<List<AgendaResponseDTO>>> addAgendaRows(List<AgendaRequestDTO> agendaRows) {
        int meetingId = agendaRows.getFirst().getMeetingId();
        Optional<Meeting> meeting = meetingRepository.findById(meetingId);
        if(meeting.isEmpty())
            throw new MeetingNotFoundException(Constant.MEETING_NOT_FOUND);

        Meeting meetingData = meeting.get();
        agendaRepository.deleteALLByMeeting(meetingData);

        List<Agenda> agenda = new ArrayList<>();

        for(AgendaRequestDTO a : agendaRows){
            agenda.add(mapper.toEntity(a));
        }
        List<Agenda> agendaList = agendaRepository.saveAll(agenda);

        ResponseMessage<List<AgendaResponseDTO>> responseMessage =
                new ResponseMessage<List<AgendaResponseDTO>>(HttpStatus.OK, Constant.AGENDA_ROWS_ADDED_SUCCESS, agendaList.stream()
                                .map(x-> mapper.toDTO(x))
                                .collect(Collectors.toList()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<AgendaResponseDTO>>> getAllAgendaRows() {
        List<Agenda> agendaList = agendaRepository.findAll();
        if(agendaList == null)
            throw new EmptyListException(Constant.EMPTY_LIST);

        ResponseMessage<List<AgendaResponseDTO>> responseMessage =
                new ResponseMessage<List<AgendaResponseDTO>>(HttpStatus.OK, Constant.AGENDA_DISPLAY_SUCCESS, agendaList.stream()
                        .map(x->mapper.toDTO(x))
                        .collect(Collectors.toList()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<AgendaResponseDTO>>> getAgendaRowsByMeeting(int meetingId) {
        Optional<Meeting> meeting = meetingRepository.findById(meetingId);
        if (meeting.isEmpty())
            throw new MeetingNotFoundException(Constant.MEETING_NOT_FOUND);
        Meeting meetingData = meeting.get();

        List<Agenda> meetingList = agendaRepository.findAllByMeeting(meetingData);

        ResponseMessage<List<AgendaResponseDTO>> responseMessage =
                new ResponseMessage<List<AgendaResponseDTO>>(HttpStatus.OK, Constant.AGENDA_DISPLAY_SUCCESS, meetingList.stream()
                        .map(x->mapper.toDTO(x))
                        .collect(Collectors.toList()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }
}
