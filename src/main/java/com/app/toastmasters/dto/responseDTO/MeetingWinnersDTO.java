package com.app.toastmasters.dto.responseDTO;

import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MeetingWinnersDTO {

    private String description;
    private User user;
    private Meeting meeting;
}
