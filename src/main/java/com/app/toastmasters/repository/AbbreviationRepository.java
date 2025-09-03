package com.app.toastmasters.repository;

import com.app.toastmasters.entity.agenda.Abbreviations;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AbbreviationRepository extends JpaRepository<Abbreviations, Integer> {
    Optional<Abbreviations> findByAbbreviation(String abbreviation);
}
