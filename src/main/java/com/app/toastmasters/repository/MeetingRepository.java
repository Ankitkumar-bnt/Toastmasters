package com.app.toastmasters.repository;

import com.app.toastmasters.entity.AvailableMembers;
import com.app.toastmasters.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Integer> {
    List<Meeting> findByDeleteStatus(int deleteStatus);

    Optional<Meeting> findByMeetingTheme(String meetingTheme);

    List<Meeting> findByMeetingDateGreaterThanEqual(LocalDate now);
}
