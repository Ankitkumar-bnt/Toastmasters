package com.app.toastmasters.controller.agenda;

import com.app.toastmasters.dto.requestDTO.AbbreviationsRequestDTO;
import com.app.toastmasters.dto.responseDTO.AbbreviationsResponseDTO;
import com.app.toastmasters.entity.agenda.Abbreviations;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.AbbreviationService;
import jakarta.persistence.GeneratedValue;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/agenda")
public class AbbreviationController {

    private final AbbreviationService abbreviationService;

    public AbbreviationController(AbbreviationService abbreviationService) {
        this.abbreviationService = abbreviationService;
    }

    @PostMapping("/addAbbreviation")
    public ResponseEntity<ResponseMessage<AbbreviationsResponseDTO>> addAbbreviation(@RequestBody AbbreviationsRequestDTO abbreviations){
        return abbreviationService.addAbbreviation(abbreviations);
    }

    @GetMapping("/getAllAbbreviations")
    public ResponseEntity<ResponseMessage<List<AbbreviationsResponseDTO>>> getAllAbbreviations(){
        return abbreviationService.getAllAbbreviations();
    }

    @GetMapping("/getAbbreviationsByName/{abbreviation}")
    public ResponseEntity<ResponseMessage<AbbreviationsResponseDTO>> getAbbreviationsByName(@PathVariable String abbreviation){
        return abbreviationService.getAbbreviationsByName(abbreviation);
    }

    @GetMapping("/getAbbreviationsById/{abbreviationId}")
    public ResponseEntity<ResponseMessage<AbbreviationsResponseDTO>> getAbbreviationsById(@PathVariable int abbreviationId){
        return abbreviationService.getAbbreviationsById(abbreviationId);
    }

    @PutMapping("/updateAbbreviationsById/{abbreviationId}")
    public ResponseEntity<ResponseMessage<AbbreviationsResponseDTO>> updateAbbreviationsById(
            @RequestBody AbbreviationsRequestDTO dto, @PathVariable int abbreviationId){
        return abbreviationService.updateAbbreviationsById(dto, abbreviationId);
    }

    @DeleteMapping("/deleteAbbreviationsById/{abbreviationId}")
    public ResponseEntity<ResponseMessage<AbbreviationsResponseDTO>> deleteAbbreviationsById(@PathVariable int abbreviationId){
        return abbreviationService.deleteAbbreviationsById(abbreviationId);
    }
}
