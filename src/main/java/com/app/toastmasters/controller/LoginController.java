package com.app.toastmasters.controller;

import com.app.toastmasters.dto.requestDTO.UserRequestDTO;
import com.app.toastmasters.dto.responseDTO.UserResponseDTO;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.app.toastmasters.services.LoginService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/loginUser")
public class LoginController {

	private final LoginService loginServe;
	
	public LoginController(LoginService loginServe) {
		this.loginServe = loginServe;
	}


	@PostMapping("/login")
	public ResponseEntity<ResponseMessage<User>> isLogin(@RequestParam String userEmail, @RequestParam String password)
	{
		return loginServe.isLogin(userEmail, password);
	}

	@PostMapping("/logout/{userId}")
	public ResponseEntity<ResponseMessage<UserResponseDTO>> isLoggedOut(
			@RequestBody UserRequestDTO userRequestDTO, @PathVariable int userId){

		return loginServe.isLoggedOut(userRequestDTO, userId);
	}
}
