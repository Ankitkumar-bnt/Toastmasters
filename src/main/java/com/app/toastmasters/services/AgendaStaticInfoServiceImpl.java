package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.requestDTO.AgendaStaticInfoRequestDTO;
import com.app.toastmasters.dto.responseDTO.AgendaStaticInfoResponseDTO;
import com.app.toastmasters.entity.agenda.AgendaStaticInfo;
import com.app.toastmasters.exceptions.EmptyListException;
import com.app.toastmasters.exceptions.EmptyObjectException;
import com.app.toastmasters.mapper.AgendaStaticInfoMapper;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.AgendaStaticInfoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AgendaStaticInfoServiceImpl implements AgendaStaticInfoService {

    private final AgendaStaticInfoRepository agendaStaticInfoRepository;
    private final AgendaStaticInfoMapper mapper;

    public AgendaStaticInfoServiceImpl(AgendaStaticInfoRepository agendaStaticInfoRepository,
                                       AgendaStaticInfoMapper mapper) {
        this.agendaStaticInfoRepository = agendaStaticInfoRepository;
        this.mapper = mapper;
    }

    @Override
    public ResponseEntity<ResponseMessage<AgendaStaticInfoResponseDTO>> addStaticInfo(AgendaStaticInfoRequestDTO agendaStaticInfo) {
        if (agendaStaticInfo == null)
            throw new EmptyObjectException(Constant.EMPTY_OBJECT);

        AgendaStaticInfo staticInfo = agendaStaticInfoRepository.save(mapper.toEntity(agendaStaticInfo));
        ResponseMessage<AgendaStaticInfoResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.CREATED, Constant.STATIC_INFO_CREATED, mapper.toResponseDTO(staticInfo));

        return ResponseEntity.status(HttpStatus.CREATED).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<AgendaStaticInfoResponseDTO>>> getAllStaticInfo() {
        List<AgendaStaticInfo> staticInfoList = agendaStaticInfoRepository.findAll();

        if (staticInfoList.isEmpty()) {
            throw new EmptyListException(Constant.EMPTY_LIST);
        }

        List<AgendaStaticInfoResponseDTO> responseDTOList =
                staticInfoList.stream().map(mapper::toResponseDTO).collect(Collectors.toList());

        ResponseMessage<List<AgendaStaticInfoResponseDTO>> responseMessage =
                new ResponseMessage<List<AgendaStaticInfoResponseDTO>>(HttpStatus.OK, Constant.FOUND_ALL_STATIC_INFO, responseDTOList);

        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<AgendaStaticInfoResponseDTO>> getAllStaticInfoByInfoKeyOrInfoValue(String keyOrValue) {
        Optional<AgendaStaticInfo> staticInfo =
                agendaStaticInfoRepository.findByInfoKeyOrInfoValue(keyOrValue, keyOrValue);

        if (staticInfo.isEmpty()) {
            throw new EmptyListException(Constant.EMPTY_LIST);
        }

        ResponseMessage<AgendaStaticInfoResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.STATIC_INFO_FOUND, mapper.toResponseDTO(staticInfo.get()));

        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<AgendaStaticInfoResponseDTO>> updateStaticInfoById(
            AgendaStaticInfoRequestDTO agendaStaticInfoRequestDTO, int staticInfoId) {

        Optional<AgendaStaticInfo> existing = agendaStaticInfoRepository.findById(staticInfoId);

        if (existing.isEmpty()) {
            throw new EmptyListException(Constant.EMPTY_LIST);
        }

        AgendaStaticInfo staticInfo = existing.get();
        staticInfo.setInfoKey(agendaStaticInfoRequestDTO.getInfoKey());
        staticInfo.setInfoValue(agendaStaticInfoRequestDTO.getInfoValue());

        AgendaStaticInfo updated = agendaStaticInfoRepository.save(staticInfo);

        ResponseMessage<AgendaStaticInfoResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.STATIC_INFO_UPDATED, mapper.toResponseDTO(updated));

        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<AgendaStaticInfoResponseDTO>> deleteStaticInfoById(int staticInfoId) {
        Optional<AgendaStaticInfo> staticInfo = agendaStaticInfoRepository.findById(staticInfoId);

        if (staticInfo.isEmpty()) {
            throw new EmptyListException(Constant.EMPTY_LIST);
        }

        agendaStaticInfoRepository.deleteById(staticInfoId);

        ResponseMessage<AgendaStaticInfoResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.STATIC_INFO_DELETED, mapper.toResponseDTO(staticInfo.get()));

        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }
}
