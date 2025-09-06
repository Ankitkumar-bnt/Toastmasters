package com.app.toastmasters.controller.agenda;

import com.app.toastmasters.dto.requestDTO.ClubOfficersRequestDTO;
import com.app.toastmasters.dto.responseDTO.ClubOfficersResponseDTO;
import com.app.toastmasters.entity.agenda.ClubOfficers;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.ClubOfficersService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/agenda")
public class ClubOfficerController {

    private final ClubOfficersService clubOfficersService;

    public ClubOfficerController(ClubOfficersService clubOfficersService) {
        this.clubOfficersService = clubOfficersService;
    }

    @PostMapping("/addClubOfficer")
    public ResponseEntity<ResponseMessage<ClubOfficersResponseDTO>> addClubOfficer(@RequestBody ClubOfficersRequestDTO clubOfficersRequestDTO){
        return clubOfficersService.addClubOfficer(clubOfficersRequestDTO);
    }

    @GetMapping("/getAllClubOfficer")
    public ResponseEntity<ResponseMessage<List<ClubOfficersResponseDTO>>> getAllClubOfficer(){
        return clubOfficersService.getAllClubOfficer();
    }

    @PutMapping("/updateClubOfficerById/{officerId}")
    public ResponseEntity<ResponseMessage<ClubOfficersResponseDTO>> updateClubOfficerById(
            @RequestBody ClubOfficersRequestDTO clubOfficersRequestDTO, @PathVariable int officerId){
        return clubOfficersService.updateClubOfficerById(clubOfficersRequestDTO, officerId);
    }

    @DeleteMapping("/deleteClubOfficerById/{officerId}")
    public ResponseEntity<ResponseMessage<ClubOfficersResponseDTO>> deleteClubOfficerById(@PathVariable int officerId){
        return clubOfficersService.deleteClubOfficerById(officerId);
    }
}
