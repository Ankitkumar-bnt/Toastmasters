package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.responseDTO.GemOfMonthDTO;
import com.app.toastmasters.dto.responseDTO.UserResponseDTO;
import com.app.toastmasters.entity.AvailableMembers;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.AvailableMembersRepository;
import com.app.toastmasters.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MeetingAwardsServiceImpl implements MeetingAwardsService{

    private final AvailableMembersRepository availableMembersRepository;
    private final UserRepository userRepository;

    public MeetingAwardsServiceImpl(AvailableMembersRepository availableMembersRepository, UserRepository userRepository) {
        this.availableMembersRepository = availableMembersRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ResponseEntity<ResponseMessage<List<GemOfMonthDTO>>> gemOfTheMonth() {
        List<Object[]> results = availableMembersRepository.findGemOfTheMonth();

        List<GemOfMonthDTO> gems = results.stream()
                .map(r -> {
                    String month = (String) r[0];
                    int userId = ((Number) r[1]).intValue();
                    int dayCount = ((Number) r[2]).intValue();

                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));

                    GemOfMonthDTO dto = new GemOfMonthDTO();
                    dto.setMonth(month);
                    dto.setUser(user);
                    dto.setDayCount(dayCount);
                    return dto;
                })
                .toList();
    ResponseMessage<List<GemOfMonthDTO>> responseMessage =
            new ResponseMessage<List<GemOfMonthDTO>>(HttpStatus.OK, Constant.GEM_OF_THE_MONTH, gems);
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

}
