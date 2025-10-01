package com.app.toastmasters.controller;

import com.app.toastmasters.dto.requestDTO.GemOfMonthRequestDto;
import com.app.toastmasters.dto.responseDTO.GemOfMonthDTO;
import com.app.toastmasters.dto.responseDTO.UserResponseDTO;
import com.app.toastmasters.entity.GemOfMonth;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.MeetingAwardsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/meetingAwards")
public class MeetingAwardsController {

    private final MeetingAwardsService meetingAwardsService;

    public MeetingAwardsController(MeetingAwardsService meetingAwardsService) {
        this.meetingAwardsService = meetingAwardsService;
    }

    @GetMapping("/gemsOfTheLastMonth")
    public ResponseEntity<ResponseMessage<List<GemOfMonthDTO>>> gemsOfTheLastMonth(){
        return meetingAwardsService.gemsOfTheLastMonth();
    }

    @PostMapping("/selectGemOfMonth")
    public ResponseEntity<ResponseMessage<GemOfMonthDTO>> selectGemOfMonth(@RequestBody GemOfMonthRequestDto gemOfMonth){
        return meetingAwardsService.selectGemOfMonth(gemOfMonth);
    }

    @GetMapping("/getAllGemOfMonth")
    public ResponseEntity<ResponseMessage<List<GemOfMonthDTO>>> getAllGemOfMonth(){
        return meetingAwardsService.getAllGemOfMonth();
    }

    @GetMapping("/listAllLastMonthMembersWithCount")
    public ResponseEntity<ResponseMessage<List<GemOfMonthDTO>>> listAllLastMonthMembersWithCount(){
        return meetingAwardsService.listAllLastMonthMembersWithCount();
    }
}
