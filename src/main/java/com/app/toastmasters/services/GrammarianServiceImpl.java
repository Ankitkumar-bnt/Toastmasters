package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.requestDTO.GrammarianRequestDTO;
import com.app.toastmasters.dto.responseDTO.GrammarianResponseDTO;
import com.app.toastmasters.entity.agenda.Grammarian;
import com.app.toastmasters.exceptions.EmptyObjectException;
import com.app.toastmasters.mapper.GrammarianMapper;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.GrammarianRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GrammarianServiceImpl implements GrammarianService {

    private final GrammarianRepository grammarianRepository;
    private final GrammarianMapper grammarianMapper;

    public GrammarianServiceImpl(GrammarianRepository grammarianRepository, GrammarianMapper grammarianMapper) {
        this.grammarianRepository = grammarianRepository;
        this.grammarianMapper = grammarianMapper;
    }

    @Override
    public ResponseEntity<ResponseMessage<GrammarianResponseDTO>> addWordsForMeeting(GrammarianRequestDTO wordsData) {
        if (wordsData == null)
            throw new EmptyObjectException(Constant.EMPTY_OBJECT);

        Grammarian grammarian = grammarianRepository.save(grammarianMapper.toEntity(wordsData));

        ResponseMessage<GrammarianResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.CREATED, Constant.GRAMMARIAN_ADDED_SUCCESS, grammarianMapper.toResponseDTO(grammarian));

        return ResponseEntity.status(HttpStatus.CREATED).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<GrammarianResponseDTO>>> getAllWordsData() {
        List<Grammarian> grammarians = grammarianRepository.findAll();

        List<GrammarianResponseDTO> dtoList = grammarians.stream()
                .map(grammarianMapper::toResponseDTO)
                .collect(Collectors.toList());

        ResponseMessage<List<GrammarianResponseDTO>> responseMessage =
                new ResponseMessage<List<GrammarianResponseDTO>>(HttpStatus.OK, Constant.GRAMMARIAN_FOUND_ALL, dtoList);

        return ResponseEntity.ok(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<GrammarianResponseDTO>> getWordsDataByUserAndMeeting(int userId, int meetingId) {
        Optional<Grammarian> optional = grammarianRepository.findByUser_UserIdAndMeeting_MeetingId(userId, meetingId);

        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseMessage<>(HttpStatus.NOT_FOUND, Constant.GRAMMARIAN_NOT_FOUND, null));
        }

        GrammarianResponseDTO dto = grammarianMapper.toResponseDTO(optional.get());
        return ResponseEntity.ok(new ResponseMessage<>(HttpStatus.OK, Constant.GRAMMARIAN_FOUND, dto));
    }

    @Override
    public ResponseEntity<ResponseMessage<GrammarianResponseDTO>> updateWordsDataByUserAndMeeting(GrammarianRequestDTO dto, int userId, int meetingId) {
        if (dto == null)
            throw new EmptyObjectException(Constant.EMPTY_OBJECT);

        Optional<Grammarian> optional = grammarianRepository.findByUser_UserIdAndMeeting_MeetingId(userId, meetingId);

        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseMessage<>(HttpStatus.NOT_FOUND, Constant.GRAMMARIAN_UPDATE_FAIL, null));
        }

        Grammarian existing = optional.get();

        Grammarian updatedEntity = grammarianMapper.toEntity(dto);
        updatedEntity.setGrammarianId(existing.getGrammarianId());
        updatedEntity.setUser(existing.getUser());
        updatedEntity.setMeeting(existing.getMeeting());

        Grammarian updated = grammarianRepository.save(updatedEntity);

        GrammarianResponseDTO responseDTO = grammarianMapper.toResponseDTO(updated);
        return ResponseEntity.ok(new ResponseMessage<>(HttpStatus.OK, Constant.GRAMMARIAN_UPDATE_SUCCESS, responseDTO));
    }


    @Override
    public ResponseEntity<ResponseMessage<GrammarianResponseDTO>> deleteWordsDataByUserAndMeeting(int userId, int meetingId) {
        Optional<Grammarian> optional = grammarianRepository.findByUser_UserIdAndMeeting_MeetingId(userId, meetingId);

        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseMessage<>(HttpStatus.NOT_FOUND, Constant.GRAMMARIAN_DELETE_FAIL, null));
        }

        grammarianRepository.delete(optional.get());

        return ResponseEntity.ok(new ResponseMessage<>(HttpStatus.OK, Constant.GRAMMARIAN_DELETE_SUCCESS, null));
    }
}
