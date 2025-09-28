package com.app.toastmasters.dto.responseDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GuestResponseDto {

    private int userId;
    private String userName;
    private String userEmail;
    private String userContact;
    private String gender;
    private LocalDate dob;
    private String userType;
    private Integer deleteStatus;
}
