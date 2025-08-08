package com.app.toastmasters.exceptions;

import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.app.toastmasters.message.ResponseMessage;

@ControllerAdvice
public class ValidationGlobalExceptionHandler {
	
	 @ExceptionHandler(MethodArgumentNotValidException.class)
	    public ResponseEntity<ResponseMessage<Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
	        String errorMsg = ex.getBindingResult()
	                .getFieldErrors()
	                .stream()
	                .map(err -> err.getField() + ": " + err.getDefaultMessage())
	                .collect(Collectors.joining(", "));

	        ResponseMessage<Object> response = new ResponseMessage<>(
	                HttpStatus.BAD_REQUEST,
	                errorMsg,
	                null
	        );

	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	    }
}
