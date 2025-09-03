package com.app.toastmasters.mapper;

import com.app.toastmasters.dto.requestDTO.SpeakerSpeechRequestDTO;
import com.app.toastmasters.dto.responseDTO.SpeakerSpeechResponseDTO;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.entity.agenda.SpeakerSpeech;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface SpeakerSpeechMapper {

    @Mappings({
            @Mapping(target = "user", expression = "java(mapUser(dto.getUserId()))"),
            @Mapping(target = "meeting", expression = "java(mapMeeting(dto.getMeetingId()))")
    })
    SpeakerSpeech toEntity(SpeakerSpeechRequestDTO dto);

    @Mappings({
            @Mapping(target = "userId", source = "user.userId"),
            @Mapping(target = "meetingId", source = "meeting.meetingId")
    })
    SpeakerSpeechResponseDTO toDTO(SpeakerSpeech entity);

    default User mapUser(int userId) {
        User user = new User();
        user.setUserId(userId);
        return user;
    }

    default Meeting mapMeeting(int meetingId) {
        Meeting meeting = new Meeting();
        meeting.setMeetingId(meetingId);
        return meeting;
    }
}
