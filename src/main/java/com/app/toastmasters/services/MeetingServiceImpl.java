package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.requestDTO.AvailableMembersRequestDTO;
import com.app.toastmasters.dto.requestDTO.MeetingRequestDTO;
import com.app.toastmasters.dto.responseDTO.MeetingResponseDTO;
import com.app.toastmasters.dto.responseDTO.UserResponseDTO;
import com.app.toastmasters.entity.AvailableMembers;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.exceptions.MeetingNotFoundException;
import com.app.toastmasters.mapper.MeetingMapper;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.AvailableMembersRepository;
import com.app.toastmasters.repository.MeetingRepository;
import com.app.toastmasters.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MeetingServiceImpl implements MeetingService {

    private final MeetingRepository meetingRepo;
    private final AvailableMembersRepository availableMembersRepository;
    private final UserRepository userRepo;
    private final MeetingMapper mapper;

    public MeetingServiceImpl(MeetingRepository meetingRepo, MeetingMapper mapper, AvailableMembersRepository availableMembersRepository, UserRepository userRepo) {
        this.meetingRepo = meetingRepo;
        this.availableMembersRepository = availableMembersRepository;
        this.userRepo = userRepo;
        this.mapper = mapper;
    }

    public void setupInitialAvailableMembersForMeeting(Meeting meeting) {
        List<User> allUsers = userRepo.findAll();
        List<AvailableMembers> availableList = new ArrayList<>();

        for (User user : allUsers) {
            AvailableMembers availableMember = new AvailableMembers();
            availableMember.setUser(user);
            availableMember.setMeeting(meeting);
            availableMember.setDate(LocalDate.now()); // or meeting.getDate()
            availableMember.setStatus(-1); // unseen
            availableList.add(availableMember);
        }
        availableMembersRepository.saveAll(availableList);
    }
    @Override
    public ResponseEntity<ResponseMessage<MeetingResponseDTO>> addMeeting(MeetingRequestDTO meetingRequestDTO) {
        Meeting savedMeeting = meetingRepo.save(mapper.toEntity(meetingRequestDTO));

        if(savedMeeting != null)
            setupInitialAvailableMembersForMeeting(savedMeeting);

        ResponseMessage<MeetingResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.CREATED, Constant.MEETING_ADDED_SUCCESS, mapper.toDTO(savedMeeting));
        return ResponseEntity.status(HttpStatus.CREATED).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<MeetingResponseDTO>>> getAllMeetings() {
        List<Meeting> meetings = meetingRepo.findAll();
        if (meetings.isEmpty()) {
            throw new MeetingNotFoundException(Constant.MEETING_NOT_FOUND);
        }

        List<MeetingResponseDTO> dtoList = meetings.stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());

        ResponseMessage<List<MeetingResponseDTO>> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.FOUND_ALL_MEETINGS, dtoList);

        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }


    @Override
    public ResponseEntity<ResponseMessage<MeetingResponseDTO>> getMeetingById(Integer meetingId) {
        Optional<Meeting> meetingById = meetingRepo.findById(meetingId);
        if (meetingById.isEmpty()) {
            throw new MeetingNotFoundException(Constant.MEETING_NOT_FOUND);
        }
        ResponseMessage<MeetingResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.MEETING_FOUND, mapper.toDTO(meetingById.get()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<MeetingResponseDTO>> updateMeeting(Integer meetingId, MeetingRequestDTO meetingRequestDTO) {
        Optional<Meeting> meetingById = meetingRepo.findById(meetingId);
        if (meetingById.isEmpty()) {
            throw new MeetingNotFoundException(Constant.MEETING_NOT_FOUND);
        }
        Meeting meeting = meetingById.get();

        if (meetingRequestDTO.getMeetingDate() != null)
            meeting.setMeetingDate(meetingRequestDTO.getMeetingDate());
        if (meetingRequestDTO.getStartTime() != null)
            meeting.setStartTime(meetingRequestDTO.getStartTime());
        if (meetingRequestDTO.getEndTime() != null)
            meeting.setEndTime(meetingRequestDTO.getEndTime());
        if (meetingRequestDTO.getMeetingTheme() != null)
            meeting.setMeetingTheme(meetingRequestDTO.getMeetingTheme());
        if (meetingRequestDTO.getMeetingLocation() != null)
            meeting.setMeetingLocation(meetingRequestDTO.getMeetingLocation());

        Meeting updatedMeeting = meetingRepo.save(meeting);
        ResponseMessage<MeetingResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.MEETING_UPDATE_SUCCESS, mapper.toDTO(updatedMeeting));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<MeetingResponseDTO>> deleteMeeting(Integer meetingId) {
        Optional<Meeting> meetingById = meetingRepo.findById(meetingId);
        if (meetingById.isEmpty()) {
            throw new MeetingNotFoundException(Constant.MEETING_NOT_FOUND);
        }

        meetingRepo.deleteById(meetingId);

        if (meetingRepo.findById(meetingId).isPresent()) {
            throw new MeetingNotFoundException(Constant.MEETING_DELETE_FAILS);
        }

        ResponseMessage<MeetingResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.MEETING_DELETE_SUCCESS, mapper.toDTO(meetingById.get()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }
}
