package com.app.toastmasters.repository;

import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.MeetingRole;
import com.app.toastmasters.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingRoleRepository extends JpaRepository<MeetingRole, Integer> {

    @Transactional
    void deleteAllByMeeting(Meeting meetingData);

    List<MeetingRole> findAllByMeeting(Meeting meetingData);
}
