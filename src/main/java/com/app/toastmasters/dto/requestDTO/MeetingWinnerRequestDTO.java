package com.app.toastmasters.dto.requestDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MeetingWinnerRequestDTO {
    private String description;
    private int userId;
    private int meetingId;
}
