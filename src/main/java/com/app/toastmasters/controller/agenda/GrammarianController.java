package com.app.toastmasters.controller.agenda;

import com.app.toastmasters.dto.requestDTO.GrammarianRequestDTO;
import com.app.toastmasters.dto.responseDTO.GrammarianResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.GrammarianService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class GrammarianController {

    private final GrammarianService grammarianService;

    public GrammarianController(GrammarianService grammarianService) {
        this.grammarianService = grammarianService;
    }

    @PostMapping("/addWordsForMeeting")
    public ResponseEntity<ResponseMessage<GrammarianResponseDTO>> addWordsForMeeting(
            @RequestBody GrammarianRequestDTO wordsData) {

        return grammarianService.addWordsForMeeting(wordsData);
    }

    @GetMapping("/getAllWordsData")
    public ResponseEntity<ResponseMessage<List<GrammarianResponseDTO>>> getAllWordsData() {
        return grammarianService.getAllWordsData();
    }

    @GetMapping("/getWordsDataByUserAndMeeting/{userId}/{meetingId}")
    public ResponseEntity<ResponseMessage<GrammarianResponseDTO>> getWordsDataByUserAndMeeting(
            @PathVariable int userId, @PathVariable int meetingId) {
        return grammarianService.getWordsDataByUserAndMeeting(userId, meetingId);
    }

    @PutMapping("/updateWordsDataByUserAndMeeting/{userId}/{meetingId}")
    public ResponseEntity<ResponseMessage<GrammarianResponseDTO>> updateWordsDataByUserAndMeeting(
            @RequestBody GrammarianRequestDTO dto, @PathVariable int userId, @PathVariable int meetingId) {
        return grammarianService.updateWordsDataByUserAndMeeting(dto, userId, meetingId);
    }

    @DeleteMapping("/deleteWordsDataByUserAndMeeting/{userId}/{meetingId}")
    public ResponseEntity<ResponseMessage<GrammarianResponseDTO>> deleteWordsDataByUserAndMeeting(
            @PathVariable int userId, @PathVariable int meetingId) {
        return grammarianService.deleteWordsDataByUserAndMeeting(userId, meetingId);
    }

}
