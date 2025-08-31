package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.responseDTO.MeetingResponseDTO;
import com.app.toastmasters.dto.responseDTO.MeetingRoleResponseDTO;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.MeetingRole;
import com.app.toastmasters.entity.Roles;
import com.app.toastmasters.exceptions.EmptyListException;
import com.app.toastmasters.exceptions.MeetingNotFoundException;
import com.app.toastmasters.exceptions.RoleNotFoundException;
import com.app.toastmasters.mapper.MeetingRoleMapper;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.MeetingRepository;
import com.app.toastmasters.repository.MeetingRoleRepository;
import com.app.toastmasters.repository.RoleRepository;
import com.app.toastmasters.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MeetingRoleServiceImpl implements MeetingRoleService{

    private final MeetingRoleRepository meetingRoleRepository;
    private final MeetingRepository meetingRepository;
    private final RoleRepository roleRepository;
    private final MeetingRoleMapper mapper;

    public MeetingRoleServiceImpl(MeetingRoleRepository meetingRoleRepository, MeetingRepository meetingRepository, RoleRepository roleRepository, MeetingRoleMapper mapper) {
        this.meetingRoleRepository = meetingRoleRepository;
        this.meetingRepository = meetingRepository;
        this.roleRepository = roleRepository;
        this.mapper = mapper;
    }

    @Override
    public ResponseEntity<ResponseMessage<List<MeetingRoleResponseDTO>>> addMeetingRoles(
            Map<String, Integer> roles, int meetingId) {

        if(roles == null || meetingId <=0)
            throw new EmptyListException(Constant.INVALID_USERID_AND_MEETINGID);

        Optional<Meeting> meeting = meetingRepository.findById(meetingId);

        if(meeting.isEmpty())
            throw new MeetingNotFoundException(Constant.MEETING_NOT_FOUND);

        Meeting meetingData = meeting.get();

        meetingRoleRepository.deleteAllByMeeting(meetingData);

        List<MeetingRole> meetingRoles = new ArrayList<>();

        for(Map.Entry<String, Integer> role : roles.entrySet())
        {
            Roles roleData = roleRepository.findByRoleName(role.getKey());
            if (roleData == null) {
                throw new RoleNotFoundException(Constant.ROLE_NOT_FOUND);
            }
            MeetingRole meetingRole = new MeetingRole();
            meetingRole.setRole(roleData);
            meetingRole.setMeeting(meetingData);
            meetingRole.setRoleCount(role.getValue());
            meetingRoles.add(meetingRole);
        }
        List<MeetingRole> assignedMeetingRoles = meetingRoleRepository.saveAll(meetingRoles);

        ResponseMessage<List<MeetingRoleResponseDTO>> responseMessage =
                new ResponseMessage<List<MeetingRoleResponseDTO>>(HttpStatus.OK, Constant.ROLES_ASSIGNED_TO_MEETING,
                        assignedMeetingRoles.stream()
                                .map(x->mapper.toDTO(x))
                                .collect(Collectors.toList()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<MeetingRoleResponseDTO>>> getAllMeetingRole() {
        List<MeetingRole> meetingRoles = meetingRoleRepository.findAll();

        if(meetingRoles == null)
            throw new EmptyListException(Constant.EMPTY_LIST);

        ResponseMessage<List<MeetingRoleResponseDTO>> responseMessage =
                new ResponseMessage<List<MeetingRoleResponseDTO>>(HttpStatus.OK, Constant.FOUND_ALL_MEETING_ROLES,
                        meetingRoles.stream()
                                .map(x->mapper.toDTO(x))
                                .collect(Collectors.toList()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<MeetingRoleResponseDTO>>> getAllMeetingRoleByMeetingId(int meetingId) {

        Optional<Meeting> meeting = meetingRepository.findById(meetingId);

        if(meeting.isEmpty())
            throw new MeetingNotFoundException(Constant.MEETING_NOT_FOUND);

        Meeting meetingData = meeting.get();

        List<MeetingRole> meetingRoles = meetingRoleRepository.findAllByMeeting(meetingData);

        if(meetingRoles == null)
            throw new EmptyListException(Constant.EMPTY_LIST);

        ResponseMessage<List<MeetingRoleResponseDTO>> responseMessage =
                new ResponseMessage<List<MeetingRoleResponseDTO>>(HttpStatus.OK, Constant.FOUND_ALL_MEETING_ROLES,
                        meetingRoles.stream()
                                .map(x->mapper.toDTO(x))
                                .collect(Collectors.toList()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<MeetingRoleResponseDTO>>> getAllMeetingRoleByMeetingTheme(String meetingTheme) {
        Optional<Meeting> meeting = meetingRepository.findByMeetingTheme(meetingTheme);

        if(meeting.isEmpty())
            throw new MeetingNotFoundException(Constant.MEETING_NOT_FOUND);

        Meeting meetingData = meeting.get();

        List<MeetingRole> meetingRoles = meetingRoleRepository.findAllByMeeting(meetingData);

        if(meetingRoles == null)
            throw new EmptyListException(Constant.EMPTY_LIST);

        ResponseMessage<List<MeetingRoleResponseDTO>> responseMessage =
                new ResponseMessage<List<MeetingRoleResponseDTO>>(HttpStatus.OK, Constant.FOUND_ALL_MEETING_ROLES,
                        meetingRoles.stream()
                                .map(x->mapper.toDTO(x))
                                .collect(Collectors.toList()));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }
}
