package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.requestDTO.PreferredRoleRequestDTO;
import com.app.toastmasters.dto.responseDTO.PreferredRoleResponseDTO;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.PreferredRole;
import com.app.toastmasters.entity.Roles;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.exceptions.EmptyListException;
import com.app.toastmasters.exceptions.InvalidUserIdAndMeetingIdException;
import com.app.toastmasters.mapper.UserAdminAssignedRoleMapper;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.MeetingRepository;
import com.app.toastmasters.repository.PreferredRoleRepository;
import com.app.toastmasters.repository.RoleRepository;
import com.app.toastmasters.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PreferredRoleServiceImpl implements PreferredRoleService{

    private final PreferredRoleRepository preferredRoleRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final MeetingRepository meetingRepository;
    private final UserAdminAssignedRoleMapper mapper;

    public PreferredRoleServiceImpl(PreferredRoleRepository preferredRoleRepository, RoleRepository roleRepository,
                                    UserRepository userRepository, MeetingRepository meetingRepository,
                                    UserAdminAssignedRoleMapper mapper) {
        this.preferredRoleRepository = preferredRoleRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.meetingRepository = meetingRepository;
        this.mapper = mapper;
    }

    @Override
    public ResponseEntity<ResponseMessage<PreferredRoleResponseDTO>> addPreferredRole(
            List<String> preferredRoleList, int userId, int meetingId) {

        if(preferredRoleList.isEmpty()){
            throw new EmptyListException(Constant.PREFERRED_ROLE_ISEMPLTY);
        }

        Optional<User> user = userRepository.findById(userId);
        Optional<Meeting> meeting = meetingRepository.findById(meetingId);

        if(user.isEmpty() || meeting.isEmpty()){
            throw new InvalidUserIdAndMeetingIdException(Constant.INVALID_USERID_AND_MEETINGID);
        }
        User userData = user.get();
        Meeting meetingData = meeting.get();

        preferredRoleRepository.deleteAllByUserAndMeeting(userData, meetingData);

        List<PreferredRole> preferredRolesAddList = new ArrayList<>();

        for(String roleName : preferredRoleList){
            PreferredRole preferredRole = new PreferredRole();
            Roles roleData = roleRepository.findByRoleName(roleName);

            preferredRole.setRole(roleData);
            preferredRole.setUser(userData);
            preferredRole.setMeeting(meetingData);
            preferredRolesAddList.add(preferredRole);
        }
        List<PreferredRole> preferredRoles = preferredRoleRepository.saveAll(preferredRolesAddList);
        List<PreferredRoleResponseDTO> dtoList = preferredRoles.stream()
                .map(mapper::toPreferredRoleDTO)
                .collect(Collectors.toList());

        ResponseMessage<PreferredRoleResponseDTO> response = new ResponseMessage<>(HttpStatus.CREATED,
                Constant.ROLE_ASSIGNED_BY_MEMBER, dtoList);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<String>>> getMemberPreferredRole(int userId, int meetingId) {

        Optional<User> user = userRepository.findById(userId);
        Optional<Meeting> meeting = meetingRepository.findById(meetingId);

        if(user.isEmpty() || meeting.isEmpty()){
            throw new InvalidUserIdAndMeetingIdException(Constant.INVALID_USERID_AND_MEETINGID);
        }
        User userData = user.get();
        Meeting meetingData = meeting.get();

        List<Integer> memberPreferredRoles = preferredRoleRepository.findRoleIdsByUserAndMeeting(userData, meetingData);
        List<String> memberRoles = new ArrayList<>();
        for(Integer i : memberPreferredRoles){
            memberRoles.add(roleRepository.findRoleNameByRoleId(i));
        }
            ResponseMessage<List<String>> responseMessage =
                    new ResponseMessage<List<String>>(HttpStatus.OK,"",memberRoles);
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<String>> deleteMemberPreferredRole(List<String> deleteRoles, int userId, int meetingId) {
        if(deleteRoles.isEmpty()){
            throw new EmptyListException(Constant.DELETE_PREFERRED_ROLELIST_ISEMPLTY);
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
            preferredRoleRepository.deleteByUserAndMeetingAndRole(userData, meetingData,roleData);
        }
        ResponseMessage<String> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.PREFERRED_ROLE_DELETED, deleteRoles);
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }


}
