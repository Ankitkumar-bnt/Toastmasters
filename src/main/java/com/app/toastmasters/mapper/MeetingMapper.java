package com.app.toastmasters.mapper;

import com.app.toastmasters.dto.requestDTO.MeetingRequestDTO;
import com.app.toastmasters.dto.responseDTO.MeetingResponseDTO;
import com.app.toastmasters.entity.Meeting;
import org.mapstruct.Mapper;
import org.mapstruct.NullValueMappingStrategy;

@Mapper(componentModel = "spring", nullValueMappingStrategy = NullValueMappingStrategy.RETURN_DEFAULT)
public interface MeetingMapper {

    Meeting toEntity(MeetingRequestDTO dto);

    MeetingResponseDTO toDTO(Meeting meeting);
}
