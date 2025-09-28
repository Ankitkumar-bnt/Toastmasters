package com.app.toastmasters.dto.requestDTO;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserRequestDTO {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    @Pattern(regexp = "^[A-Za-z ]+$", message = "Name can contain only letters and spaces")
    private String userName;

    @NotBlank(message = "Email is required")
    @Pattern(
            regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$",
            message = "Invalid email format"
    )
    private String userEmail;

    @NotBlank(message = "Contact is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Contact number must be exactly 10 digits")
    private String userContact;

    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String userPassword;

    @Size(max = 255, message = "Address cannot exceed 255 characters")
    private String address;

    @NotBlank(message = "Gender is required")
    @Pattern(regexp = "^(Male|Female|Other)$", message = "Gender must be Male, Female, or Other")
    private String gender;

    @Past(message = "Date of Birth must be in the past")
    private LocalDate dob;

    private Integer deleteStatus;

    @Pattern(
            regexp = "^(admin|user|guest)$",
            message = "User type must be admin, user, or guest"
    )
    private String userType;

    @Size(max = 255, message = "Hobbies cannot exceed 255 characters")
    private String hobbies;

    private Integer mentorId;
}
