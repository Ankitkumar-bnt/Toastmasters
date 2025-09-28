package com.app.toastmasters.services;

import com.app.toastmasters.entity.AssignEvaluator;
import com.app.toastmasters.message.ResponseMessage;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface AssignEvaluatorService {
    ResponseEntity<ResponseMessage<List<AssignEvaluator>>> assignEvaluators(List<AssignEvaluator> evaluators);

    ResponseEntity<ResponseMessage<List<AssignEvaluator>>> getAllAssignedEvaluators();

    ResponseEntity<ResponseMessage<List<AssignEvaluator>>> getAllAssignedEvaluatorsByMeeting(int meetingId);

    ResponseEntity<ResponseMessage<List<AssignEvaluator>>> getAllAssignedEvaluatorsBySpeakerAndMeeting(int speakerId, int meetingId);

    ResponseEntity<ResponseMessage<List<AssignEvaluator>>> getAllAssignedEvaluatorsByEvaluatorAndMeeting(int evaluatorId, int meetingId);

    ResponseEntity<ResponseMessage<AssignEvaluator>> deleteAssignedEvaluatorById(int evaluatorId, int meetingId, int speakerId);
}
