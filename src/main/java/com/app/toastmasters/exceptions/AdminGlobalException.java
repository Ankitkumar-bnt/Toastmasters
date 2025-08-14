package com.app.toastmasters.exceptions;

import com.app.toastmasters.dto.responseDTO.MeetingResponseDTO;
import com.app.toastmasters.dto.responseDTO.PreferredRoleResponseDTO;
import com.app.toastmasters.dto.responseDTO.RoleResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.app.toastmasters.dto.responseDTO.UserResponseDTO;
import com.app.toastmasters.message.ResponseMessage;

@RestControllerAdvice
public class AdminGlobalException {

	@ExceptionHandler(MemberNotAddedException.class)
	public ResponseEntity<ResponseMessage<UserResponseDTO>> handleMemberNotSavedException(MemberNotAddedException ex) {
		ResponseMessage<UserResponseDTO> errorResponse =
                new ResponseMessage<>(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), null);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
	}
	
	@ExceptionHandler(MemberNotFoundException.class)
	public ResponseEntity<ResponseMessage<UserResponseDTO>> handleMembersNotFoundException(MemberNotFoundException ex) {
		ResponseMessage<UserResponseDTO> errorResponse =
                new ResponseMessage<>(HttpStatus.NOT_FOUND, ex.getMessage(), null);

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
	}

	@ExceptionHandler(MemberNotUpdateException.class)
	public ResponseEntity<ResponseMessage<UserResponseDTO>> handleMemberNotUpdateException(MemberNotUpdateException ex) {
		ResponseMessage<UserResponseDTO> errorResponse =
				new ResponseMessage<>(HttpStatus.NOT_FOUND, ex.getMessage(), null);

		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
	}

	@ExceptionHandler(RoleNotFoundException.class)
	public ResponseEntity<ResponseMessage<RoleResponseDTO>> handleMemberNotUpdateException(RoleNotFoundException ex) {
		ResponseMessage<RoleResponseDTO> errorResponse =
				new ResponseMessage<>(HttpStatus.NOT_FOUND, ex.getMessage(), null);
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
	}

	@ExceptionHandler(MeetingNotFoundException.class)
	public ResponseEntity<ResponseMessage<MeetingResponseDTO>> handleMeetingNotFoundException(MeetingNotFoundException ex) {
		ResponseMessage<MeetingResponseDTO> errorResponse =
				new ResponseMessage<>(HttpStatus.NOT_FOUND, ex.getMessage(), null);
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
	}

	@ExceptionHandler(InvalidUserIdAndMeetingIdException.class)
	public ResponseEntity<ResponseMessage<PreferredRoleResponseDTO>> handleInvalidUserIdAndMeetingIdException(InvalidUserIdAndMeetingIdException ex){
		ResponseMessage<PreferredRoleResponseDTO> errorResponse =
				new ResponseMessage<>(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
	}

	@ExceptionHandler(EmptyListException.class)
	public ResponseEntity<ResponseMessage<?>> handleEmptyListException(EmptyListException ex){
		ResponseMessage<?> errorResponse =
				new ResponseMessage<>(HttpStatus.OK, ex.getMessage(), null);
		return ResponseEntity.status(HttpStatus.OK).body(errorResponse);
	}
	
	
//	@ExceptionHandler(Exception.class)
//    public ResponseEntity<ResponseMessage<Object>> handleGenericException(Exception ex) {
//        ResponseMessage<Object> errorResponse =
//                new ResponseMessage<>(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong", null);
//        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
//    }
}
