package com.app.toastmasters.repository;

import com.app.toastmasters.entity.AvailableMembers;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AvailableMembersRepository extends JpaRepository<AvailableMembers, Integer> {
    AvailableMembers findByUserAndMeeting(User user, Meeting meeting);

    List<AvailableMembers> findAllByUser(User userId);

    @Query(value = "SELECT t.month, t.user_id, t.total_points FROM (SELECT DATE_FORMAT(date, '%Y-%m') AS month, user_id, COUNT(*) AS total_points, RANK() OVER (PARTITION BY DATE_FORMAT(date, '%Y-%m') ORDER BY COUNT(*) DESC) AS rnk FROM available_members WHERE status = 1 GROUP BY month, user_id) t WHERE t.rnk = 1",
            nativeQuery = true)
    List<Object[]> findGemOfTheMonth();

    List<AvailableMembers> findAllByMeeting_MeetingId(int meetingId);

    List<AvailableMembers> findByDateBetween(LocalDate startDate, LocalDate endDate);
}
