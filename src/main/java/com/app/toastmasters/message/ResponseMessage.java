package com.app.toastmasters.message;

import org.springframework.http.HttpStatusCode;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponseMessage<T> {

    private Integer statusCode;
    private String message;
    private HttpStatusCode status;
    private LocalDateTime timestamp; 
    private T data;

    public ResponseMessage(HttpStatusCode status, String message, T data) {
        this.status = status;
        this.statusCode = status.value();
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }
}
