package com.app.toastmasters.repository;

import com.app.toastmasters.entity.agenda.AgendaSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgendaSectionRepository extends JpaRepository<AgendaSection, Integer> {
}
