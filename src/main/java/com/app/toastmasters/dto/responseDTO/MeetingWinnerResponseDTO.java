package com.app.toastmasters.dto.responseDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MeetingWinnerResponseDTO {
    private int meetingWinnersId;
    private String description;
    private int userId;
    private int meetingId;
}
