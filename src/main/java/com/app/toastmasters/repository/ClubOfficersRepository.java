package com.app.toastmasters.repository;

import com.app.toastmasters.entity.agenda.ClubOfficers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClubOfficersRepository extends JpaRepository<ClubOfficers, Integer> {
}
