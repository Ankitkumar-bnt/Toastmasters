package com.app.toastmasters.controller;

import com.app.toastmasters.dto.responseDTO.MeetingResponseDTO;
import com.app.toastmasters.dto.responseDTO.MeetingRoleResponseDTO;
import com.app.toastmasters.dto.responseDTO.RoleResponseDTO;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.MeetingRoleHelper;
import com.app.toastmasters.entity.MeetingWithRolesDTO;
import com.app.toastmasters.entity.Roles;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.MeetingRoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class MeetingRoleController {

    private final MeetingRoleService meetingRoleService;

    public MeetingRoleController(MeetingRoleService meetingRoleService){
        this.meetingRoleService = meetingRoleService;
    }

    @PostMapping("/addMeetingRoles/{meetingId}")
    public ResponseEntity<ResponseMessage<List<MeetingRoleResponseDTO>>> addMeetingRoles(
            @RequestBody Map<String, Integer> roles, @PathVariable int meetingId){

        return meetingRoleService.addMeetingRoles(roles, meetingId);
    }

    @GetMapping("/getAllMeetingRole")
    public ResponseEntity<ResponseMessage<List<MeetingRoleResponseDTO>>> getAllMeetingRole(){

        return meetingRoleService.getAllMeetingRole();
    }

    @GetMapping("/getAllMeetingRoleCombineByMeeting/{meetingId}")
    public ResponseEntity<ResponseMessage<List<MeetingRoleHelper>>> getAllMeetingRoleCombineByMeeting(@PathVariable int meetingId){

        return meetingRoleService.getAllMeetingRoleCombineByMeeting(meetingId);
    }

    @GetMapping("/getAllMeetingRoleByMeetingId/{meetingId}")
    public ResponseEntity<ResponseMessage<List<MeetingRoleResponseDTO>>> getAllMeetingRoleByMeetingId(
            @PathVariable int meetingId){

        return meetingRoleService.getAllMeetingRoleByMeetingId(meetingId);
    }

    @GetMapping("/getAllMeetingRoleByMeetingTheme/{meetingTheme}")
    public ResponseEntity<ResponseMessage<List<MeetingRoleResponseDTO>>> getAllMeetingRoleByMeetingTheme(
            @PathVariable String meetingTheme){

        return meetingRoleService.getAllMeetingRoleByMeetingTheme(meetingTheme);
    }

    @GetMapping("/getLast3MeetingRoles/{userId}")
    public ResponseEntity<ResponseMessage<List<MeetingWithRolesDTO>>> getLast3MeetingRoles(
            @PathVariable int userId){
        return meetingRoleService.getLast3MeetingRoles(userId);
    }
}
