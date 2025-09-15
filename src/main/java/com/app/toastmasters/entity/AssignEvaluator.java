package com.app.toastmasters.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AssignEvaluator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int speakerId;

    private int evaluatorId;

    private int meetingId;
}
