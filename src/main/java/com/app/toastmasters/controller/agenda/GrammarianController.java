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
@RequestMapping("/agenda")
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

    @GetMapping("/getWordsDataByMeeting/{meetingId}")
    public ResponseEntity<ResponseMessage<List<GrammarianResponseDTO>>> getWordsDataByMeeting(@PathVariable int meetingId) {
        return grammarianService.getWordsDataByMeeting(meetingId);
    }

    @PutMapping("/updateWordsDataByMeeting/{meetingId}/{wordType}")
    public ResponseEntity<ResponseMessage<GrammarianResponseDTO>> updateWordsDataByMeeting(
            @RequestBody GrammarianRequestDTO dto, @PathVariable int meetingId, @PathVariable String wordType) {
        return grammarianService.updateWordsDataByMeeting(dto, meetingId, wordType);
    }

    @DeleteMapping("/deleteWordsDataByMeeting/{meetingId}")
    public ResponseEntity<ResponseMessage<GrammarianResponseDTO>> deleteWordsDataByMeeting(@PathVariable int meetingId) {
        return grammarianService.deleteWordsDataByMeeting(meetingId);
    }

}
