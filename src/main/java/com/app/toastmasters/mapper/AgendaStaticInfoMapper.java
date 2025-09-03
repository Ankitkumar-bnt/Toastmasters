package com.app.toastmasters.mapper;

import com.app.toastmasters.entity.agenda.AgendaStaticInfo;
import com.app.toastmasters.dto.requestDTO.AgendaStaticInfoRequestDTO;
import com.app.toastmasters.dto.responseDTO.AgendaStaticInfoResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface AgendaStaticInfoMapper {

    AgendaStaticInfoMapper INSTANCE = Mappers.getMapper(AgendaStaticInfoMapper.class);

    AgendaStaticInfo toEntity(AgendaStaticInfoRequestDTO dto);

    AgendaStaticInfoResponseDTO toResponseDTO(AgendaStaticInfo entity);
}
