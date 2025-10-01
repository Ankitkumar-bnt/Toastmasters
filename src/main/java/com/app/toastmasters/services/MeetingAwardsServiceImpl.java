package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.requestDTO.GemOfMonthRequestDto;
import com.app.toastmasters.dto.responseDTO.GemOfMonthDTO;
import com.app.toastmasters.entity.AvailableMembers;
import com.app.toastmasters.repository.GemOfMonthRepository;
import com.app.toastmasters.entity.GemOfMonth;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.exceptions.EmptyListException;
import com.app.toastmasters.mapper.GemOfMonthMapper;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.AvailableMembersRepository;
import com.app.toastmasters.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeetingAwardsServiceImpl implements MeetingAwardsService {

    private final AvailableMembersRepository availableMembersRepository;
    private final UserRepository userRepository;
    private final GemOfMonthRepository gemOfMonthRepository;
    private final GemOfMonthMapper mapper;

    @Override
    public ResponseEntity<ResponseMessage<List<GemOfMonthDTO>>> gemsOfTheLastMonth() {
        YearMonth lastMonth = YearMonth.now().minusMonths(1);
        LocalDate startDate = lastMonth.atDay(1);
        LocalDate endDate = lastMonth.atEndOfMonth();

        List<User> users = userRepository.findAll()
                .stream()
                .filter(u -> !"admin".equalsIgnoreCase(u.getUserType()))
                .toList();

        List<AvailableMembers> records = availableMembersRepository.findByDateBetween(startDate, endDate);

        Map<Integer, Long> availabilityMap = records.stream()
                .filter(r -> r.getStatus() == 1)
                .collect(Collectors.groupingBy(r -> r.getUser().getUserId(), Collectors.counting()));

        List<GemOfMonthDTO> gems = users.stream()
                .map(user -> {
                    GemOfMonthDTO dto = new GemOfMonthDTO();
                    dto.setUserId(user.getUserId());
                    dto.setUserName(user.getUserName());
                    dto.setMonth(startDate); // first day of last month
                    dto.setDayCount(availabilityMap.getOrDefault(user.getUserId(), 0L).intValue());
                    return dto;
                })
                .toList();

        ResponseMessage<List<GemOfMonthDTO>> responseMessage =
                new ResponseMessage<List<GemOfMonthDTO>>(HttpStatus.OK, Constant.GEM_OF_THE_MONTH, gems);

        return ResponseEntity.ok(responseMessage);
    }



    @Override
    public ResponseEntity<ResponseMessage<GemOfMonthDTO>> selectGemOfMonth(GemOfMonthRequestDto gemOfMonth) {

        gemOfMonthRepository.deleteByMonth(gemOfMonth.getMonth());

        Optional<User> user = userRepository.findById(gemOfMonth.getUserId());
        User userData = user.get();
        GemOfMonth gem = new GemOfMonth();
        gem.setMonth(gemOfMonth.getMonth());
        gem.setUserId(userData.getUserId());
        gem.setUserName(userData.getUserName());
        gem.setDayCount(gemOfMonth.getDayCount());
        GemOfMonth gemAdded = gemOfMonthRepository.save(gem);

        ResponseMessage<GemOfMonthDTO> responseMessage =
                new ResponseMessage<GemOfMonthDTO>(HttpStatus.OK, Constant.GEM_OF_THE_MONTH, mapper.toDTO(gem));

        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<GemOfMonthDTO>>> getAllGemOfMonth() {
        List<GemOfMonth> gemOfMonths = gemOfMonthRepository.findAll();
        if(gemOfMonths.isEmpty())
            throw new EmptyListException(Constant.EMPTY_LIST);

        ResponseMessage<List<GemOfMonthDTO>> responseMessage =
                new ResponseMessage<List<GemOfMonthDTO>>(HttpStatus.OK, Constant.GEM_OF_THE_MONTH,
                        gemOfMonths.stream().map(x->mapper.toDTO(x)).collect(Collectors.toList()));

        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<GemOfMonthDTO>>> listAllLastMonthMembersWithCount() {

        YearMonth lastMonth = YearMonth.now().minusMonths(1);

        // 1️⃣ Get all non-admin users
        List<User> users = userRepository.findAll()
                .stream()
                .filter(u -> !"admin".equalsIgnoreCase(u.getUserType()))
                .toList();

        // 2️⃣ Get availability count per user for last month
        // Assuming repository method returns List<Object[]> { "yyyy-MM", userId, dayCount }
        List<Object[]> results = availableMembersRepository.findGemOfTheMonth();

        // Map userId -> dayCount for last month
        Map<Integer, Integer> availabilityMap = results.stream()
                .filter(r -> YearMonth.parse((String) r[0]).equals(lastMonth))
                .collect(Collectors.toMap(
                        r -> ((Number) r[1]).intValue(),
                        r -> ((Number) r[2]).intValue()
                ));

        // 3️⃣ Map all users to DTO, set dayCount = 0 if not in availabilityMap
        List<GemOfMonthDTO> gems = users.stream()
                .map(user -> {
                    GemOfMonthDTO dto = new GemOfMonthDTO();
                    dto.setUserId(user.getUserId());
                    dto.setUserName(user.getUserName());
                    dto.setMonth(lastMonth.atDay(1)); // first day of last month
                    dto.setDayCount(availabilityMap.getOrDefault(user.getUserId(), 0));
                    return dto;
                })
                .toList();

        ResponseMessage<List<GemOfMonthDTO>> responseMessage =
                new ResponseMessage<List<GemOfMonthDTO>>(HttpStatus.OK, Constant.GEM_OF_THE_MONTH, gems);

        return ResponseEntity.ok(responseMessage);
    }


}
