package com.app.toastmasters.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.toastmasters.services.LoginService;

@RestController
@RequestMapping("/login")
public class LoginController {

	private final LoginService loginServe;
	
	public LoginController(LoginService loginServe) {
		this.loginServe = loginServe;
	}


	@PostMapping("/")
	public boolean isLogin(@RequestParam String userEmail, @RequestParam String password)
	{
		return loginServe.isLogin(userEmail, password);
	}
}
