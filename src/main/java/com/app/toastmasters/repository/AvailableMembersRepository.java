package com.app.toastmasters.repository;

import com.app.toastmasters.entity.AvailableMembers;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvailableMembersRepository extends JpaRepository<AvailableMembers, Integer> {
    AvailableMembers findByUserAndMeeting(User user, Meeting meeting);
}
