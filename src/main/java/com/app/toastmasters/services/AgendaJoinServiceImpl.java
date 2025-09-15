package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.responseDTO.MeetingResponseDTO;
import com.app.toastmasters.entity.Agenda;
import com.app.toastmasters.dto.responseDTO.AgendaJoinDTO;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.entity.agenda.*;
import com.app.toastmasters.exceptions.EmptyObjectException;
import com.app.toastmasters.mapper.*;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AgendaJoinServiceImpl implements AgendaJoinService{

    private final AgendaStaticInfoRepository agendaStaticInfo;
    private final ClubOfficersRepository clubOfficers;
    private final AgendaRepository agenda;
    private final SpeakerSpeechRepository speakerSpeech;
    private final GrammarianRepository grammarianRepo;
    private final AbbreviationRepository abbreviations;
    private final UserRepository userRepository;
    private final MeetingRepository meetingRepository;

    private final AgendaStaticInfoMapper staticInfoMapper;
    private final ClubOfficersMapper officersMapper;
    private final AgendaMapper agendaMapper;
    private final SpeakerSpeechMapper speechMapper;
    private final GrammarianMapper grammarianMapper;
    private final AbbreviationsMapper abbreviationsMapper;
    private final MeetingMapper meetingMapper;

    public AgendaJoinServiceImpl(AgendaStaticInfoRepository agendaStaticInfo, ClubOfficersRepository clubOfficers, AgendaRepository agenda, SpeakerSpeechRepository speakerSpeech, GrammarianRepository grammarianRepo, AbbreviationRepository abbreviations, UserRepository userRepository, MeetingRepository meetingRepository, AgendaStaticInfoMapper staticInfoMapper, ClubOfficersMapper officersMapper, AgendaMapper agendaMapper, SpeakerSpeechMapper speechMapper, GrammarianMapper grammarianMapper, AbbreviationsMapper abbreviationsMapper, MeetingMapper meetingMapper) {
        this.agendaStaticInfo = agendaStaticInfo;
        this.clubOfficers = clubOfficers;
        this.agenda = agenda;
        this.speakerSpeech = speakerSpeech;
        this.grammarianRepo = grammarianRepo;
        this.abbreviations = abbreviations;
        this.userRepository = userRepository;
        this.meetingRepository = meetingRepository;
        this.staticInfoMapper = staticInfoMapper;
        this.officersMapper = officersMapper;
        this.agendaMapper = agendaMapper;
        this.speechMapper = speechMapper;
        this.grammarianMapper = grammarianMapper;
        this.abbreviationsMapper = abbreviationsMapper;
        this.meetingMapper = meetingMapper;
    }

    @Override
    public ResponseEntity<ResponseMessage<AgendaJoinDTO>> getAgenda(int meetingId) {

        Optional<Meeting> meeting = meetingRepository.findById(meetingId);
        Meeting meetingData = meeting.get();

        List<AgendaStaticInfo> staticInfo = agendaStaticInfo.findAll();

        List<ClubOfficers> clubOfficer = clubOfficers.findAll();

        List<Agenda> agendaList = agenda.findAllByMeeting(meetingData);

        List<SpeakerSpeech> speakerSpeeches = speakerSpeech.findAllByMeeting(meetingData);

        List<Grammarian> grammarians = grammarianRepo.findAllByMeeting(meetingData);

        List<Abbreviations> abbreviationsList = abbreviations.findAll();

        AgendaJoinDTO agendaJoinDTO = new AgendaJoinDTO();

        agendaJoinDTO.setAgendaStaticInfo(staticInfo.stream()
                .map(x->staticInfoMapper.toResponseDTO(x)).collect(Collectors.toList()));
        agendaJoinDTO.setClubOfficers(clubOfficer.stream()
                .map(x->officersMapper.toResponseDTO(x)).collect(Collectors.toList()));
        agendaJoinDTO.setAgenda(agendaList.stream()
                .map(x->agendaMapper.toDTO(x)).collect(Collectors.toList()));
        agendaJoinDTO.setSpeakerSpeech(speakerSpeeches.stream()
                .map(x->speechMapper.toDTO(x)).collect(Collectors.toList()));
        agendaJoinDTO.setGrammarian(grammarians.stream()
                .map(x->grammarianMapper.toResponseDTO(x)).collect(Collectors.toList()));
        agendaJoinDTO.setAbbreviations(abbreviationsList.stream()
                .map(x->abbreviationsMapper.toResponseDTO(x)).collect(Collectors.toList()));

        ResponseMessage<AgendaJoinDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.AGENDA_DISPLAY_SUCCESS, agendaJoinDTO);
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<MeetingResponseDTO>> isAgendaPublished(int meetingId, String status) {
        Optional<Meeting> meeting = meetingRepository.findById(meetingId);

        if(meeting.isEmpty())
            throw new EmptyObjectException(Constant.EMPTY_OBJECT);

        Meeting meetingData = meeting.get();
        if(status.equalsIgnoreCase("published"))
            meetingData.setPublished(true);
        else
            meetingData.setPublished(false);

        Meeting meetingPublished = meetingRepository.save(meetingData);

        ResponseMessage<MeetingResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.CREATED, Constant.AGENDA_IS_PUBLISHED
                        ,meetingMapper.toDTO(meetingPublished));
        return ResponseEntity.status(HttpStatus.CREATED).body(responseMessage);
    }
}
