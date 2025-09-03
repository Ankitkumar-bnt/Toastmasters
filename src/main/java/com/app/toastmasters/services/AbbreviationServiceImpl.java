package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.requestDTO.AbbreviationsRequestDTO;
import com.app.toastmasters.dto.responseDTO.AbbreviationsResponseDTO;
import com.app.toastmasters.entity.agenda.Abbreviations;
import com.app.toastmasters.exceptions.EmptyObjectException;
import com.app.toastmasters.mapper.AbbreviationsMapper;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.AbbreviationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AbbreviationServiceImpl implements AbbreviationService {

    private final AbbreviationRepository abbreviationRepository;
    private final AbbreviationsMapper mapper;

    public AbbreviationServiceImpl(AbbreviationRepository abbreviationRepository, AbbreviationsMapper mapper) {
        this.abbreviationRepository = abbreviationRepository;
        this.mapper = mapper;
    }

    @Override
    public ResponseEntity<ResponseMessage<AbbreviationsResponseDTO>> addAbbreviation(AbbreviationsRequestDTO abbreviations) {
        if (abbreviations == null)
            throw new EmptyObjectException(Constant.EMPTY_OBJECT);

        Abbreviations abbreviationsData = abbreviationRepository.save(mapper.toEntity(abbreviations));
        ResponseMessage<AbbreviationsResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.CREATED, Constant.ABBREVIATION_CREATED, mapper.toResponseDTO(abbreviationsData));
        return ResponseEntity.status(HttpStatus.CREATED).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<AbbreviationsResponseDTO>>> getAllAbbreviations() {
        List<Abbreviations> abbreviationsList = abbreviationRepository.findAll();

        if (abbreviationsList.isEmpty()) {
            ResponseMessage<List<AbbreviationsResponseDTO>> responseMessage =
                    new ResponseMessage<>(HttpStatus.NOT_FOUND, Constant.ABBREVIATION_NOT_FOUND, null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseMessage);
        }

        ResponseMessage<List<AbbreviationsResponseDTO>> responseMessage =
                new ResponseMessage<List<AbbreviationsResponseDTO>>(HttpStatus.OK, Constant.ABBREVIATION_FOUND_ALL,
                        abbreviationsList.stream().map(mapper::toResponseDTO).toList());
        return ResponseEntity.ok(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<AbbreviationsResponseDTO>> getAbbreviationsById(int abbreviationId) {
        return abbreviationRepository.findById(abbreviationId)
                .map(abbreviation -> {
                    ResponseMessage<AbbreviationsResponseDTO> responseMessage =
                            new ResponseMessage<>(HttpStatus.OK, Constant.ABBREVIATION_FOUND, mapper.toResponseDTO(abbreviation));
                    return ResponseEntity.ok(responseMessage);
                })
                .orElseGet(() -> {
                    ResponseMessage<AbbreviationsResponseDTO> responseMessage =
                            new ResponseMessage<>(HttpStatus.NOT_FOUND, Constant.ABBREVIATION_NOT_FOUND, null);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseMessage);
                });
    }

    @Override
    public ResponseEntity<ResponseMessage<AbbreviationsResponseDTO>> getAbbreviationsByName(String abbreviation) {
        return abbreviationRepository.findByAbbreviation(abbreviation)
                .map(abbreviationData -> {
                    ResponseMessage<AbbreviationsResponseDTO> responseMessage =
                            new ResponseMessage<>(HttpStatus.OK, Constant.ABBREVIATION_FOUND, mapper.toResponseDTO(abbreviationData));
                    return ResponseEntity.ok(responseMessage);
                })
                .orElseGet(() -> {
                    ResponseMessage<AbbreviationsResponseDTO> responseMessage =
                            new ResponseMessage<>(HttpStatus.NOT_FOUND, Constant.ABBREVIATION_NOT_FOUND, null);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseMessage);
                });
    }

    @Override
    public ResponseEntity<ResponseMessage<AbbreviationsResponseDTO>> updateAbbreviationsById(AbbreviationsRequestDTO dto, int abbreviationId) {
        if (dto == null)
            throw new EmptyObjectException(Constant.EMPTY_OBJECT);

        return abbreviationRepository.findById(abbreviationId)
                .map(existing -> {
                    existing.setAbbreviation(dto.getAbbreviation());
                    existing.setMeaning(dto.getMeaning());

                    Abbreviations updated = abbreviationRepository.save(existing);

                    ResponseMessage<AbbreviationsResponseDTO> responseMessage =
                            new ResponseMessage<>(HttpStatus.OK, Constant.ABBREVIATION_UPDATE_SUCCESS, mapper.toResponseDTO(updated));
                    return ResponseEntity.ok(responseMessage);
                })
                .orElseGet(() -> {
                    ResponseMessage<AbbreviationsResponseDTO> responseMessage =
                            new ResponseMessage<>(HttpStatus.NOT_FOUND, Constant.ABBREVIATION_UPDATE_FAIL, null);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseMessage);
                });
    }

    @Override
    public ResponseEntity<ResponseMessage<AbbreviationsResponseDTO>> deleteAbbreviationsById(int abbreviationId) {
        return abbreviationRepository.findById(abbreviationId)
                .map(existing -> {
                    abbreviationRepository.delete(existing);
                    ResponseMessage<AbbreviationsResponseDTO> responseMessage =
                            new ResponseMessage<>(HttpStatus.OK, Constant.ABBREVIATION_DELETE_SUCCESS, mapper.toResponseDTO(existing));
                    return ResponseEntity.ok(responseMessage);
                })
                .orElseGet(() -> {
                    ResponseMessage<AbbreviationsResponseDTO> responseMessage =
                            new ResponseMessage<>(HttpStatus.NOT_FOUND, Constant.ABBREVIATION_DELETE_FAIL, null);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseMessage);
                });
    }
}
