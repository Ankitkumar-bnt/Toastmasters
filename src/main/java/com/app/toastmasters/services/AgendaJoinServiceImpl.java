package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.entity.Agenda;
import com.app.toastmasters.entity.AgendaJoinDTO;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.entity.agenda.*;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    public AgendaJoinServiceImpl(AgendaStaticInfoRepository agendaStaticInfo, ClubOfficersRepository clubOfficers, AgendaRepository agenda, SpeakerSpeechRepository speakerSpeech, GrammarianRepository grammarianRepo, AbbreviationRepository abbreviations, UserRepository userRepository, MeetingRepository meetingRepository) {
        this.agendaStaticInfo = agendaStaticInfo;
        this.clubOfficers = clubOfficers;
        this.agenda = agenda;
        this.speakerSpeech = speakerSpeech;
        this.grammarianRepo = grammarianRepo;
        this.abbreviations = abbreviations;
        this.userRepository = userRepository;
        this.meetingRepository = meetingRepository;
    }

    @Override
    public ResponseEntity<ResponseMessage<AgendaJoinDTO>> getAgenda(int speakerId, int grammarianId, int meetingId) {

        Optional<User> speaker = userRepository.findById(speakerId);
        User speakerData = speaker.get();

        Optional<User> grammarian = userRepository.findById(grammarianId);
        User grammarianData = grammarian.get();

        Optional<Meeting> meeting = meetingRepository.findById(meetingId);
        Meeting meetingData = meeting.get();

        List<AgendaStaticInfo> staticInfo = agendaStaticInfo.findAll();

        List<ClubOfficers> clubOfficer = clubOfficers.findAll();

        List<Agenda> agendaList = agenda.findAllByMeeting(meetingData);

        List<SpeakerSpeech> speakerSpeeches = speakerSpeech.findAllByUserAndMeeting(speakerData, meetingData);

        List<Grammarian> grammarians = grammarianRepo.findAllByUserIdAndMeetingId(grammarianData, meetingData);

        List<Abbreviations> abbreviationsList = abbreviations.findAll();

        AgendaJoinDTO agendaJoinDTO = new AgendaJoinDTO();
        agendaJoinDTO.setAgendaStaticInfo(staticInfo);
        agendaJoinDTO.setClubOfficers(clubOfficer);
        agendaJoinDTO.setAgenda(agendaList);
        agendaJoinDTO.setSpeakerSpeech(speakerSpeeches);
        agendaJoinDTO.setGrammarian(grammarians);
        agendaJoinDTO.setAbbreviations(abbreviationsList);

        ResponseMessage<AgendaJoinDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.AGENDA_DISPLAY_SUCCESS, agendaJoinDTO);
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }
}
