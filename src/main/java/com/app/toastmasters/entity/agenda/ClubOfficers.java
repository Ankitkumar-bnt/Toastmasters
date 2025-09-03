package com.app.toastmasters.entity.agenda;

import com.app.toastmasters.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClubOfficers {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int officerId;
    private String leadershipName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
