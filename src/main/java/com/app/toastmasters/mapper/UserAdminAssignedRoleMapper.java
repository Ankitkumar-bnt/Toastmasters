package com.app.toastmasters.mapper;

import com.app.toastmasters.dto.requestDTO.AssignedRoleRequestDTO;
import com.app.toastmasters.dto.requestDTO.PreferredRoleRequestDTO;
import com.app.toastmasters.dto.responseDTO.AssignedRoleResponseDTO;
import com.app.toastmasters.dto.responseDTO.PreferredRoleResponseDTO;
import com.app.toastmasters.entity.*;
import org.mapstruct.*;

@Mapper(componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValueMappingStrategy = NullValueMappingStrategy.RETURN_DEFAULT,
        uses = {UserIdMapper.class, RoleIdMapper.class, MeetingIdMapper.class})
public interface UserAdminAssignedRoleMapper {

    PreferredRoleResponseDTO toPreferredRoleDTO(PreferredRole preferredRole);

    PreferredRole toPreferredRoleEntity(PreferredRoleRequestDTO dto);

    AssignedRoleResponseDTO toAssignedRoleDTO(AssignedRole assignedRole);

    AssignedRole toAssignedRoleEntity(AssignedRoleRequestDTO dto);
}

@Mapper(componentModel = "spring")
interface UserIdMapper {
    default int map(User user) {
        return user.getUserId();
    }
}

@Mapper(componentModel = "spring")
interface RoleIdMapper {
    default int map(Roles role) {
        return role.getRoleId();
    }
}

@Mapper(componentModel = "spring")
interface MeetingIdMapper {
    default int map(Meeting meeting) {
        return meeting.getMeetingId();
    }
}
