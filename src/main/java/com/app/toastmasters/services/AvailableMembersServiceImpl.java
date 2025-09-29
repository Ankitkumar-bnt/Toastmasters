package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.responseDTO.AvailableMemberResponseDTO;
import com.app.toastmasters.entity.AvailableMembers;
import com.app.toastmasters.entity.Backouts;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.exceptions.EmptyListException;
import com.app.toastmasters.exceptions.EmptyObjectException;
import com.app.toastmasters.exceptions.InvalidUserIdAndMeetingIdException;
import com.app.toastmasters.exceptions.MemberNotFoundException;
import com.app.toastmasters.mapper.AvailableMemberMapper;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.AvailableMembersRepository;
import com.app.toastmasters.repository.BackoutRepository;
import com.app.toastmasters.repository.MeetingRepository;
import com.app.toastmasters.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailableMembersServiceImpl implements AvailableMembersService{

    private final AvailableMembersRepository availableMembersRepository;
    private final AvailableMemberMapper mapper;
    private final UserRepository userRepository;
    private final MeetingRepository meetingRepository;
    private final BackoutRepository backoutRepository;

    @Override
    public ResponseEntity<ResponseMessage<AvailableMemberResponseDTO>> addAvailabilityOfGuest(Integer userId, Integer meetingId) {
        Optional<User> user = userRepository.findById(userId);
        Optional<Meeting> meeting = meetingRepository.findById(meetingId);
        if(user.isEmpty() || meeting.isEmpty())
            throw new EmptyObjectException(Constant.EMPTY_OBJECT);

        User userData = user.get();
        Meeting meetingData = meeting.get();

        AvailableMembers members = new AvailableMembers();
        members.setDate(meetingData.getMeetingDate());
        members.setUser(userData);
        members.setMeeting(meetingData);
        members.setStatus(1);

        AvailableMembers availableMembers = availableMembersRepository.save(members);

        ResponseMessage<AvailableMemberResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.AVAILABILITY_MARKED_SUCCESS, mapper.toDTO(availableMembers));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    private void countBackouts(Integer availability, AvailableMembers availableMembers) {
        LocalDate meetingDate = availableMembers.getDate();
        LocalDate today = LocalDate.now();
        long diffDays = ChronoUnit.DAYS.between(today, meetingDate);

        if (diffDays <= 7 && diffDays >= 0) {
            Integer userId = availableMembers.getUser().getUserId();
            Integer meetingId = availableMembers.getMeeting().getMeetingId();

            if (availableMembers.getStatus() == 1 && availability != 1) {
                Backouts backout = new Backouts();
                backout.setUserId(userId);
                backout.setMeetingId(meetingId);
                backoutRepository.save(backout);
            }
            else if (availableMembers.getStatus() != 1 && availability == 1) {
                backoutRepository.deleteByUserIdAndMeetingId(userId, meetingId);
            }
        }
    }


    @Override
    public ResponseEntity<ResponseMessage<AvailableMemberResponseDTO>> markAvailability(
            Integer availability, Integer userId, Integer meetingId) {
        if(userId <=0 || meetingId <= 0)
            throw new InvalidUserIdAndMeetingIdException(Constant.INVALID_USERID_AND_MEETINGID);

        Optional<User> user = userRepository.findById(userId);
        Optional<Meeting> meeting = meetingRepository.findById(meetingId);

        if(user.isEmpty() || meeting.isEmpty())
            throw new InvalidUserIdAndMeetingIdException(Constant.INVALID_USERID_AND_MEETINGID);

        User userData = user.get();
        Meeting meetingData = meeting.get();

        AvailableMembers availableMembers = availableMembersRepository.findByUserAndMeeting(userData, meetingData);
        if(availableMembers != null)
        countBackouts(availability, availableMembers);// helper method calling

        availableMembers.setStatus(availability);

        AvailableMembers save = availableMembersRepository.save(availableMembers);
        save.setUser(userData);
        save.setMeeting(meetingData);

        ResponseMessage<AvailableMemberResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.AVAILABILITY_MARKED_SUCCESS, mapper.toDTO(save));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<AvailableMemberResponseDTO>>> getAllMemberAvailability() {
        List<AvailableMembers> allMembers = availableMembersRepository.findAll();

        if(allMembers.isEmpty())
            throw new EmptyListException(Constant.MEMBER_NOT_FOUND);

        ResponseMessage<List<AvailableMemberResponseDTO>> responseMessage =
                new ResponseMessage<List<AvailableMemberResponseDTO>>(HttpStatus.OK, Constant.FOUND_ALL_MEMBERS,
                        allMembers.stream()
                                .map(mapper::toDTO)
                                .collect(Collectors.toList()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<AvailableMemberResponseDTO>>> getUserAvailabilityByUserId(int userId) {
        Optional<User> user = userRepository.findById(userId);

        if(user == null)
            throw new MemberNotFoundException(Constant.MEMBER_NOT_FOUND);
        User userData = user.get();

        List<AvailableMembers> getAvailability = availableMembersRepository.findAllByUser(userData);

        if(getAvailability.isEmpty())
            throw new MemberNotFoundException(Constant.MEMBER_NOT_FOUND);

        ResponseMessage<List<AvailableMemberResponseDTO>> responseMessage =
                new ResponseMessage<List<AvailableMemberResponseDTO>>(HttpStatus.OK,
                        Constant.FOUND_ALL_AVAILABLE_MEMBER,
                        getAvailability.stream().map(x-> mapper.toDTO(x))
                                .collect(Collectors.toList()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<AvailableMemberResponseDTO>>> getAllMemberAvailabilityByMeetingId(int meetingId) {
        List<AvailableMembers> allMembers = availableMembersRepository.findAllByMeeting_MeetingId(meetingId);

        if (allMembers.isEmpty())
            throw new EmptyListException(Constant.MEMBER_NOT_FOUND);

        List<AvailableMemberResponseDTO> filteredMembers = allMembers.stream()
                .filter(member -> member.getStatus() == 1)
                .map(mapper::toDTO)
                .collect(Collectors.toList());

        if (filteredMembers.isEmpty())
            throw new EmptyListException(Constant.MEMBER_NOT_FOUND);

        ResponseMessage<List<AvailableMemberResponseDTO>> responseMessage =
                new ResponseMessage<List<AvailableMemberResponseDTO>>(HttpStatus.OK, Constant.FOUND_ALL_MEMBERS, filteredMembers);

        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }
}
