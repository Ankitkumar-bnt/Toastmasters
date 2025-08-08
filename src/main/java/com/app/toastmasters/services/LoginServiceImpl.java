package com.app.toastmasters.services;

import org.springframework.stereotype.Service;

import com.app.toastmasters.entity.User;
import com.app.toastmasters.repository.LoginRepository;

@Service
public class LoginServiceImpl implements LoginService{

	private final LoginRepository loginRepo;
	
	public LoginServiceImpl(LoginRepository loginRepo) {
		this.loginRepo = loginRepo;
	}

	@Override
	public boolean isLogin(String userEmail, String password) {
		
		User byUserEmailAndUserPassword = loginRepo.findByUserEmailAndUserPassword(userEmail, password);
		return byUserEmailAndUserPassword != null;
	}
}
