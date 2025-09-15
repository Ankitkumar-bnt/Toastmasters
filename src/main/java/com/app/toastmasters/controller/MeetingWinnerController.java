package com.app.toastmasters.controller;

import com.app.toastmasters.dto.requestDTO.MeetingWinnerRequestDTO;
import com.app.toastmasters.dto.responseDTO.MeetingWinnerResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.MeetingWinnerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/meetingWinner")
public class MeetingWinnerController {

    private final MeetingWinnerService meetingWinnerService;

    public MeetingWinnerController(MeetingWinnerService meetingWinnerService) {
        this.meetingWinnerService = meetingWinnerService;
    }

    @PostMapping("/addMeetingWinner")
    public ResponseEntity<ResponseMessage<MeetingWinnerResponseDTO>> addMeetingWinner(
            @RequestBody MeetingWinnerRequestDTO meetingWinnerRequestDTO){
        return meetingWinnerService.addMeetingWinner(meetingWinnerRequestDTO);
    }

    @GetMapping("/getAllMeetingWinner")
    public ResponseEntity<ResponseMessage<List<MeetingWinnerResponseDTO>>> getAllMeetingWinner(){
        return meetingWinnerService.getAllMeetingWinner();
    }

    @GetMapping("/getAllMeetingWinnerByMeeting/{meetingId}")
    public ResponseEntity<ResponseMessage<List<MeetingWinnerResponseDTO>>> getAllMeetingWinnerByMeeting(
            @PathVariable int meetingId){
        return meetingWinnerService.getAllMeetingWinnerByMeeting(meetingId);
    }

    @GetMapping("/getAllMeetingWinnerByUser/{userId}")
    public ResponseEntity<ResponseMessage<List<MeetingWinnerResponseDTO>>> getAllMeetingWinnerByUser(
            @PathVariable int userId){
        return meetingWinnerService.getAllMeetingWinnerByUser(userId);
    }

    @PutMapping("/updateMeetingWinnerByUserAndMeeting/{userId}/{meetingId}")
    public ResponseEntity<ResponseMessage<MeetingWinnerResponseDTO>> updateMeetingWinnerByUserAndMeeting(
            @RequestBody MeetingWinnerRequestDTO dto, @PathVariable int userId, @PathVariable int meetingId){
        return meetingWinnerService.updateMeetingWinnerByUserAndMeeting(dto, userId, meetingId);
    }

    @DeleteMapping("/deleteMeetingWinnerByUserAndMeeting/{userId}/{meetingId}")
    public ResponseEntity<ResponseMessage<MeetingWinnerResponseDTO>> deleteMeetingWinnerByUserAndMeeting(
            @PathVariable int userId, @PathVariable int meetingId){
        return meetingWinnerService.deleteMeetingWinnerByUserAndMeeting(userId, meetingId);
    }
}
