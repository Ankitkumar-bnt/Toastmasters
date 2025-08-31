package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.requestDTO.RoleRequestDTO;
import com.app.toastmasters.dto.responseDTO.RoleResponseDTO;
import com.app.toastmasters.entity.Roles;
import com.app.toastmasters.exceptions.RoleNotFoundException;
import com.app.toastmasters.mapper.RoleMapper;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.RoleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepo;
    private final RoleMapper mapper;

    public RoleServiceImpl(RoleRepository roleRepo, RoleMapper mapper) {
        this.roleRepo = roleRepo;
        this.mapper = mapper;
    }

    @Override
    public ResponseEntity<ResponseMessage<RoleResponseDTO>> addRole(RoleRequestDTO roleRequestDTO) {
        Roles savedRole = roleRepo.save(mapper.toEntity(roleRequestDTO));
        ResponseMessage<RoleResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.CREATED, Constant.ROLE_ADDED_SUCCESS, mapper.toResponseDto(savedRole));
        return ResponseEntity.status(HttpStatus.CREATED).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<RoleResponseDTO>>> getAllRoles() {
        List<Roles> allRoles = roleRepo.findAll();

        if (allRoles.isEmpty()) {
            throw new RoleNotFoundException(Constant.ROLE_NOT_FOUND);
        }

        ResponseMessage<List<RoleResponseDTO>> responseMessage =
                new ResponseMessage<List<RoleResponseDTO>>(HttpStatus.OK, Constant.FOUND_ALL_ROLES,
                        allRoles.stream()
                                .map(mapper::toResponseDto)
                                .collect(Collectors.toList()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<RoleResponseDTO>> getRoleById(Integer roleId) {
        Optional<Roles> roleById = roleRepo.findById(roleId);

        if (roleById.isEmpty()) {
            throw new RoleNotFoundException(Constant.ROLE_NOT_FOUND);
        }

        ResponseMessage<RoleResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.ROLE_FOUND, mapper.toResponseDto(roleById.get()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<RoleResponseDTO>> updateRole(Integer roleId, RoleRequestDTO roleRequestDTO) {
        Optional<Roles> roleById = roleRepo.findById(roleId);

        if (roleById.isEmpty()) {
            throw new RoleNotFoundException(Constant.ROLE_NOT_FOUND);
        }

        Roles role = roleById.get();

        if (roleRequestDTO.getRoleName() != null)
            role.setRoleName(roleRequestDTO.getRoleName());

        if (roleRequestDTO.getDescription() != null)
            role.setDescription(roleRequestDTO.getDescription());

        Roles updatedRole = roleRepo.save(role);

        ResponseMessage<RoleResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.ROLE_UPDATE_SUCCESS, mapper.toResponseDto(updatedRole));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<RoleResponseDTO>> deleteRole(Integer roleId) {
        Optional<Roles> roleById = roleRepo.findById(roleId);

        if (roleById.isEmpty()) {
            throw new RoleNotFoundException(Constant.ROLE_NOT_FOUND);
        }
        roleRepo.deleteById(roleId);
        
        if (roleRepo.findById(roleId).isPresent()) {
            throw new RoleNotFoundException(Constant.ROLE_DELETE_FAILS);
        }

        ResponseMessage<RoleResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.ROLE_DELETE_SUCCESS, mapper.toResponseDto(roleById.get()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }
}
