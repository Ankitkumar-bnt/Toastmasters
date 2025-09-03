package com.app.toastmasters.entity;

import com.app.toastmasters.entity.agenda.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AgendaJoinDTO {

    private List<AgendaStaticInfo> agendaStaticInfo;//remain same

    private List<ClubOfficers> clubOfficers;//remain same

    private List<Agenda> agenda;//meetingId

    private List<SpeakerSpeech> speakerSpeech;//userId meetingId

    private List<Grammarian> grammarian;//userId meetingId

    private List<Abbreviations> abbreviations;//remain same
}
