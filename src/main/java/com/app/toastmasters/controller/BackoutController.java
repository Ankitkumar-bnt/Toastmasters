package com.app.toastmasters.controller;

import com.app.toastmasters.entity.Backouts;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.BackoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequiredArgsConstructor
@RequestMapping("/backout")
public class BackoutController {

    private final BackoutService backoutService;

    @GetMapping("/getAllBackouts")
    public ResponseEntity<ResponseMessage<List<Backouts>>> getAllBackouts(){
        return backoutService.getAllBackouts();
    }

    @GetMapping("/getBackoutsByUser/{userId}")
    public ResponseEntity<ResponseMessage<List<Backouts>>> getBackoutsByUser(@PathVariable int userId){
        return backoutService.getBackoutsByUser(userId);
    }

    @GetMapping("/getBackoutsByMeeting/{meetingId}")
    public ResponseEntity<ResponseMessage<List<Backouts>>> getBackoutsByMeeting(@PathVariable int meetingId){
        return backoutService.getBackoutsByMeeting(meetingId);
    }
}

