package com.app.toastmasters.repository;

import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.PreferredRole;
import com.app.toastmasters.entity.Roles;
import com.app.toastmasters.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface PreferredRoleRepository extends JpaRepository<PreferredRole, Integer> {

    PreferredRole findByUserAndRoleAndMeeting(User user, Roles roles, Meeting meeting);

    @Query("SELECT pr.role.roleId FROM PreferredRole pr WHERE pr.user = :user AND pr.meeting = :meeting")
    List<Integer> findRoleIdsByUserAndMeeting(@Param("user") User user, @Param("meeting") Meeting meeting);

    @Transactional
    void deleteByUserAndMeetingAndRole(User user, Meeting meeting, Roles role);

    @Transactional
    void deleteAllByUserAndMeeting(User userData, Meeting meetingData);
}
