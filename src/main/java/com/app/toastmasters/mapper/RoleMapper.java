package com.app.toastmasters.mapper;

import com.app.toastmasters.dto.requestDTO.RoleRequestDTO;
import com.app.toastmasters.dto.responseDTO.RoleResponseDTO;
import com.app.toastmasters.entity.Roles;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    Roles toEntity(RoleRequestDTO dto);

    RoleResponseDTO toResponseDto(Roles roles);
}
