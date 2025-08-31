package com.app.toastmasters.mapper;

import com.app.toastmasters.dto.requestDTO.MeetingRoleRequestDTO;
import com.app.toastmasters.dto.responseDTO.MeetingRoleResponseDTO;
import com.app.toastmasters.entity.MeetingRole;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface MeetingRoleMapper {

    @Mapping(source = "meeting.meetingId", target = "meetingId")
    @Mapping(source = "role.roleId", target = "roleId")
    MeetingRoleResponseDTO toDTO(MeetingRole entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "meeting", ignore = true)
    @Mapping(target = "role", ignore = true)
    MeetingRole toEntity(MeetingRoleRequestDTO dto);
}
