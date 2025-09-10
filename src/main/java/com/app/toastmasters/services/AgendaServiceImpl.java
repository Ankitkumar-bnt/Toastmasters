package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.requestDTO.AgendaRequestDTO;
import com.app.toastmasters.dto.responseDTO.AgendaResponseDTO;
import com.app.toastmasters.entity.Agenda;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.exceptions.EmptyListException;
import com.app.toastmasters.exceptions.MeetingNotFoundException;
import com.app.toastmasters.mapper.AgendaMapper;
import com.app.toastmasters.repository.AgendaRepository;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.MeetingRepository;
import com.app.toastmasters.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AgendaServiceImpl implements AgendaService{

    private final AgendaRepository agendaRepository;
    private final MeetingRepository meetingRepository;
    private final AgendaMapper mapper;
    private final UserRepository userRepository;

    public AgendaServiceImpl(AgendaRepository agendaRepository, MeetingRepository meetingRepository, AgendaMapper mapper, UserRepository userRepository) {
        this.agendaRepository = agendaRepository;
        this.meetingRepository = meetingRepository;
        this.mapper = mapper;
        this.userRepository = userRepository;
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

    @Override
    public ResponseEntity<ResponseMessage<List<AgendaResponseDTO>>> copyAgendaByMeeting(int fromMeetingId, int toMeetingId) {
        Optional<Meeting> fromMeeting = meetingRepository.findById(fromMeetingId);
        if (fromMeeting.isEmpty())
            throw new MeetingNotFoundException(Constant.MEETING_NOT_FOUND);
        Meeting fromMeetingData = fromMeeting.get();

        Optional<Meeting> toMeeting = meetingRepository.findById(toMeetingId);
        if (toMeeting.isEmpty())
            throw new MeetingNotFoundException(Constant.MEETING_NOT_FOUND);
        Meeting toMeetingData = toMeeting.get();

        agendaRepository.deleteALLByMeeting(toMeetingData);

        Optional<User> user = userRepository.findById(2);
        User userData = user.get();

        List<Agenda> meetingList = agendaRepository.findAllByMeeting(fromMeetingData);
        List<Agenda> meetingListSave = new ArrayList<>();
        for(Agenda agenda: meetingList){
            Agenda newAgenda = new Agenda();

            newAgenda.setActivity(agenda.getActivity());
            newAgenda.setAgendaCreatedDate(LocalDateTime.now());
            newAgenda.setAvgTime(agenda.getAvgTime());
            newAgenda.setMinTime(agenda.getMinTime());
            newAgenda.setMaxTime(agenda.getMaxTime());
            newAgenda.setAgendaSection(agenda.getAgendaSection());
            newAgenda.setMeeting(toMeetingData);
            newAgenda.setUser(userData);

            meetingListSave.add(newAgenda);
        }
        List<Agenda> agendaList = agendaRepository.saveAll(meetingListSave);

        ResponseMessage<List<AgendaResponseDTO>> responseMessage =
                new ResponseMessage<List<AgendaResponseDTO>>(HttpStatus.OK,
                        Constant.AGENDA_ROWS_ADDED_SUCCESS, agendaList.stream()
                        .map(x->mapper.toDTO(x)).collect(Collectors.toList()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }
}
