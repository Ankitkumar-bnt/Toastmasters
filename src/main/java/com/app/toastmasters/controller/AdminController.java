package com.app.toastmasters.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.app.toastmasters.dto.requestDTO.UserRequestDTO;
import com.app.toastmasters.dto.responseDTO.UserResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.UserService;

import jakarta.validation.Valid;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/user")
public class AdminController {
	
	private final UserService userService;
	
	public AdminController(UserService userService) {
		this.userService = userService;
	}

	@PostMapping("/addMember")
	public ResponseEntity<ResponseMessage<UserResponseDTO>> addMember(@Valid @RequestBody UserRequestDTO userRequestDTO)
	{
		return userService.addMember(userRequestDTO);
	}

	@GetMapping("/getAllMembers")
	public ResponseEntity<ResponseMessage<List<UserResponseDTO>>> getAllMembers()
	{
		return userService.getAllMember();
	}

	@PatchMapping("/updateMember/{userId}")
	public ResponseEntity<ResponseMessage<UserResponseDTO>> updateMember(@PathVariable Integer userId, @Valid @RequestBody UserRequestDTO userRequestDTO)
	{
		return userService.updateMember(userId, userRequestDTO);
	}

	@DeleteMapping("/deleteMember/{userId}")
	public ResponseEntity<ResponseMessage<UserResponseDTO>> deleteMember(@PathVariable Integer userId)
	{
		return userService.deleteMember(userId);
	}
}
