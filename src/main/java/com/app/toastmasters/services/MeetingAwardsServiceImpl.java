package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.responseDTO.GemOfMonthDTO;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.AvailableMembersRepository;
import com.app.toastmasters.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.List;
import java.util.Objects;

@Service
public class MeetingAwardsServiceImpl implements MeetingAwardsService {

    private final AvailableMembersRepository availableMembersRepository;
    private final UserRepository userRepository;

    public MeetingAwardsServiceImpl(AvailableMembersRepository availableMembersRepository,
                                    UserRepository userRepository) {
        this.availableMembersRepository = availableMembersRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ResponseEntity<ResponseMessage<List<GemOfMonthDTO>>> gemOfTheMonth() {
        List<Object[]> results = availableMembersRepository.findGemOfTheMonth();

        YearMonth currentYearMonth = YearMonth.now();

        List<GemOfMonthDTO> gems = results.stream()
                .map(r -> {
                    String month = (String) r[0]; // expected format: yyyy-MM
                    int userId = ((Number) r[1]).intValue();
                    int dayCount = ((Number) r[2]).intValue();

                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));

                    // skip admin users
                    if ("admin".equalsIgnoreCase(user.getUserType())) {
                        return null;
                    }

                    GemOfMonthDTO dto = new GemOfMonthDTO();
                    dto.setMonth(month);
                    dto.setDayCount(dayCount);

                    // set user directly, userType will be ignored in JSON
                    dto.setUser(user);

                    return dto;
                })
                .filter(Objects::nonNull) // remove skipped admins
                .filter(dto -> {
                    // keep only past months
                    YearMonth recordYearMonth = YearMonth.parse(dto.getMonth());
                    return recordYearMonth.isBefore(currentYearMonth);
                })
                .toList();

        ResponseMessage<List<GemOfMonthDTO>> responseMessage =
                new ResponseMessage<List<GemOfMonthDTO>>(HttpStatus.OK, Constant.GEM_OF_THE_MONTH, gems);

        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }
}
