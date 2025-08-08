package com.app.toastmasters.services;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.app.toastmasters.dto.requestDTO.UserRequestDTO;
import com.app.toastmasters.dto.responseDTO.UserResponseDTO;
import com.app.toastmasters.message.ResponseMessage;

import java.util.List;

@Service
public interface UserService {

	ResponseEntity<ResponseMessage<UserResponseDTO>> addMember(UserRequestDTO userRequestDTO);

	ResponseEntity<ResponseMessage<List<UserResponseDTO>>> getAllMember();

    ResponseEntity<ResponseMessage<UserResponseDTO>> updateMember(Integer userId, @Valid UserRequestDTO userRequestDTO);

	ResponseEntity<ResponseMessage<UserResponseDTO>> deleteMember(Integer userId);
}
