package com.app.toastmasters.controller;

import com.app.toastmasters.dto.responseDTO.GemOfMonthDTO;
import com.app.toastmasters.dto.responseDTO.UserResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.MeetingAwardsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/meetingAwards")
public class MeetingAwardsController {

    private final MeetingAwardsService meetingAwardsService;

    public MeetingAwardsController(MeetingAwardsService meetingAwardsService) {
        this.meetingAwardsService = meetingAwardsService;
    }

    @GetMapping("/gemOfTheMonth")
    public ResponseEntity<ResponseMessage<List<GemOfMonthDTO>>> gemOfTheMonth(){
        return meetingAwardsService.gemOfTheMonth();
    }
}
