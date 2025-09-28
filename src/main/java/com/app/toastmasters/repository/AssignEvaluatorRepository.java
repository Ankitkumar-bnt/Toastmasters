package com.app.toastmasters.repository;

import com.app.toastmasters.entity.AssignEvaluator;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;

public interface AssignEvaluatorRepository extends JpaRepository<AssignEvaluator, Integer> {
    List<AssignEvaluator> findAllByMeetingId(int meetingId);

    void deleteAllByMeetingId(int meetingId);


    List<AssignEvaluator> findAllByMeetingIdAndSpeakerId(int meetingId, int speakerId);

    List<AssignEvaluator> findAllByMeetingIdAndEvaluatorId(int meetingId, int evaluatorId);

    AssignEvaluator findByEvaluatorIdAndMeetingIdAndSpeakerId(int evaluatorId, int meetingId, int speakerId);

    @Modifying
    @Transactional
    void deleteByEvaluatorIdAndMeetingIdAndSpeakerId(int evaluatorId, int meetingId, int speakerId);
}
