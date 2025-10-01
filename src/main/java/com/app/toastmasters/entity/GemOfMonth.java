package com.app.toastmasters.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GemOfMonth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int gemId;
    private LocalDate month;
    private int userId;
    private String userName;
    private int dayCount;
}
