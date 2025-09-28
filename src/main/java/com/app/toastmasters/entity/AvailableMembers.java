package com.app.toastmasters.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;


@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AvailableMembers {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int availableMemberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    private int status = -1; // 1:Available, 0:Unavailable, -1:Unseen, 2:Tentative

    private LocalDate date;

}

