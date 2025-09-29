package com.app.toastmasters.repository;

import com.app.toastmasters.entity.Backouts;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BackoutRepository extends JpaRepository<Backouts, Integer> {
    List<Backouts> findAllByUserId(int userId);

    Backouts findByUserId(int userId);

    @Transactional
    void deleteByUserIdAndMeetingId(Integer userId, Integer meetingId);

    List<Backouts> findAllByMeetingId(int meetingId);
}
