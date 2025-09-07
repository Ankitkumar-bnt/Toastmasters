package com.app.toastmasters.services;

import com.app.toastmasters.dto.requestDTO.GrammarianRequestDTO;
import com.app.toastmasters.dto.responseDTO.GrammarianResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface GrammarianService {
    ResponseEntity<ResponseMessage<GrammarianResponseDTO>> addWordsForMeeting(GrammarianRequestDTO wordsData);

    ResponseEntity<ResponseMessage<List<GrammarianResponseDTO>>> getAllWordsData();

    ResponseEntity<ResponseMessage<List<GrammarianResponseDTO>>> getWordsDataByMeeting(int meetingId);

    ResponseEntity<ResponseMessage<GrammarianResponseDTO>> updateWordsDataByMeeting(GrammarianRequestDTO dto, int meetingId, String wordType);

    ResponseEntity<ResponseMessage<GrammarianResponseDTO>> deleteWordsDataByMeeting(int meetingId);
}
