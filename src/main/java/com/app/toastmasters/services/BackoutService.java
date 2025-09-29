package com.app.toastmasters.services;

import com.app.toastmasters.entity.Backouts;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface BackoutService {
    ResponseEntity<ResponseMessage<List<Backouts>>> getAllBackouts();

    ResponseEntity<ResponseMessage<List<Backouts>>> getBackoutsByUser(int userId);

    ResponseEntity<ResponseMessage<List<Backouts>>> getBackoutsByMeeting(int meetingId);
}
