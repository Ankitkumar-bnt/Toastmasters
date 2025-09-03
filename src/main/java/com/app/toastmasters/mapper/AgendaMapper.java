package com.app.toastmasters.mapper;

import com.app.toastmasters.dto.requestDTO.AgendaRequestDTO;
import com.app.toastmasters.dto.responseDTO.AgendaResponseDTO;
import com.app.toastmasters.entity.Agenda;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AgendaMapper {
    AgendaMapper INSTANCE = Mappers.getMapper(AgendaMapper.class);

    @Mapping(target = "agendaId", ignore = true)
    @Mapping(target = "user", expression = "java(toUser(dto.getUserId()))")
    @Mapping(target = "meeting", expression = "java(toMeeting(dto.getMeetingId()))")
    Agenda toEntity(AgendaRequestDTO dto);

    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "meetingId", source = "meeting.meetingId")
    AgendaResponseDTO toDTO(Agenda agenda);

    default User toUser(int userId) {
        User user = new User();
        user.setUserId(userId);
        return user;
    }

    default Meeting toMeeting(int meetingId) {
        Meeting meeting = new Meeting();
        meeting.setMeetingId(meetingId);
        return meeting;
    }
}
