package com.app.toastmasters.services;

import com.app.toastmasters.dto.requestDTO.SpeakerSpeechRequestDTO;
import com.app.toastmasters.dto.responseDTO.SpeakerSpeechResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface SpeakerSpeechService {
    ResponseEntity<ResponseMessage<SpeakerSpeechResponseDTO>> addSpeakerSpeech(SpeakerSpeechRequestDTO speakerSpeechRequestDTO);

    ResponseEntity<ResponseMessage<List<SpeakerSpeechResponseDTO>>> getAllSpeakerSpeech();

    ResponseEntity<ResponseMessage<List<SpeakerSpeechResponseDTO>>> getSpeakerSpeechByMeeting(int meetingId);

    ResponseEntity<ResponseMessage<SpeakerSpeechResponseDTO>> deleteSpeakerSpeechByMeeting(int userId, int meetingId);

    ResponseEntity<ResponseMessage<SpeakerSpeechResponseDTO>> updateSpeakerSpeechByMeeting(SpeakerSpeechRequestDTO speakerSpeechRequestDTO, int userId, int meetingId);
}
