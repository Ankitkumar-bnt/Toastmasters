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

    Optional<Grammarian> findByUser_UserIdAndMeeting_MeetingId(int userId, int meetingId);

    @Transactional
    void deleteByUser_UserIdAndMeeting_MeetingId(int userId, int meetingId);

    List<Grammarian> findAllByMeeting(Meeting meeting);
}

