package com.app.toastmasters.repository;

import com.app.toastmasters.entity.AvailableMembers;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvailableMembersRepository extends JpaRepository<AvailableMembers, Integer> {
}
