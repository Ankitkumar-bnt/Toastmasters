package com.app.toastmasters.mapper;

import com.app.toastmasters.dto.responseDTO.GemOfMonthDTO;
import com.app.toastmasters.entity.GemOfMonth;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface GemOfMonthMapper {

    GemOfMonthMapper INSTANCE = Mappers.getMapper(GemOfMonthMapper.class);

    GemOfMonthDTO toDTO(GemOfMonth entity);

    GemOfMonth toEntity(GemOfMonthDTO dto);

    List<GemOfMonthDTO> toDTOList(List<GemOfMonth> entities);

    List<GemOfMonth> toEntityList(List<GemOfMonthDTO> dtos);
}

