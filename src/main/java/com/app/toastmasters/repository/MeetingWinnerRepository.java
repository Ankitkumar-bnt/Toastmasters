package com.app.toastmasters.repository;

import com.app.toastmasters.entity.MeetingWinners;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingWinnerRepository extends JpaRepository<MeetingWinners, Integer> {

    List<MeetingWinners> findByUser_UserId(int userId);

    List<MeetingWinners> findByMeeting_MeetingId(int meetingId);

    MeetingWinners findByUser_UserIdAndMeeting_MeetingId(int userId, int meetingId);

    void deleteByUser_UserIdAndMeeting_MeetingId(int userId, int meetingId);
}
