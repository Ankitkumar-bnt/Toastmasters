package com.app.toastmasters.repository;

import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.entity.agenda.Grammarian;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GrammarianRepository extends JpaRepository<Grammarian, Integer> {

    List<Grammarian> findAllByMeeting(Meeting meeting);

    List<Grammarian> findByMeeting(Meeting meeting);

    List<Grammarian> findByMeeting_MeetingId(int meetingId);

    @Transactional
    void deleteAllByMeeting_MeetingId(int meetingId);
}

