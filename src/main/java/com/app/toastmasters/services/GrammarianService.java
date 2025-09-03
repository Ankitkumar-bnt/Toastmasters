package com.app.toastmasters.services;

import com.app.toastmasters.dto.requestDTO.GrammarianRequestDTO;
import com.app.toastmasters.dto.responseDTO.GrammarianResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface GrammarianService {
    ResponseEntity<ResponseMessage<GrammarianResponseDTO>> addWordsForMeeting(GrammarianRequestDTO wordsData);

    ResponseEntity<ResponseMessage<List<GrammarianResponseDTO>>> getAllWordsData();

    ResponseEntity<ResponseMessage<GrammarianResponseDTO>> getWordsDataByUserAndMeeting(int userId, int meetingId);

    ResponseEntity<ResponseMessage<GrammarianResponseDTO>> updateWordsDataByUserAndMeeting(GrammarianRequestDTO dto, int userId, int meetingId);

    ResponseEntity<ResponseMessage<GrammarianResponseDTO>> deleteWordsDataByUserAndMeeting(int userId, int meetingId);
}
