package com.app.toastmasters.dto.requestDTO;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class MeetingRequestDTO {
    private LocalDate meetingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String meetingTheme;
    private String meetingLocation;
    private String category;
    private int deleteStatus;
    private boolean isPublished;
}
