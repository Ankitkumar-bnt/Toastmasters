package com.app.toastmasters.mapper;

import com.app.toastmasters.dto.requestDTO.AssignedRoleRequestDTO;
import com.app.toastmasters.dto.requestDTO.PreferredRoleRequestDTO;
import com.app.toastmasters.dto.responseDTO.AssignedRoleResponseDTO;
import com.app.toastmasters.dto.responseDTO.PreferredRoleResponseDTO;
import com.app.toastmasters.entity.AssignedRole;
import com.app.toastmasters.entity.PreferredRole;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValueMappingStrategy = NullValueMappingStrategy.RETURN_DEFAULT)
public interface UserAdminAssignedRoleMapper {

    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "role.roleId", target = "roleId")
    @Mapping(source = "meeting.meetingId", target = "meetingId")
    PreferredRoleResponseDTO toPreferredRoleDTO(PreferredRole preferredRole);

    PreferredRole toPreferredRoleEntity(PreferredRoleRequestDTO dto);


    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "role.roleId", target = "roleId")
    @Mapping(source = "meeting.meetingId", target = "meetingId")
    AssignedRoleResponseDTO toAssignedRoleDTO(AssignedRole assignedRole);

    AssignedRole toAssignedRoleEntity(AssignedRoleRequestDTO dto);

}
