package com.app.toastmasters.controller;

import com.app.toastmasters.dto.responseDTO.GuestResponseDto;
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
	public ResponseEntity<ResponseMessage<List<UserResponseDTO>>> getAllMembers() {
        return userService.getAllMember();
	}

	@GetMapping("/getUserById/{userId}")
	public ResponseEntity<ResponseMessage<UserResponseDTO>> getUserById(@PathVariable int userId){
		return userService.getUserById(userId);
	}

    @GetMapping("/getAllGuest")
    public ResponseEntity<ResponseMessage<List<GuestResponseDto>>> getAllGuest(){
        return userService.getAllGuest();
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
