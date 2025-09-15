package com.app.toastmasters.services;

import com.app.toastmasters.dto.responseDTO.GemOfMonthDTO;
import com.app.toastmasters.dto.responseDTO.UserResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface MeetingAwardsService {
    ResponseEntity<ResponseMessage<List<GemOfMonthDTO>>> gemOfTheMonth();
}
