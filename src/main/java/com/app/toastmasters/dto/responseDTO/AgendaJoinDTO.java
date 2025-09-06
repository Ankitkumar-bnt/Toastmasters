package com.app.toastmasters.dto.responseDTO;

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

    private List<AgendaStaticInfoResponseDTO> agendaStaticInfo;//remain same

    private List<ClubOfficersResponseDTO> clubOfficers;//remain same

    private List<AgendaResponseDTO> agenda;//meetingId

    private List<SpeakerSpeechResponseDTO> speakerSpeech;//userId meetingId

    private List<GrammarianResponseDTO> grammarian;//userId meetingId

    private List<AbbreviationsResponseDTO> abbreviations;//remain same
}
