package com.app.toastmasters.controller;

import com.app.toastmasters.dto.responseDTO.AvailableMemberResponseDTO;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.AvailableMembersService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/availableMembers")
public class AvailableMembersController {

    private final AvailableMembersService availableMembersService;

    public AvailableMembersController(AvailableMembersService availableMembersService) {
        this.availableMembersService = availableMembersService;
    }

    @PostMapping("/markAvailability/{availability}/{userId}/{meetingId}")
    public ResponseEntity<ResponseMessage<AvailableMemberResponseDTO>> markAvailability(
            @PathVariable Integer availability, @PathVariable Integer userId, @PathVariable Integer meetingId) {
        return availableMembersService.markAvailability(availability, userId, meetingId);
    }

    @GetMapping("/getAllMemberAvailability")
    public ResponseEntity<ResponseMessage<List<AvailableMemberResponseDTO>>> getAllMemberAvailability(){

        return availableMembersService.getAllMemberAvailability();
    }


}
