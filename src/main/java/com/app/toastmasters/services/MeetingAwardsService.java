package com.app.toastmasters.services;

import com.app.toastmasters.dto.requestDTO.GemOfMonthRequestDto;
import com.app.toastmasters.dto.responseDTO.GemOfMonthDTO;
import com.app.toastmasters.dto.responseDTO.UserResponseDTO;
import com.app.toastmasters.entity.GemOfMonth;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface MeetingAwardsService {

    ResponseEntity<ResponseMessage<List<GemOfMonthDTO>>> gemsOfTheLastMonth();

    ResponseEntity<ResponseMessage<GemOfMonthDTO>> selectGemOfMonth(GemOfMonthRequestDto gemOfMonth);

    ResponseEntity<ResponseMessage<List<GemOfMonthDTO>>> getAllGemOfMonth();

    ResponseEntity<ResponseMessage<List<GemOfMonthDTO>>> listAllLastMonthMembersWithCount();
}
