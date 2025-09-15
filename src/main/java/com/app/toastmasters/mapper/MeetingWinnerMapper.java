package com.app.toastmasters.mapper;

import com.app.toastmasters.dto.requestDTO.MeetingWinnerRequestDTO;
import com.app.toastmasters.dto.responseDTO.MeetingWinnerResponseDTO;
import com.app.toastmasters.entity.MeetingWinners;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MeetingWinnerMapper {

    // Map RequestDTO → Entity
    @Mapping(source = "userId", target = "user.userId")
    @Mapping(source = "meetingId", target = "meeting.meetingId")
    MeetingWinners toEntity(MeetingWinnerRequestDTO requestDTO);

    // Map Entity → ResponseDTO
    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "meeting.meetingId", target = "meetingId")
    MeetingWinnerResponseDTO toResponseDTO(MeetingWinners entity);

    // Update existing entity from RequestDTO
    @Mapping(source = "userId", target = "user.userId")
    @Mapping(source = "meetingId", target = "meeting.meetingId")
    void updateEntityFromDto(MeetingWinnerRequestDTO dto, @MappingTarget MeetingWinners entity);
}
