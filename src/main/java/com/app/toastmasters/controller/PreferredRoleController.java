package com.app.toastmasters.controller;

import com.app.toastmasters.dto.requestDTO.PreferredRoleRequestDTO;
import com.app.toastmasters.dto.responseDTO.PreferredRoleResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.PreferredRoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class PreferredRoleController {

    private final PreferredRoleService preferredRoleService;

    public PreferredRoleController(PreferredRoleService preferredRoleService) {
        this.preferredRoleService = preferredRoleService;
    }

    @PostMapping("/addMemberPreferredRole/{userId}/{meetingId}")
    public ResponseEntity<ResponseMessage<PreferredRoleResponseDTO>> addPreferredRole(
            @RequestBody List<String> preferredRoleList, @PathVariable int userId, @PathVariable int meetingId) {
        return preferredRoleService.addPreferredRole(preferredRoleList, userId, meetingId);
    }

    @GetMapping("/getMemberPreferredRoles/{userId}/{meetingId}")
    public ResponseEntity<ResponseMessage<List<String>>> getMemberPreferredRole(
            @PathVariable int userId, @PathVariable int meetingId ){

        return preferredRoleService.getMemberPreferredRole(userId, meetingId);
    }

    @DeleteMapping("/deletePreferredRole/{userId}/{meetingId}")
    public ResponseEntity<ResponseMessage<String>> deleteMemberPreferredRole(
            @RequestBody List<String> deleteRoles, @PathVariable int userId, @PathVariable int meetingId) {

        return preferredRoleService.deleteMemberPreferredRole(deleteRoles, userId, meetingId);
    }
}
