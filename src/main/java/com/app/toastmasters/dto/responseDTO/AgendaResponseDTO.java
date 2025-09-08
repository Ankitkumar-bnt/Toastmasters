package com.app.toastmasters.dto.responseDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AgendaResponseDTO {
    private int agendaId;
    private String minTime;
    private String avgTime;
    private String maxTime;
    private String activity;
    private LocalDateTime agendaCreatedDate;
    private int userId;
    private int meetingId;
    private int sectionId;
}
