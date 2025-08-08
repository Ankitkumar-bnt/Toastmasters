package com.app.toastmasters.dto.responseDTO;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class UserResponseDTO {

    private int userId;
    private String userName;
    private String userEmail;
    private String userContact;
    private String userPassword;
    private LocalDate joinDate;
    private String active;
    private String address;
    private String gender;
    private LocalDate dob;
    private String userType;
    private Integer deleteStatus;
    private String hobbies;
    private Integer mentorId;
}
