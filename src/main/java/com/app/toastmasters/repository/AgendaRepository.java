package com.app.toastmasters.repository;

import com.app.toastmasters.entity.Agenda;
import com.app.toastmasters.entity.Meeting;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgendaRepository extends JpaRepository<Agenda, Integer> {
    @Transactional
    void deleteALLByMeeting(Meeting meetingData);

    List<Agenda> findAllByMeeting(Meeting meetingData);
}
