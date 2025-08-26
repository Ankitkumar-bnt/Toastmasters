package com.app.toastmasters.services;

import com.app.toastmasters.dto.requestDTO.UserRequestDTO;
import com.app.toastmasters.dto.responseDTO.UserResponseDTO;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public interface LoginService {

	ResponseEntity<ResponseMessage<User>> isLogin(String userEmail, String password);

	ResponseEntity<ResponseMessage<UserResponseDTO>> isLoggedOut(UserRequestDTO userRequestDTO, int userId);
}
