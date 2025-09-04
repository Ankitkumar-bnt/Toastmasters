package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.dto.requestDTO.ClubOfficersRequestDTO;
import com.app.toastmasters.dto.responseDTO.ClubOfficersResponseDTO;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.entity.agenda.ClubOfficers;
import com.app.toastmasters.exceptions.EmptyObjectException;
import com.app.toastmasters.exceptions.MemberNotFoundException;
import com.app.toastmasters.mapper.ClubOfficersMapper;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.ClubOfficersRepository;
import com.app.toastmasters.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClubOfficersServiceImpl implements ClubOfficersService {

    private final ClubOfficersRepository clubOfficersRepository;
    private final ClubOfficersMapper mapper;
    private final UserRepository userRepository;

    public ClubOfficersServiceImpl(ClubOfficersRepository clubOfficersRepository, ClubOfficersMapper mapper, UserRepository userRepository) {
        this.clubOfficersRepository = clubOfficersRepository;
        this.mapper = mapper;
        this.userRepository = userRepository;
    }

    @Override
    public ResponseEntity<ResponseMessage<ClubOfficersResponseDTO>> addClubOfficer(
            ClubOfficersRequestDTO clubOfficersRequestDTO) {
        if(clubOfficersRequestDTO == null)
            throw new EmptyObjectException(Constant.EMPTY_OBJECT);

        Optional<User> user = userRepository.findById(clubOfficersRequestDTO.getUserId());
        if(user.isEmpty())
            throw new MemberNotFoundException(Constant.MEMBER_NOT_FOUND);
        User userData = user.get();

        ClubOfficers clubOfficers = new ClubOfficers();
        clubOfficers.setUser(userData);
        clubOfficers.setLeadershipName(clubOfficersRequestDTO.getLeadershipName());
        ClubOfficers officers = clubOfficersRepository.save(clubOfficers);

        ResponseMessage<ClubOfficersResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.CLUB_OFFICER_CREATED, mapper.toResponseDTO(officers));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<ClubOfficersResponseDTO>>> getAllClubOfficer() {
        List<ClubOfficers> officersList = clubOfficersRepository.findAll();

        List<ClubOfficersResponseDTO> dtoList = officersList.stream()
                .map(x -> mapper.toResponseDTO(x))
                .collect(java.util.stream.Collectors.toList());

        ResponseMessage<List<ClubOfficersResponseDTO>> responseMessage =
                new ResponseMessage<List<ClubOfficersResponseDTO>>(HttpStatus.OK, Constant.CLUB_OFFICER_FOUND_ALL, dtoList);

        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<ClubOfficersResponseDTO>> updateClubOfficerById(ClubOfficersRequestDTO clubOfficersRequestDTO, int officerId) {
        if (clubOfficersRequestDTO == null)
            throw new EmptyObjectException(Constant.EMPTY_OBJECT);

        ClubOfficers existing = clubOfficersRepository.findById(officerId).orElse(null);

        if (existing == null) {
            ResponseMessage<ClubOfficersResponseDTO> responseMessage =
                    new ResponseMessage<>(HttpStatus.NOT_FOUND, Constant.CLUB_OFFICER_UPDATE_FAIL, null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseMessage);
        }

        existing.setLeadershipName(clubOfficersRequestDTO.getLeadershipName());
        existing.setUser(mapper.userFromId(clubOfficersRequestDTO.getUserId()));

        ClubOfficers updated = clubOfficersRepository.save(existing);

        ResponseMessage<ClubOfficersResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.CLUB_OFFICER_UPDATE_SUCCESS, mapper.toResponseDTO(updated));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<ClubOfficersResponseDTO>> deleteClubOfficerById(int officerId) {
        ClubOfficers existing = clubOfficersRepository.findById(officerId).orElse(null);

        if (existing == null) {
            ResponseMessage<ClubOfficersResponseDTO> responseMessage =
                    new ResponseMessage<>(HttpStatus.NOT_FOUND, Constant.CLUB_OFFICER_DELETE_FAIL, null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseMessage);
        }

        clubOfficersRepository.delete(existing);

        ResponseMessage<ClubOfficersResponseDTO> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.CLUB_OFFICER_DELETE_SUCCESS, mapper.toResponseDTO(existing));
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

}
