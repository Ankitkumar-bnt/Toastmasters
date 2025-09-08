package com.app.toastmasters.mapper;

import com.app.toastmasters.dto.requestDTO.AgendaSectionRequestDTO;
import com.app.toastmasters.dto.responseDTO.AgendaSectionResponseDTO;
import com.app.toastmasters.entity.agenda.AgendaSection;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface AgendaSectionMapper {

    AgendaSectionMapper INSTANCE = Mappers.getMapper(AgendaSectionMapper.class);

    AgendaSectionResponseDTO toDto(AgendaSection agendaSection);

    AgendaSection toEntity(AgendaSectionRequestDTO agendaSectionDto);
}
