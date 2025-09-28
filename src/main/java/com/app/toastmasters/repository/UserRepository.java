package com.app.toastmasters.repository;

import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.app.toastmasters.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    @Modifying
    @Transactional
    @Query("update User u set u.deleteStatus = 0 where u.userId = :id")
    int deleteMemberById(@Param("id") Integer userId);

    List<User> findByDeleteStatus(int deleteStatus);

    List<User> findByUserTypeNot(String guest);

    List<User> findByUserType(String guest);
}
