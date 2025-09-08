package com.app.toastmasters.dto.requestDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AgendaRequestDTO {
    private String minTime;
    private String avgTime;
    private String maxTime;
    private String activity;
    private int userId;
    private int meetingId;
    private int sectionId;
}
