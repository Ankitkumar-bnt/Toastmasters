package com.app.toastmasters.mapper;

import com.app.toastmasters.dto.requestDTO.ClubOfficersRequestDTO;
import com.app.toastmasters.dto.responseDTO.ClubOfficersResponseDTO;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.entity.agenda.ClubOfficers;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ClubOfficersMapper {

    @Mapping(target = "officerId", ignore = true)
    @Mapping(target = "user", expression = "java(userFromId(dto.getUserId()))")
    ClubOfficers toEntity(ClubOfficersRequestDTO dto);

    @Mapping(target = "userId", source = "user.userId")
    ClubOfficersResponseDTO toResponseDTO(ClubOfficers clubOfficers);

    default User userFromId(int userId) {
        User user = new User();
        user.setUserId(userId);
        return user;
    }
}
