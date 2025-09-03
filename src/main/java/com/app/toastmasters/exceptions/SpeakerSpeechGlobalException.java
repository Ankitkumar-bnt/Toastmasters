package com.app.toastmasters.exceptions;

import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class SpeakerSpeechGlobalException {

    @ExceptionHandler(EmptyObjectException.class)
    public ResponseEntity<ResponseMessage<?>> handleSpeakerSpeechNotFound(EmptyObjectException ex) {
        ResponseMessage<?> responseMessage =
                new ResponseMessage<>(HttpStatus.NOT_FOUND, ex.getMessage(), null);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseMessage);
    }

    @ExceptionHandler(SpeakerSpeechNotFoundException.class)
    public ResponseEntity<ResponseMessage<?>> handleNotFound(SpeakerSpeechNotFoundException ex) {
        ResponseMessage<?> response =
                new ResponseMessage<>(HttpStatus.NOT_FOUND, ex.getMessage(), null);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
}
