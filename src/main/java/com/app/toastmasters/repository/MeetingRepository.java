package com.app.toastmasters.repository;

import com.app.toastmasters.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeetingRepository extends JpaRepository<Meeting, Integer> {
    List<Meeting> findByDeleteStatus(int deleteStatus);
}
