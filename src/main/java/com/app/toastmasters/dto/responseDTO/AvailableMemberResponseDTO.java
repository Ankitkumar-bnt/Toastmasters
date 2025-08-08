package com.app.toastmasters.dto.responseDTO;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AvailableMemberResponseDTO {
    private int availableMemberId;
    private int userId;
    private int meetingId;
    private int status;
    private LocalDate date;
}
