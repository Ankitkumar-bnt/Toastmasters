package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.requestDTO.GrammarianRequestDTO;
import com.app.toastmasters.dto.responseDTO.GrammarianResponseDTO;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.agenda.Grammarian;
import com.app.toastmasters.exceptions.EmptyListException;
import com.app.toastmasters.exceptions.EmptyObjectException;
import com.app.toastmasters.exceptions.MeetingNotFoundException;
import com.app.toastmasters.mapper.GrammarianMapper;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.GrammarianRepository;
import com.app.toastmasters.repository.MeetingRepository;
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
    private final MeetingRepository meetingRepository;

    public GrammarianServiceImpl(GrammarianRepository grammarianRepository, GrammarianMapper grammarianMapper, MeetingRepository meetingRepository) {
        this.grammarianRepository = grammarianRepository;
        this.grammarianMapper = grammarianMapper;
        this.meetingRepository = meetingRepository;
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

        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<GrammarianResponseDTO>>> getWordsDataByMeeting(int meetingId) {
        Optional<Meeting> meeting = meetingRepository.findById(meetingId);
        if(meeting.isEmpty())
            throw new MeetingNotFoundException(Constant.MEETING_NOT_FOUND);

        List<Grammarian> grammarians = grammarianRepository.findByMeeting(meeting.get());

        if (grammarians.isEmpty()) {
            throw new EmptyObjectException(Constant.GRAMMARIAN_NOT_FOUND);
        }

        ResponseMessage<List<GrammarianResponseDTO>> responseMessage =
                new ResponseMessage<List<GrammarianResponseDTO>>(HttpStatus.OK, Constant.GRAMMARIAN_FOUND,
                        grammarians.stream().map(x->grammarianMapper.toResponseDTO(x))
                                .collect(Collectors.toList()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<GrammarianResponseDTO>> updateWordsDataByMeeting(GrammarianRequestDTO dto, int meetingId, String wordType) {
        if (dto == null)
            throw new EmptyObjectException(Constant.EMPTY_OBJECT);

        List<Grammarian> grammarian = grammarianRepository.findByMeeting_MeetingId(meetingId);

        if (grammarian.isEmpty()) {
            throw new EmptyListException(Constant.EMPTY_LIST);
        }
        Grammarian grammarianData = null;

        if(grammarian.getFirst().getWordType().equals(wordType))
            grammarianData = grammarian.getFirst();
        else
            grammarianData = grammarian.getLast();

        Grammarian updatedEntity = grammarianMapper.toEntity(dto);
        updatedEntity.setGrammarianId(grammarianData.getGrammarianId());
        updatedEntity.setUser(grammarianData.getUser());
        updatedEntity.setMeeting(grammarianData.getMeeting());

        Grammarian updated = grammarianRepository.save(updatedEntity);

        GrammarianResponseDTO responseDTO = grammarianMapper.toResponseDTO(updated);
        return ResponseEntity.ok(new ResponseMessage<>(HttpStatus.OK, Constant.GRAMMARIAN_UPDATE_SUCCESS, responseDTO));
    }


    @Override
    public ResponseEntity<ResponseMessage<GrammarianResponseDTO>> deleteWordsDataByMeeting(int meetingId) {
        List<Grammarian> grammarians = grammarianRepository.findByMeeting_MeetingId(meetingId);

        if (grammarians.isEmpty()) {
            throw new EmptyListException(Constant.EMPTY_LIST);
        }

        grammarianRepository.deleteAllByMeeting_MeetingId(meetingId);

        return ResponseEntity.ok(new ResponseMessage<>(HttpStatus.OK, Constant.GRAMMARIAN_DELETE_SUCCESS, null));
    }
}
