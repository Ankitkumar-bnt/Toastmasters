package com.app.toastmasters.services;

import com.app.toastmasters.dto.requestDTO.AbbreviationsRequestDTO;
import com.app.toastmasters.dto.responseDTO.AbbreviationsResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface AbbreviationService {
    ResponseEntity<ResponseMessage<AbbreviationsResponseDTO>> addAbbreviation(AbbreviationsRequestDTO abbreviations);

    ResponseEntity<ResponseMessage<List<AbbreviationsResponseDTO>>> getAllAbbreviations();

    ResponseEntity<ResponseMessage<AbbreviationsResponseDTO>> getAbbreviationsByName(String abbreviation);

    ResponseEntity<ResponseMessage<AbbreviationsResponseDTO>> getAbbreviationsById(int abbreviationId);

    ResponseEntity<ResponseMessage<AbbreviationsResponseDTO>> updateAbbreviationsById(AbbreviationsRequestDTO dto, int abbreviationId);

    ResponseEntity<ResponseMessage<AbbreviationsResponseDTO>> deleteAbbreviationsById(int abbreviationId);
}
