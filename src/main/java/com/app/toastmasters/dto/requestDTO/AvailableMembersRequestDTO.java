package com.app.toastmasters.dto.requestDTO;

import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AvailableMembersRequestDTO {

    private User user;
    private Meeting meetingId;
    private int status = -1; // 1:Available, 0:Unavailable, -1:Unseen, 2:Tentative
    private LocalDate date;
}
