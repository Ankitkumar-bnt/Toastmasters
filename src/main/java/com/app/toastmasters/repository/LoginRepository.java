package com.app.toastmasters.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.app.toastmasters.entity.User;

@Repository
public interface LoginRepository extends JpaRepository<User, Integer>{
	
		public User findByUserEmailAndUserPassword(String userEmail, String password);
}
