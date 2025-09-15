package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.requestDTO.MeetingWinnerRequestDTO;
import com.app.toastmasters.dto.responseDTO.MeetingWinnerResponseDTO;
import com.app.toastmasters.entity.MeetingWinners;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.exceptions.EmptyListException;
import com.app.toastmasters.exceptions.EmptyObjectException;
import com.app.toastmasters.mapper.MeetingMapper;
import com.app.toastmasters.mapper.MeetingWinnerMapper;
import com.app.toastmasters.mapper.UserMapper;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.MeetingRepository;
import com.app.toastmasters.repository.MeetingWinnerRepository;
import com.app.toastmasters.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class MeetingWinnerServiceImpl implements MeetingWinnerService {

    private final MeetingWinnerRepository meetingWinnerRepository;
    private final MeetingWinnerMapper meetingWinnerMapper;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final MeetingRepository meetingRepository;
    private final MeetingMapper meetingMapper;

    @Override
    public ResponseEntity<ResponseMessage<MeetingWinnerResponseDTO>> addMeetingWinner(MeetingWinnerRequestDTO meetingWinnerRequestDTO) {
        if (meetingWinnerRequestDTO == null)
            throw new EmptyObjectException(Constant.EMPTY_OBJECT);

        MeetingWinners winners = meetingWinnerRepository.save(meetingWinnerMapper.toEntity(meetingWinnerRequestDTO));

        ResponseMessage<MeetingWinnerResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.CREATED, Constant.MEETING_WINNER_ADDED, meetingWinnerMapper.toResponseDTO(winners));
        return ResponseEntity.status(HttpStatus.CREATED).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<MeetingWinnerResponseDTO>>> getAllMeetingWinner() {
        List<MeetingWinners> meetingWinners = meetingWinnerRepository.findAll();
        if (meetingWinners.isEmpty())
            throw new EmptyListException(Constant.EMPTY_LIST);

        ResponseMessage<List<MeetingWinnerResponseDTO>> responseMessage =
                new ResponseMessage<List<MeetingWinnerResponseDTO>>(HttpStatus.OK, Constant.FOUND_ALL_MEETINGS,
                        meetingWinners.stream().map(meetingWinnerMapper::toResponseDTO).collect(Collectors.toList()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<MeetingWinnerResponseDTO>>> getAllMeetingWinnerByMeeting(int meetingId) {
        List<MeetingWinners> winners = meetingWinnerRepository.findByMeeting_MeetingId(meetingId);
        if (winners.isEmpty())
            throw new EmptyListException(Constant.EMPTY_LIST);

        ResponseMessage<List<MeetingWinnerResponseDTO>> responseMessage =
                new ResponseMessage<List<MeetingWinnerResponseDTO>>(HttpStatus.OK, Constant.FOUND_ALL_MEETING_WINNERS,
                        winners.stream().map(meetingWinnerMapper::toResponseDTO).collect(Collectors.toList()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<MeetingWinnerResponseDTO>>> getAllMeetingWinnerByUser(int userId) {
        List<MeetingWinners> winners = meetingWinnerRepository.findByUser_UserId(userId);
        if (winners.isEmpty())
            throw new EmptyListException(Constant.EMPTY_LIST);

        ResponseMessage<List<MeetingWinnerResponseDTO>> responseMessage =
                new ResponseMessage<List<MeetingWinnerResponseDTO>>(HttpStatus.OK, Constant.FOUND_ALL_USER_WINNERS,
                        winners.stream().map(meetingWinnerMapper::toResponseDTO).collect(Collectors.toList()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    @Transactional
    public ResponseEntity<ResponseMessage<MeetingWinnerResponseDTO>> updateMeetingWinnerByUserAndMeeting(
            MeetingWinnerRequestDTO dto, int userId, int meetingId) {

        MeetingWinners existingWinner = meetingWinnerRepository.findByUser_UserIdAndMeeting_MeetingId(userId, meetingId);
        if (existingWinner == null) {
            throw new EmptyObjectException(Constant.NOT_FOUND);
        }

        if (dto.getDescription() != null) {
            existingWinner.setDescription(dto.getDescription());
        }
        Optional<User> user = userRepository.findById(dto.getUserId());
        if(!user.isEmpty())
            existingWinner.setUser(user.get());

        MeetingWinners updated = meetingWinnerRepository.save(existingWinner);

        ResponseMessage<MeetingWinnerResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.MEETING_WINNER_UPDATED, meetingWinnerMapper.toResponseDTO(updated));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }


    @Override
    @Transactional
    public ResponseEntity<ResponseMessage<MeetingWinnerResponseDTO>> deleteMeetingWinnerByUserAndMeeting(int userId, int meetingId) {
        MeetingWinners existingWinner = meetingWinnerRepository.findByUser_UserIdAndMeeting_MeetingId(userId, meetingId);
        if (existingWinner == null)
            throw new EmptyObjectException(Constant.NOT_FOUND);

        meetingWinnerRepository.deleteByUser_UserIdAndMeeting_MeetingId(userId, meetingId);

        ResponseMessage<MeetingWinnerResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.MEETING_WINNER_DELETED, meetingWinnerMapper.toResponseDTO(existingWinner));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }
}
