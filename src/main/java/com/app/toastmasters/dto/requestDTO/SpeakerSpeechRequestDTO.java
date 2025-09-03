package com.app.toastmasters.dto.requestDTO;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SpeakerSpeechRequestDTO {
    private String pathwaysTrack;
    private int level;
    private int projectNo;
    private int maxSpeechTime;
    private int minSpeechTime;
    private String title;
    private String objective;
    private int userId;
    private int meetingId;
}
