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
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class AgendaStaticInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int infoId;
    private String infoKey;
    private String infoValue;
}
