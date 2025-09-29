package com.app.toastmasters.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class Backouts {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int backoutId;
    private int userId;
    private int meetingId;
}
