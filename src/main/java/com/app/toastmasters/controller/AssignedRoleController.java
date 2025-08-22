package com.app.toastmasters.controller;

import com.app.toastmasters.dto.responseDTO.AssignedRoleResponseDTO;
import com.app.toastmasters.dto.responseDTO.PreferredRoleResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.AssignedRoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class AssignedRoleController {
    private final AssignedRoleService assignedRoleService;

    public AssignedRoleController(AssignedRoleService assignedRoleService) {
        this.assignedRoleService = assignedRoleService;
    }

    @PostMapping("/addMemberAssignedRole/{userId}/{meetingId}")
    public ResponseEntity<ResponseMessage<AssignedRoleResponseDTO>> addPreferredRole(
            @RequestBody List<String> assignedRoleList, @PathVariable int userId, @PathVariable int meetingId) {
        return assignedRoleService.addAssignedRole(assignedRoleList, userId, meetingId);
    }

    @GetMapping("/getMemberAssignedRole/{userId}/{meetingId}")
    public ResponseEntity<ResponseMessage<List<String>>> getMemberPreferredRole(
            @PathVariable int userId, @PathVariable int meetingId ){

        return assignedRoleService.getMemberAssignedRole(userId, meetingId);
    }

    @DeleteMapping("/deleteAssignedRole/{userId}/{meetingId}")
    public ResponseEntity<ResponseMessage<String>> deleteMemberPreferredRole(
            @RequestBody List<String> deleteRoles, @PathVariable int userId, @PathVariable int meetingId) {

        return assignedRoleService.deleteMemberAssignedRole(deleteRoles, userId, meetingId);
    }
}
