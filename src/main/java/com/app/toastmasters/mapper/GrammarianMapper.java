package com.app.toastmasters.mapper;

import com.app.toastmasters.dto.requestDTO.GrammarianRequestDTO;
import com.app.toastmasters.dto.responseDTO.GrammarianResponseDTO;
import com.app.toastmasters.entity.agenda.Grammarian;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface GrammarianMapper {

    // Map DTO → Entity
    @Mapping(source = "userId", target = "user.userId")
    @Mapping(source = "meetingId", target = "meeting.meetingId")
    Grammarian toEntity(GrammarianRequestDTO requestDTO);

    // Map Entity → ResponseDTO
    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "meeting.meetingId", target = "meetingId")
    GrammarianResponseDTO toResponseDTO(Grammarian grammarian);

    // Update entity from DTO
    @Mapping(source = "userId", target = "user.userId")
    @Mapping(source = "meetingId", target = "meeting.meetingId")
    void updateEntityFromDto(GrammarianRequestDTO dto, @MappingTarget Grammarian entity);
}
