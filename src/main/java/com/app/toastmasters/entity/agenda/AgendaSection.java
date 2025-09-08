package com.app.toastmasters.entity.agenda;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AgendaSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int sectionId;
    private String sectionName;
}
