package com.app.toastmasters.repository;

import com.app.toastmasters.entity.*;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;

@Repository
public interface AssignedRoleRepository extends JpaRepository<AssignedRole, Integer> {

    AssignedRole findByUserAndRoleAndMeeting(User user, Roles roles, Meeting meeting);

    @Query("SELECT pr.role.roleId FROM AssignedRole pr WHERE pr.user = :user AND pr.meeting = :meeting")
    List<Integer> findRoleIdsByUserAndMeeting(@Param("user") User user, @Param("meeting") Meeting meeting);

    @Transactional
    void deleteByUserAndMeetingAndRole(User user, Meeting meeting, Roles role);

    @Transactional
    void deleteAllByUserAndMeeting(User userData, Meeting meetingData);

    List<AssignedRole> findByUser(User userData);
}
