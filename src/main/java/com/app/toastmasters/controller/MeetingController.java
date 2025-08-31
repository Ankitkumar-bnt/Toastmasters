package com.app.toastmasters.controller;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.requestDTO.MeetingRequestDTO;
import com.app.toastmasters.dto.responseDTO.MeetingResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.MeetingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/meetings")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @PostMapping("/addMeeting")
    public ResponseEntity<ResponseMessage<MeetingResponseDTO>> addMeeting(
            @Valid @RequestBody MeetingRequestDTO meetingRequestDTO) {
        return meetingService.addMeeting(meetingRequestDTO);
    }

    @GetMapping("/getAllMeetings")
    public ResponseEntity<ResponseMessage<List<MeetingResponseDTO>>> getAllMeetings() {
        return meetingService.getAllMeetings();
    }

    @GetMapping("/getMeetingById/{meetingId}")
    public ResponseEntity<ResponseMessage<MeetingResponseDTO>> getMeetingById(
            @PathVariable Integer meetingId) {
        return meetingService.getMeetingById(meetingId);
    }

    @GetMapping("/getMeetingByTheme/{meetingTheme}")
    public ResponseEntity<ResponseMessage<MeetingResponseDTO>> getMeetingByTheme(
            @PathVariable String meetingTheme) {
        return meetingService.getMeetingByTheme(meetingTheme);
    }

    @PatchMapping("/updateMeeting/{meetingId}")
    public ResponseEntity<ResponseMessage<MeetingResponseDTO>> updateMeeting(
            @PathVariable Integer meetingId,
            @Valid @RequestBody MeetingRequestDTO meetingRequestDTO) {
        return meetingService.updateMeeting(meetingId, meetingRequestDTO);
    }

    @DeleteMapping("/deleteMeeting/{meetingId}")
    public ResponseEntity<ResponseMessage<MeetingResponseDTO>> deleteMeeting(
            @PathVariable Integer meetingId) {
        return meetingService.deleteMeeting(meetingId);
    }
}
