package com.app.toastmasters.controller.agenda;

import com.app.toastmasters.dto.requestDTO.SpeakerSpeechRequestDTO;
import com.app.toastmasters.dto.responseDTO.SpeakerSpeechResponseDTO;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.SpeakerSpeechService;
import jdk.dynalink.linker.LinkerServices;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/agenda")
public class SpeakerSpeechController {

    private final SpeakerSpeechService speakerSpeechService;

    public SpeakerSpeechController(SpeakerSpeechService speakerSpeechService) {
        this.speakerSpeechService = speakerSpeechService;
    }

    @PostMapping("/addSpeakerSpeech")
    public ResponseEntity<ResponseMessage<SpeakerSpeechResponseDTO>> addSpeakerSpeech(@RequestBody SpeakerSpeechRequestDTO speakerSpeechRequestDTO){

        return speakerSpeechService.addSpeakerSpeech(speakerSpeechRequestDTO);
    }

    @GetMapping("/getAllSpeakerSpeech")
    public ResponseEntity<ResponseMessage<List<SpeakerSpeechResponseDTO>>> getAllSpeakerSpeech(){
        return speakerSpeechService.getAllSpeakerSpeech();
    }

    @GetMapping("/getSpeakerSpeechByMeeting/{meetingId}")
    public ResponseEntity<ResponseMessage<SpeakerSpeechResponseDTO>> getSpeakerSpeechByMeeting(
            @PathVariable int meetingId){
        return speakerSpeechService.getSpeakerSpeechByMeeting(meetingId);
    }

    @DeleteMapping("/deleteSpeakerSpeechByMeeting/{meetingId}")
    public ResponseEntity<ResponseMessage<SpeakerSpeechResponseDTO>> deleteSpeakerSpeechByMeeting(
            @PathVariable int meetingId){
        return speakerSpeechService.deleteSpeakerSpeechByMeeting(meetingId);
    }

    @PutMapping("/updateSpeakerSpeechByMeeting/{meetingId}")
    public ResponseEntity<ResponseMessage<SpeakerSpeechResponseDTO>> updateSpeakerSpeechByMeeting(
            @RequestBody SpeakerSpeechRequestDTO speakerSpeechRequestDTO, @PathVariable int meetingId){
        return speakerSpeechService.updateSpeakerSpeechByMeeting(speakerSpeechRequestDTO, meetingId);
    }
}
