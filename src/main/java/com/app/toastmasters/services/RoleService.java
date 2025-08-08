package com.app.toastmasters.services;

import com.app.toastmasters.dto.requestDTO.RoleRequestDTO;
import com.app.toastmasters.dto.responseDTO.RoleResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface RoleService {
    ResponseEntity<ResponseMessage<RoleResponseDTO>> addRole(RoleRequestDTO roleRequestDTO);
    ResponseEntity<ResponseMessage<List<RoleResponseDTO>>> getAllRoles();
    ResponseEntity<ResponseMessage<RoleResponseDTO>> getRoleById(Integer roleId);
    ResponseEntity<ResponseMessage<RoleResponseDTO>> updateRole(Integer roleId, RoleRequestDTO roleRequestDTO);
    ResponseEntity<ResponseMessage<RoleResponseDTO>> deleteRole(Integer roleId);
}
