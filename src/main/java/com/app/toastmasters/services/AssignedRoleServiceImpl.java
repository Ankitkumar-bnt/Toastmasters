package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.responseDTO.AssignedRoleResponseDTO;
import com.app.toastmasters.dto.responseDTO.PreferredRoleResponseDTO;
import com.app.toastmasters.entity.*;
import com.app.toastmasters.exceptions.EmptyListException;
import com.app.toastmasters.exceptions.InvalidUserIdAndMeetingIdException;
import com.app.toastmasters.mapper.UserAdminAssignedRoleMapper;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AssignedRoleServiceImpl implements AssignedRoleService{

    private final AssignedRoleRepository assignedRoleRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final MeetingRepository meetingRepository;
    private final UserAdminAssignedRoleMapper mapper;

    public AssignedRoleServiceImpl(AssignedRoleRepository assignedRoleRepository, RoleRepository roleRepository,
                                    UserRepository userRepository, MeetingRepository meetingRepository,
                                    UserAdminAssignedRoleMapper mapper) {
        this.assignedRoleRepository = assignedRoleRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.meetingRepository = meetingRepository;
        this.mapper = mapper;
    }
    @Override
    public ResponseEntity<ResponseMessage<AssignedRoleResponseDTO>> addAssignedRole(List<String> assignedRoleList, int userId, int meetingId) {
        if(assignedRoleList.isEmpty()){
            throw new EmptyListException(Constant.PREFERRED_ROLE_ISEMPLTY);
        }

        Optional<User> user = userRepository.findById(userId);
        Optional<Meeting> meeting = meetingRepository.findById(meetingId);

        if(user.isEmpty() || meeting.isEmpty()){
            throw new InvalidUserIdAndMeetingIdException(Constant.INVALID_USERID_AND_MEETINGID);
        }
        User userData = user.get();
        Meeting meetingData = meeting.get();

        assignedRoleRepository.deleteAllByUserAndMeeting(userData, meetingData);

        List<AssignedRole> assignedRolesAddList = new ArrayList<>();

        for(String roleName : assignedRoleList){
            AssignedRole assignedRole = new AssignedRole();
            Roles roleData = roleRepository.findByRoleName(roleName);

            assignedRole.setRole(roleData);
            assignedRole.setUser(userData);
            assignedRole.setMeeting(meetingData);
            assignedRolesAddList.add(assignedRole);
        }

        List<AssignedRole> assignedRoles = assignedRoleRepository.saveAll(assignedRolesAddList);
        List<AssignedRoleResponseDTO> dtoList = assignedRoles.stream()
                .map(mapper::toAssignedRoleDTO)
                .collect(Collectors.toList());

        ResponseMessage<AssignedRoleResponseDTO> response = new ResponseMessage<>(HttpStatus.CREATED,
                Constant.ROLE_ASSIGNED_BY_MEMBER, dtoList);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<String>>> getMemberAssignedRole(int userId, int meetingId) {

        Optional<User> user = userRepository.findById(userId);
        Optional<Meeting> meeting = meetingRepository.findById(meetingId);

        if(user.isEmpty() || meeting.isEmpty()){
            throw new InvalidUserIdAndMeetingIdException(Constant.INVALID_USERID_AND_MEETINGID);
        }
        User userData = user.get();
        Meeting meetingData = meeting.get();
        List<Integer> memberAssignedRoles = assignedRoleRepository.findRoleIdsByUserAndMeeting(userData, meetingData);
        List<String> memberRoles = new ArrayList<>();
        for(Integer i : memberAssignedRoles){
            memberRoles.add(roleRepository.findRoleNameByRoleId(i));
        }
        ResponseMessage<List<String>> responseMessage =
                new ResponseMessage<List<String>>(HttpStatus.OK,"",memberRoles);
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<String>> deleteMemberAssignedRole(List<String> deleteRoles, int userId, int meetingId) {
        if(deleteRoles.isEmpty()){
            throw new EmptyListException(Constant.PREFERRED_ROLE_ISEMPLTY);
        }

        Optional<User> user = userRepository.findById(userId);
        Optional<Meeting> meeting = meetingRepository.findById(meetingId);

        if(user.isEmpty() || meeting.isEmpty()){
            throw new InvalidUserIdAndMeetingIdException(Constant.INVALID_USERID_AND_MEETINGID);
        }
        User userData = user.get();
        Meeting meetingData = meeting.get();

        for(String roleName : deleteRoles){

            Roles roleData = roleRepository.findByRoleName(roleName);
            assignedRoleRepository.deleteByUserAndMeetingAndRole(userData, meetingData,roleData);
        }
        ResponseMessage<String> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.PREFERRED_ROLE_DELETED, deleteRoles);
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }
}
