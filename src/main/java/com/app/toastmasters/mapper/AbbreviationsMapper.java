package com.app.toastmasters.mapper;

import com.app.toastmasters.dto.requestDTO.AbbreviationsRequestDTO;
import com.app.toastmasters.dto.responseDTO.AbbreviationsResponseDTO;
import com.app.toastmasters.entity.agenda.Abbreviations;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AbbreviationsMapper {

    Abbreviations toEntity(AbbreviationsRequestDTO dto);

    AbbreviationsResponseDTO toResponseDTO(Abbreviations entity);
}
