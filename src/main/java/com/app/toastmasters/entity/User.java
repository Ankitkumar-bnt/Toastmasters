package com.app.toastmasters.entity;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;

    @Column(nullable = false)
    private String userName;

    @Column(nullable = false, unique = true)
    private String userEmail;

    @Column(nullable = false, unique = true, length = 10)
    private String userContact;

    private String userPassword;

    private LocalDate joinDate = LocalDate.now();

    private String active = "false";

    private String address;

    @Column(nullable = false)
    private String gender;
    
    @Column(nullable = false)
    private LocalDate dob;

    private Integer deleteStatus = 1;

    private String hobbies;
    
    private String userType = "user";

    private Integer mentorId;
}
