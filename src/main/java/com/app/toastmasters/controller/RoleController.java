package com.app.toastmasters.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.app.toastmasters.dto.requestDTO.RoleRequestDTO;
import com.app.toastmasters.dto.responseDTO.RoleResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.RoleService;

import jakarta.validation.Valid;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @PostMapping("/addRole")
    public ResponseEntity<ResponseMessage<RoleResponseDTO>> addRole(
            @Valid @RequestBody RoleRequestDTO roleRequestDTO) {
        return roleService.addRole(roleRequestDTO);
    }

    @GetMapping("/getAllRoles")
    public ResponseEntity<ResponseMessage<List<RoleResponseDTO>>> getAllRoles() {
        return roleService.getAllRoles();
    }

    @GetMapping("/getRole/{roleId}")
    public ResponseEntity<ResponseMessage<RoleResponseDTO>> getRoleById(
            @PathVariable Integer roleId) {
        return roleService.getRoleById(roleId);
    }

    @PatchMapping("/updateRole/{roleId}")
    public ResponseEntity<ResponseMessage<RoleResponseDTO>> updateRole(
            @PathVariable Integer roleId,
            @Valid @RequestBody RoleRequestDTO roleRequestDTO) {
        return roleService.updateRole(roleId, roleRequestDTO);
    }

    @DeleteMapping("/deleteRole/{roleId}")
    public ResponseEntity<ResponseMessage<RoleResponseDTO>> deleteRole(
            @PathVariable Integer roleId) {
        return roleService.deleteRole(roleId);
    }
}
