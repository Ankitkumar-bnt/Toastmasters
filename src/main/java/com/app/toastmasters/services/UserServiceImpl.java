package com.app.toastmasters.services;

import com.app.toastmasters.exceptions.MemberNotFoundException;
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

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepo;
    private final UserMapper mapper;

    public UserServiceImpl(UserRepository userRepo, UserMapper mapper) {
        this.userRepo = userRepo;
        this.mapper = mapper;
    }

    @Override
    public ResponseEntity<ResponseMessage<UserResponseDTO>> addMember(UserRequestDTO userRequestDTO) {
      
            User savedUser = userRepo.save(mapper.toEntity(userRequestDTO));
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

    public ResponseEntity<ResponseMessage<List<UserResponseDTO>>> getAllMembers() {
        List<User> allMembers = userRepo.findByDeleteStatus(Constant.DELETE_STATUS_ACTIVE);

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
    public ResponseEntity<ResponseMessage<UserResponseDTO>> updateMember(Integer userId ,UserRequestDTO userRequestDTO) {

        Optional<User> memberById = userRepo.findById(userId);

        if(memberById.isEmpty())
        {
            throw new MemberNotFoundException(Constant.MEMBER_NOT_FOUND);
        }
        User user = memberById.get();

        if(userRequestDTO.getUserName() != null)
            user.setUserName(userRequestDTO.getUserName());

        if (userRequestDTO.getUserEmail() != null)
            user.setUserEmail(userRequestDTO.getUserEmail());

        if (userRequestDTO.getUserContact() != null)
            user.setUserContact(userRequestDTO.getUserContact());

        if (userRequestDTO.getUserPassword() != null)
            user.setUserPassword(userRequestDTO.getUserPassword());

        if (userRequestDTO.getAddress() != null)
            user.setAddress(userRequestDTO.getAddress());

        if (userRequestDTO.getGender() != null)
            user.setGender(userRequestDTO.getGender());

        if (userRequestDTO.getDob() != null)
            user.setDob(userRequestDTO.getDob());

        if (userRequestDTO.getHobbies() != null)
            user.setHobbies(userRequestDTO.getHobbies());

        if (userRequestDTO.getUserType() != null)
            user.setUserType(userRequestDTO.getUserType());

        if (userRequestDTO.getMentorId() != null)
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

}

