package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.responseDTO.MeetingResponseDTO;
import com.app.toastmasters.dto.responseDTO.MeetingRoleResponseDTO;
import com.app.toastmasters.dto.responseDTO.RoleResponseDTO;
import com.app.toastmasters.entity.*;
import com.app.toastmasters.exceptions.EmptyListException;
import com.app.toastmasters.exceptions.MeetingNotFoundException;
import com.app.toastmasters.exceptions.MemberNotFoundException;
import com.app.toastmasters.exceptions.RoleNotFoundException;
import com.app.toastmasters.mapper.MeetingMapper;
import com.app.toastmasters.mapper.MeetingRoleMapper;
import com.app.toastmasters.mapper.RoleMapper;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MeetingRoleServiceImpl implements MeetingRoleService{

    private final MeetingRoleRepository meetingRoleRepository;
    private final MeetingRepository meetingRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final AssignedRoleRepository assignedRoleRepository;
    private final MeetingRoleMapper mapper;
    private final RoleMapper roleMapper;
    private final MeetingMapper meetingMapper;

    public MeetingRoleServiceImpl(MeetingRoleRepository meetingRoleRepository, MeetingRepository meetingRepository, RoleRepository roleRepository, UserRepository userRepository, AssignedRoleRepository assignedRoleRepository, MeetingRoleMapper mapper, RoleMapper roleMapper, MeetingMapper meetingMapper) {
        this.meetingRoleRepository = meetingRoleRepository;
        this.meetingRepository = meetingRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.assignedRoleRepository = assignedRoleRepository;
        this.mapper = mapper;
        this.roleMapper = roleMapper;
        this.meetingMapper = meetingMapper;
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

    @Override
    public ResponseEntity<ResponseMessage<List<MeetingRoleHelper>>> getAllMeetingRoleCombineByMeeting(int meetingId) {

        Optional<Meeting> meeting = meetingRepository.findById(meetingId);
        if(meeting.isEmpty())
            throw new MeetingNotFoundException(Constant.MEETING_NOT_FOUND);

        Meeting meetingData = meeting.get();
        List<MeetingRole> meetingRoleList = meetingRoleRepository.findAllByMeeting(meetingData);

        List<MeetingRoleHelper> meetingRoleHelpers = new ArrayList<>();
        for(MeetingRole m : meetingRoleList)
        {
            Optional<Roles> role = roleRepository.findById(m.getRole().getRoleId());

            MeetingRoleHelper meetingRoleHelper = new MeetingRoleHelper();
            Roles roleData = role.get();

            meetingRoleHelper.setRoleId(roleData.getRoleId());
            meetingRoleHelper.setRoleName(roleData.getRoleName());
            meetingRoleHelper.setRoleDescription(roleData.getDescription());
            meetingRoleHelper.setRoleCount(m.getRoleCount());
            meetingRoleHelpers.add(meetingRoleHelper);
        }

        ResponseMessage<List<MeetingRoleHelper>> responseMessage =
                new ResponseMessage<List<MeetingRoleHelper>>(HttpStatus.OK, Constant.MEETING_FOUND,meetingRoleHelpers);
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<MeetingWithRolesDTO>>> getLast3MeetingRoles(int userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) throw new MemberNotFoundException(Constant.MEMBER_NOT_FOUND);

        User userData = user.get();
        List<AssignedRole> assignedRoles = assignedRoleRepository.findByUser(userData);
        if (assignedRoles.isEmpty()) throw new RoleNotFoundException(Constant.ROLE_NOT_FOUND);

        assignedRoles.sort(Comparator
                .comparing((AssignedRole ar) -> ar.getMeeting().getMeetingDate()).reversed()
                .thenComparing(ar -> ar.getMeeting().getStartTime(), Comparator.reverseOrder()));

        LocalDate todayDate = LocalDate.now();
        LocalTime todayTime = LocalTime.now();

        List<MeetingWithRolesDTO> result = new ArrayList<>();

        Integer prevMeetingId = null;
        Meeting prevMeeting = null;
        List<RoleResponseDTO> roles = new ArrayList<>();

        for (AssignedRole ar : assignedRoles) {
            if (ar.getMeeting().getMeetingDate().isAfter(todayDate) ||
                    (ar.getMeeting().getMeetingDate().isEqual(todayDate) &&
                            ar.getMeeting().getStartTime().isAfter(todayTime))) {
                continue;
            }

            Integer thisMeetingId = ar.getMeeting().getMeetingId();
            if (prevMeetingId == null) {
                prevMeetingId = thisMeetingId;
                prevMeeting = ar.getMeeting();
                roles.add(roleMapper.toResponseDto(ar.getRole()));
            } else if (prevMeetingId.equals(thisMeetingId)) {
                roles.add(roleMapper.toResponseDto(ar.getRole()));
            } else {
                result.add(new MeetingWithRolesDTO(meetingMapper.toDTO(prevMeeting), roles));
                roles = new ArrayList<>();
                prevMeetingId = thisMeetingId;
                prevMeeting = ar.getMeeting();
                roles.add(roleMapper.toResponseDto(ar.getRole()));
            }
        }

        if (prevMeeting != null && !roles.isEmpty()) {
            result.add(new MeetingWithRolesDTO(meetingMapper.toDTO(prevMeeting), roles));
        }

        // Only last 3
        List<MeetingWithRolesDTO> last3 = result.stream()
                .limit(3)
                .collect(Collectors.toList());

        ResponseMessage<List<MeetingWithRolesDTO>> responseMessage =
                new ResponseMessage<List<MeetingWithRolesDTO>>(HttpStatus.OK, Constant.FOUND_ALL_MEETING_ROLES, last3);

        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

}
