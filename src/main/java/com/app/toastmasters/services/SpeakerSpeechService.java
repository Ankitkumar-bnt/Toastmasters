package com.app.toastmasters.services;

import com.app.toastmasters.dto.requestDTO.SpeakerSpeechRequestDTO;
import com.app.toastmasters.dto.responseDTO.SpeakerSpeechResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface SpeakerSpeechService {
    ResponseEntity<ResponseMessage<SpeakerSpeechResponseDTO>> addSpeakerSpeech(SpeakerSpeechRequestDTO speakerSpeechRequestDTO);

    ResponseEntity<ResponseMessage<List<SpeakerSpeechResponseDTO>>> getAllSpeakerSpeech();

    ResponseEntity<ResponseMessage<SpeakerSpeechResponseDTO>> getSpeakerSpeechByUserAndMeeting(int userId, int meetingId);

    ResponseEntity<ResponseMessage<SpeakerSpeechResponseDTO>> deleteSpeakerSpeechByUserAndMeeting(int userId, int meetingId);

    ResponseEntity<ResponseMessage<SpeakerSpeechResponseDTO>> updateSpeakerSpeechByUserAndMeeting(SpeakerSpeechRequestDTO speakerSpeechRequestDTO, int userId, int meetingId);
}
