package com.app.toastmasters.mapper;

import com.app.toastmasters.dto.requestDTO.GrammarianRequestDTO;
import com.app.toastmasters.dto.responseDTO.GrammarianResponseDTO;
import com.app.toastmasters.entity.agenda.Grammarian;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface GrammarianMapper {

    @Mapping(source = "userId", target = "userId.userId")
    @Mapping(source = "meetingId", target = "meetingId.meetingId")
    Grammarian toEntity(GrammarianRequestDTO requestDTO);

    @Mapping(source = "userId.userId", target = "userId")
    @Mapping(source = "meetingId.meetingId", target = "meetingId")
    GrammarianResponseDTO toResponseDTO(Grammarian grammarian);

    @Mapping(source = "userId", target = "userId.userId")
    @Mapping(source = "meetingId", target = "meetingId.meetingId")
    void updateEntityFromDto(GrammarianRequestDTO dto, @MappingTarget Grammarian entity);
}
