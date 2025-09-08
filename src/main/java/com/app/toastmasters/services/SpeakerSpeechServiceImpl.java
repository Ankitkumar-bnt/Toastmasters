package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.requestDTO.SpeakerSpeechRequestDTO;
import com.app.toastmasters.dto.responseDTO.SpeakerSpeechResponseDTO;
import com.app.toastmasters.entity.agenda.SpeakerSpeech;
import com.app.toastmasters.exceptions.EmptyObjectException;
import com.app.toastmasters.exceptions.SpeakerSpeechNotFoundException;
import com.app.toastmasters.mapper.SpeakerSpeechMapper;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.SpeakerSpeechRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SpeakerSpeechServiceImpl implements SpeakerSpeechService {

    private final SpeakerSpeechRepository speakerSpeechRepository;
    private final SpeakerSpeechMapper mapper;

    public SpeakerSpeechServiceImpl(SpeakerSpeechRepository speakerSpeechRepository, SpeakerSpeechMapper mapper) {
        this.speakerSpeechRepository = speakerSpeechRepository;
        this.mapper = mapper;
    }

    @Override
    public ResponseEntity<ResponseMessage<SpeakerSpeechResponseDTO>> addSpeakerSpeech(SpeakerSpeechRequestDTO speakerSpeechRequestDTO) {
        if (speakerSpeechRequestDTO == null)
            throw new EmptyObjectException(Constant.EMPTY_OBJECT);

        SpeakerSpeech speakerSpeech = speakerSpeechRepository.save(mapper.toEntity(speakerSpeechRequestDTO));
        ResponseMessage<SpeakerSpeechResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.SPEAKER_SPEECH_ADDED, mapper.toDTO(speakerSpeech));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<SpeakerSpeechResponseDTO>>> getAllSpeakerSpeech() {
        List<SpeakerSpeech> allSpeeches = speakerSpeechRepository.findAll();

        List<SpeakerSpeechResponseDTO> dtoList = allSpeeches.stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());

        ResponseMessage<List<SpeakerSpeechResponseDTO>> responseMessage =
                new ResponseMessage<List<SpeakerSpeechResponseDTO>>(HttpStatus.OK, Constant.FOUND_ALL_SPEAKER_SPEECH, dtoList);
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<SpeakerSpeechResponseDTO>> getSpeakerSpeechByMeeting(int meetingId) {
        Optional<SpeakerSpeech> optionalSpeech = speakerSpeechRepository.findByMeeting_MeetingId(meetingId);

        if (optionalSpeech.isEmpty())
            throw new SpeakerSpeechNotFoundException(Constant.SPEAKER_SPEECH_NOT_FOUND);

        ResponseMessage<SpeakerSpeechResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.FOUND_SPEAKER_SPEECH, mapper.toDTO(optionalSpeech.get()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<SpeakerSpeechResponseDTO>> deleteSpeakerSpeechByMeeting(int meetingId) {
        Optional<SpeakerSpeech> optionalSpeech = speakerSpeechRepository.findByMeeting_MeetingId(meetingId);

        if (optionalSpeech.isEmpty())
            throw new SpeakerSpeechNotFoundException(Constant.SPEAKER_SPEECH_NOT_FOUND);

        speakerSpeechRepository.delete(optionalSpeech.get());

        ResponseMessage<SpeakerSpeechResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.SPEAKER_SPEECH_DELETED, mapper.toDTO(optionalSpeech.get()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<SpeakerSpeechResponseDTO>> updateSpeakerSpeechByMeeting(
            SpeakerSpeechRequestDTO speakerSpeechRequestDTO, int meetingId) {

        if (speakerSpeechRequestDTO == null) {
            throw new EmptyObjectException(Constant.EMPTY_OBJECT);
        }

        Optional<SpeakerSpeech> optionalSpeech =
                speakerSpeechRepository.findByMeeting_MeetingId(meetingId);

        if (optionalSpeech.isEmpty()) {
            throw new SpeakerSpeechNotFoundException(Constant.SPEAKER_SPEECH_NOT_FOUND);
        }

        SpeakerSpeech existingSpeech = optionalSpeech.get();

        if (speakerSpeechRequestDTO.getPathwaysTrack() != null)
            existingSpeech.setPathwaysTrack(speakerSpeechRequestDTO.getPathwaysTrack());

        if (speakerSpeechRequestDTO.getLevel() > 0)
            existingSpeech.setLevel(speakerSpeechRequestDTO.getLevel());

        if (speakerSpeechRequestDTO.getProjectNo() > 0)
            existingSpeech.setProjectNo(speakerSpeechRequestDTO.getProjectNo());

        if (speakerSpeechRequestDTO.getMaxSpeechTime() > 0)
            existingSpeech.setMaxSpeechTime(speakerSpeechRequestDTO.getMaxSpeechTime());

        if (speakerSpeechRequestDTO.getMinSpeechTime() > 0)
            existingSpeech.setMinSpeechTime(speakerSpeechRequestDTO.getMinSpeechTime());

        if (speakerSpeechRequestDTO.getTitle() != null)
            existingSpeech.setTitle(speakerSpeechRequestDTO.getTitle());

        if (speakerSpeechRequestDTO.getObjective() != null)
            existingSpeech.setObjective(speakerSpeechRequestDTO.getObjective());

        SpeakerSpeech updatedSpeech = speakerSpeechRepository.save(existingSpeech);

        ResponseMessage<SpeakerSpeechResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.SPEAKER_SPEECH_UPDATED, mapper.toDTO(updatedSpeech));

        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

}
