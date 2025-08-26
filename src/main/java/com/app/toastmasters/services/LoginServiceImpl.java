package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.requestDTO.UserRequestDTO;
import com.app.toastmasters.dto.responseDTO.UserResponseDTO;
import com.app.toastmasters.exceptions.AuthenticationFailedException;
import com.app.toastmasters.mapper.UserMapper;
import com.app.toastmasters.message.ResponseMessage;
import org.apache.tomcat.websocket.AuthenticationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.app.toastmasters.entity.User;
import com.app.toastmasters.repository.LoginRepository;

@Service
public class LoginServiceImpl implements LoginService{

	private final LoginRepository loginRepo;
	private final UserMapper mapper;
	
	public LoginServiceImpl(LoginRepository loginRepo, UserMapper mapper) {
		this.loginRepo = loginRepo;
		this.mapper = mapper;
	}

	@Override
	public ResponseEntity<ResponseMessage<User>> isLogin(String userEmail, String password) {
		
		User loginUser = loginRepo.findByUserEmailAndUserPassword(userEmail, password);
		if(loginUser == null)
			throw new AuthenticationFailedException(Constant.USER_LOGIN_FAILED);

		loginUser.setActive("true");
		User userStatusTrue = loginRepo.save(loginUser);
		if(userStatusTrue == null)
			throw new AuthenticationFailedException(Constant.USER_STATUS_UPDATE_FAILED);

		ResponseMessage<User> responseMessage =
				new ResponseMessage<>(HttpStatus.OK, Constant.USER_LOGIN_SUCCESS, loginUser);
		return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
	}

	@Override
	public ResponseEntity<ResponseMessage<UserResponseDTO>> isLoggedOut(UserRequestDTO userRequestDTO, int userId) {
		User user = mapper.toEntity(userRequestDTO);
		user.setUserId(userId);
		user.setActive("false");
		User userStatusFalse = loginRepo.save(user);
		if(userStatusFalse == null)
			throw new AuthenticationFailedException(Constant.USER_LOGOUT_FAILED) ;
		ResponseMessage<UserResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.USER_LOGIN_SUCCESS, mapper.toResponseDTO(user));
		return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
	}
}
