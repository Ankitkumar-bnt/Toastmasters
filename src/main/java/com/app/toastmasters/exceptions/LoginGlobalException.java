package com.app.toastmasters.exceptions;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class LoginGlobalException {

    @ExceptionHandler(AuthenticationFailedException.class)
	public ResponseEntity<ResponseMessage<?>> handleAuthenticationFailedException(AuthenticationFailedException ex){
        ResponseMessage<?> responseMessage =
                new ResponseMessage<>(HttpStatus.UNAUTHORIZED, ex.getMessage(), null);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(responseMessage);
    }
}
