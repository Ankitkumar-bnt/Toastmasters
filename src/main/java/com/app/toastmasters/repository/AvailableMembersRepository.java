package com.app.toastmasters.repository;

import com.app.toastmasters.entity.AvailableMembers;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvailableMembersRepository extends JpaRepository<AvailableMembers, Integer> {
    AvailableMembers findByUserAndMeeting(User user, Meeting meeting);

    List<AvailableMembers> findAllByUser(User userId);
}
