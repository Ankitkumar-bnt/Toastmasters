package com.app.toastmasters.services;

import com.app.toastmasters.dto.requestDTO.AgendaStaticInfoRequestDTO;
import com.app.toastmasters.dto.responseDTO.AgendaStaticInfoResponseDTO;
import com.app.toastmasters.entity.agenda.AgendaStaticInfo;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface AgendaStaticInfoService {
    ResponseEntity<ResponseMessage<AgendaStaticInfoResponseDTO>> addStaticInfo(AgendaStaticInfoRequestDTO agendaStaticInfo);

    ResponseEntity<ResponseMessage<List<AgendaStaticInfoResponseDTO>>> getAllStaticInfo();

    ResponseEntity<ResponseMessage<AgendaStaticInfoResponseDTO>> getAllStaticInfoByInfoKeyOrInfoValue(String keyOrValue);

    ResponseEntity<ResponseMessage<AgendaStaticInfoResponseDTO>> updateStaticInfoById(AgendaStaticInfoRequestDTO agendaStaticInfoRequestDTO, int staticInfoId);

    ResponseEntity<ResponseMessage<AgendaStaticInfoResponseDTO>> deleteStaticInfoById(int staticInfoId);
}
