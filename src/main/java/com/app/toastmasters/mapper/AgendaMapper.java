package com.app.toastmasters.mapper;

import com.app.toastmasters.dto.requestDTO.AgendaRequestDTO;
import com.app.toastmasters.dto.responseDTO.AgendaResponseDTO;
import com.app.toastmasters.entity.Agenda;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface AgendaMapper {
    AgendaMapper INSTANCE = Mappers.getMapper(AgendaMapper.class);

    @Mapping(target = "agendaId", ignore = true)
    @Mapping(target = "user", expression = "java(toUser(dto.getUserId()))")
    @Mapping(target = "meeting", expression = "java(toMeeting(dto.getMeetingId()))")
    @Mapping(target = "agendaSection", expression = "java(toAgendaSection(dto.getSectionId()))")
    Agenda toEntity(AgendaRequestDTO dto);

    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "meetingId", source = "meeting.meetingId")
    @Mapping(target = "sectionId", source = "agendaSection.sectionId")
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

    default com.app.toastmasters.entity.agenda.AgendaSection toAgendaSection(int sectionId) {
        com.app.toastmasters.entity.agenda.AgendaSection section = new com.app.toastmasters.entity.agenda.AgendaSection();
        section.setSectionId(sectionId);
        return section;
    }
}
