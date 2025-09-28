package com.app.toastmasters.services;

import com.app.toastmasters.dto.responseDTO.AvailableMemberResponseDTO;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface AvailableMembersService {
    ResponseEntity<ResponseMessage<AvailableMemberResponseDTO>> markAvailability(
            Integer availability, Integer userId, Integer meetingId);

    ResponseEntity<ResponseMessage<List<AvailableMemberResponseDTO>>> getAllMemberAvailability();

    ResponseEntity<ResponseMessage<List<AvailableMemberResponseDTO>>> getUserAvailabilityByUserId(int userId);

    ResponseEntity<ResponseMessage<List<AvailableMemberResponseDTO>>> getAllMemberAvailabilityByMeetingId(int meetingId);

    ResponseEntity<ResponseMessage<AvailableMemberResponseDTO>> addAvailabilityOfGuest(Integer userId, Integer meetingId);
}
