package com.app.toastmasters.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.app.toastmasters.dto.requestDTO.UserRequestDTO;
import com.app.toastmasters.dto.responseDTO.UserResponseDTO;
import com.app.toastmasters.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "userType", expression = "java(dto.getUserType() != null ? dto.getUserType() : \"user\")")
    @Mapping(target = "deleteStatus", expression = "java(dto.getDeleteStatus() != null ? dto.getDeleteStatus() : 1)")
    User toEntity(UserRequestDTO dto);

    UserResponseDTO toResponseDTO(User user);
}
