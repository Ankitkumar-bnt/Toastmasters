package com.app.toastmasters.services;

import com.app.toastmasters.entity.Agenda;
import com.app.toastmasters.entity.AgendaJoin;
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
    private final GrammarianRepository grammarian;
    private final AbbreviationRepository abbreviations;
    private final UserRepository userRepository;
    private final MeetingRepository meetingRepository;

    public AgendaJoinServiceImpl(AgendaStaticInfoRepository agendaStaticInfo, ClubOfficersRepository clubOfficers, AgendaRepository agenda, SpeakerSpeechRepository speakerSpeech, GrammarianRepository grammarian, AbbreviationRepository abbreviations, UserRepository userRepository, MeetingRepository meetingRepository) {
        this.agendaStaticInfo = agendaStaticInfo;
        this.clubOfficers = clubOfficers;
        this.agenda = agenda;
        this.speakerSpeech = speakerSpeech;
        this.grammarian = grammarian;
        this.abbreviations = abbreviations;
        this.userRepository = userRepository;
        this.meetingRepository = meetingRepository;
    }

    @Override
    public ResponseEntity<ResponseMessage<AgendaJoinDTO>> getAgenda(int userId, int meetingId) {

        Optional<User> user = userRepository.findById(userId);
        User userData = user.get();

        Optional<Meeting> meeting = meetingRepository.findById(meetingId);
        Meeting meetingData = meeting.get();

        List<AgendaStaticInfo> staticInfo = agendaStaticInfo.findAll();

        List<ClubOfficers> clubOfficer = clubOfficers.findAll();

        List<Agenda> agendaList = agenda.findAllByMeeting(meetingData);

        List<SpeakerSpeech> speakerSpeeches = speakerSpeech.findAllByUserAndMeeting(userData, meetingData);

        List<Grammarian> grammarians = grammarian.findAllByUserIdAndMeetingId(userData, meetingData);

        List<Abbreviations> abbreviationsList = abbreviations.findAll();

        AgendaJoinDTO AgendaJoinDTO = new AgendaJoinDTO();
        AgendaJoinDTO.setAgendaStaticInfo(staticInfo);
        AgendaJoinDTO.setClubOfficers(clubOfficer);
        AgendaJoinDTO.setAgenda(agendaList);
        AgendaJoinDTO.setSpeakerSpeech(speakerSpeeches);
        AgendaJoinDTO.setGrammarian(grammarians);
        AgendaJoinDTO.setAbbreviations(abbreviationsList);

        ResponseMessage<AgendaJoinDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK,"",AgendaJoinDTO);
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }
}
