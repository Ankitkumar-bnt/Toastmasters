package com.app.toastmasters.dto.responseDTO;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SpeakerSpeechResponseDTO {
    private int speechId;
    private String pathwaysTrack;
    private String level;
    private String projectNo;
    private String maxSpeechTime;
    private String minSpeechTime;
    private String title;
    private String objective;
    private LocalDateTime speechCreatedDate;
    private int userId;
    private int meetingId;
}
