package com.app.toastmasters.controller;

import com.app.toastmasters.entity.AssignEvaluator;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.AssignEvaluatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/meeting")
@RequiredArgsConstructor
public class  AssignEvaluatorController {

    private final AssignEvaluatorService evaluatorService;

    @PostMapping("/assignEvaluators")
    public ResponseEntity<ResponseMessage<List<AssignEvaluator>>> assignEvaluators(@RequestBody List<AssignEvaluator> evaluators){
        return evaluatorService.assignEvaluators(evaluators);
    }

    @GetMapping("/getAllAssignedEvaluators")
    public ResponseEntity<ResponseMessage<List<AssignEvaluator>>> getAllAssignedEvaluators(){
        return evaluatorService.getAllAssignedEvaluators();
    }

    @GetMapping("/getAllAssignedEvaluatorsByMeeting/{meetingId}")
    public ResponseEntity<ResponseMessage<List<AssignEvaluator>>> getAllAssignedEvaluatorsByMeeting(@PathVariable int meetingId){
        return evaluatorService.getAllAssignedEvaluatorsByMeeting(meetingId);
    }

    @GetMapping("/getAllAssignedEvaluatorsBySpeakerAndMeeting/{speakerId}/{meetingId}")
    public ResponseEntity<ResponseMessage<List<AssignEvaluator>>> getAllAssignedEvaluatorsBySpeakerAndMeeting(@PathVariable int speakerId, @PathVariable int meetingId){
        return evaluatorService.getAllAssignedEvaluatorsBySpeakerAndMeeting(speakerId, meetingId);
    }

    @GetMapping("/getAllAssignedEvaluatorsByEvaluatorAndMeeting/{evaluatorId}/{meetingId}")
    public ResponseEntity<ResponseMessage<List<AssignEvaluator>>> getAllAssignedEvaluatorsByEvaluatorAndMeeting(@PathVariable int evaluatorId, @PathVariable int meetingId){
        return evaluatorService.getAllAssignedEvaluatorsByEvaluatorAndMeeting(evaluatorId, meetingId);
    }

    @DeleteMapping("/deleteAssignedEvaluatorById/{evaluatorId}/{meetingId}/{speakerId}")
    public ResponseEntity<ResponseMessage<AssignEvaluator>> deleteAssignedEvaluatorById(
            @PathVariable int evaluatorId, @PathVariable int meetingId, @PathVariable int speakerId){
        return evaluatorService.deleteAssignedEvaluatorById(evaluatorId,meetingId,speakerId);
    }
}
