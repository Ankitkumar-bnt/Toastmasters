package com.app.toastmasters.entity;

import com.app.toastmasters.entity.agenda.AgendaSection;
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
public class Agenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int agendaId;
    private String minTime;
    private String avgTime;
    private String maxTime;
    private String activity;
    private LocalDateTime agendaCreatedDate = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @ManyToOne
    @JoinColumn(name = "section_id", nullable = false)
    private AgendaSection agendaSection;
}
