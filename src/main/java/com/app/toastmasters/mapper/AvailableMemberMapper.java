package com.app.toastmasters.mapper;

import com.app.toastmasters.dto.requestDTO.AvailableMembersRequestDTO;
import com.app.toastmasters.dto.responseDTO.AvailableMemberResponseDTO;
import com.app.toastmasters.entity.AvailableMembers;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValueMappingStrategy;

@Mapper(componentModel = "spring", nullValueMappingStrategy = NullValueMappingStrategy.RETURN_DEFAULT)
public interface AvailableMemberMapper {

    AvailableMembers toEntity(AvailableMembersRequestDTO dto);

    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "meeting.meetingId", target = "meetingId")
    AvailableMemberResponseDTO toDTO(AvailableMembers entity);
}

