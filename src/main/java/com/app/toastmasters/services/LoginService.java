package com.app.toastmasters.services;

import org.springframework.stereotype.Service;

@Service
public interface LoginService {

	boolean isLogin(String userEmail, String password);
}
