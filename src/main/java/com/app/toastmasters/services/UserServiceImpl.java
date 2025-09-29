package com.app.toastmasters.services;

import com.app.toastmasters.dto.responseDTO.GuestResponseDto;
import com.app.toastmasters.entity.AvailableMembers;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.exceptions.EmptyListException;
import com.app.toastmasters.exceptions.MemberNotFoundException;
import com.app.toastmasters.repository.AvailableMembersRepository;
import com.app.toastmasters.repository.MeetingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.requestDTO.UserRequestDTO;
import com.app.toastmasters.dto.responseDTO.UserResponseDTO;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.mapper.UserMapper;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.UserRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepo;
    private final UserMapper mapper;
    private final MeetingRepository meetingRepository;
    private final AvailableMembersRepository availableMembersRepository;

    public UserServiceImpl(UserRepository userRepo, UserMapper mapper, MeetingRepository meetingRepository, AvailableMembersRepository availableMembersRepository) {
        this.userRepo = userRepo;
        this.mapper = mapper;
        this.meetingRepository = meetingRepository;
        this.availableMembersRepository = availableMembersRepository;
    }

    @Override
    public ResponseEntity<ResponseMessage<UserResponseDTO>> addMember(UserRequestDTO userRequestDTO) {
      
        User savedUser = userRepo.save(mapper.toEntity(userRequestDTO));

        if(!savedUser.getUserType().equalsIgnoreCase("guest")) {
            List<Meeting> meetings = meetingRepository.findByMeetingDateGreaterThanEqual(LocalDate.now());

            List<AvailableMembers> members = new ArrayList<>();
            for (Meeting m : meetings) {
                AvailableMembers availableMembers = new AvailableMembers();
                availableMembers.setUser(savedUser);
                availableMembers.setDate(m.getMeetingDate());
                availableMembers.setMeeting(m);
                members.add(availableMembers);
            }
            List<AvailableMembers> availableMembersList = availableMembersRepository.saveAll(members);

            if (availableMembersList.isEmpty())
                throw new EmptyListException(Constant.EMPTY_LIST);
        }

        ResponseMessage<UserResponseDTO> responseMessage =
                    new ResponseMessage<>(HttpStatus.CREATED, Constant.MEMBER_ADDED_SUCCESS, mapper.toResponseDTO(savedUser));

            return ResponseEntity.status(HttpStatus.CREATED).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<UserResponseDTO>>> getAllMember(){
        List<User> allMembers = userRepo.findAll();

        if(allMembers.isEmpty()) {
            throw new MemberNotFoundException(Constant.MEMBER_NOT_FOUND);
        }
        ResponseMessage<List<UserResponseDTO>> responseMessage =
                new ResponseMessage<List<UserResponseDTO>>(HttpStatus.OK, Constant.FOUND_ALL_MEMBERS,
                        allMembers.stream()
                                .map(mapper::toResponseDTO)
                                .collect(Collectors.toList()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<UserResponseDTO>> updateMember(Integer userId, UserRequestDTO userRequestDTO) {
        Optional<User> memberById = userRepo.findById(userId);

        if (memberById.isEmpty()) {
            throw new MemberNotFoundException(Constant.MEMBER_NOT_FOUND);
        }

        User user = memberById.get();
        boolean isGuest = "guest".equalsIgnoreCase(user.getUserType());

        if (userRequestDTO.getUserName() != null)
            user.setUserName(userRequestDTO.getUserName());

        if (userRequestDTO.getUserEmail() != null)
            user.setUserEmail(userRequestDTO.getUserEmail());

        if (userRequestDTO.getUserContact() != null)
            user.setUserContact(userRequestDTO.getUserContact());

        if (userRequestDTO.getUserPassword() != null && !isGuest)
            user.setUserPassword(userRequestDTO.getUserPassword());

        if (userRequestDTO.getAddress() != null && !isGuest)
            user.setAddress(userRequestDTO.getAddress());

        if (userRequestDTO.getGender() != null)
            user.setGender(userRequestDTO.getGender());

        if (userRequestDTO.getDob() != null)
            user.setDob(userRequestDTO.getDob());

        if (userRequestDTO.getHobbies() != null && !isGuest)
            user.setHobbies(userRequestDTO.getHobbies());

        if (userRequestDTO.getUserType() != null)
            user.setUserType(userRequestDTO.getUserType());

        if (userRequestDTO.getMentorId() != null && !isGuest)
            user.setMentorId(userRequestDTO.getMentorId());

        User updatedMember = userRepo.save(user);

        ResponseMessage<UserResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.MEMBER_UPDATE_SUCCESS, mapper.toResponseDTO(updatedMember));

        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<UserResponseDTO>> deleteMember(Integer userId) {

        Optional<User> memberById = userRepo.findById(userId);

        if(memberById.isEmpty())
        {
            throw new MemberNotFoundException(Constant.MEMBER_NOT_FOUND);
        }
        User user = memberById.get();
        int i = userRepo.deleteMemberById(user.getUserId());

        if(i<=0)
            throw new MemberNotFoundException(Constant.MEMBER_DELETE_FAILS);

        user.setDeleteStatus(0);
        ResponseMessage<UserResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.MEMBER_DELETE_SUCCESS, mapper.toResponseDTO(user));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<UserResponseDTO>> getUserById(int userId) {
        Optional<User> user = userRepo.findById(userId);
        if(user.isEmpty())
            throw new MemberNotFoundException(Constant.MEMBER_NOT_FOUND);
        User userData = user.get();
        ResponseMessage<UserResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.FOUND_ALL_MEMBERS, mapper.toResponseDTO(userData));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<GuestResponseDto>>> getAllGuest() {
        List<User> allMembers = userRepo.findByUserType("guest");

        if (allMembers.isEmpty()) {
            throw new MemberNotFoundException(Constant.MEMBER_NOT_FOUND);
        }

        List<GuestResponseDto> guestList = allMembers.stream()
                .map(user -> {
                    GuestResponseDto dto = new GuestResponseDto();
                    dto.setUserId(user.getUserId());
                    dto.setUserName(user.getUserName());
                    dto.setUserEmail(user.getUserEmail());
                    dto.setUserContact(user.getUserContact());
                    dto.setGender(user.getGender());
                    dto.setDob(user.getDob());
                    dto.setUserType(user.getUserType());
                    dto.setDeleteStatus(user.getDeleteStatus());
                    return dto;
                })
                .collect(Collectors.toList());

        ResponseMessage<List<GuestResponseDto>> responseMessage =
                new ResponseMessage<List<GuestResponseDto>>(HttpStatus.OK, Constant.FOUND_ALL_MEMBERS, guestList);

        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }


}

