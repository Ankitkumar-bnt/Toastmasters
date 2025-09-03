package com.app.toastmasters.services;

import com.app.toastmasters.dto.requestDTO.ClubOfficersRequestDTO;
import com.app.toastmasters.dto.responseDTO.ClubOfficersResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ClubOfficersService {
    ResponseEntity<ResponseMessage<ClubOfficersResponseDTO>> addClubOfficer(ClubOfficersRequestDTO clubOfficersRequestDTO);

    ResponseEntity<ResponseMessage<List<ClubOfficersResponseDTO>>> getAllClubOfficer();

    ResponseEntity<ResponseMessage<ClubOfficersResponseDTO>> updateClubOfficerById(ClubOfficersRequestDTO clubOfficersRequestDTO, int officerId);

    ResponseEntity<ResponseMessage<ClubOfficersResponseDTO>> deleteClubOfficerById(int officerId);
}
