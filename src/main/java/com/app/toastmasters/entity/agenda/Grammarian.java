package com.app.toastmasters.entity.agenda;

import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Grammarian {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int grammarianId;

    private String word;
    private String meaning;
    private String example;
    private String wordType;

    private LocalDateTime localDateTime = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;
}
