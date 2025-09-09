package com.app.toastmasters.entity.agenda;

import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SpeakerSpeech {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int speechId;
    @Column(nullable = false)
    private String pathwaysTrack;
    @Column(nullable = false)
    private String level;
    @Column(nullable = false)
    private String projectNo;
    @Column(nullable = false)
    private String maxSpeechTime;
    @Column(nullable = false)
    private String minSpeechTime;
    @Column(nullable = false)
    private String title;
    private String objective;
    private LocalDateTime speechCreatedDate = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

}
