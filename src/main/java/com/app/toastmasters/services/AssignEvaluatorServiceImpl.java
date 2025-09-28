package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.entity.AssignEvaluator;
import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.exceptions.EmptyListException;
import com.app.toastmasters.exceptions.EmptyObjectException;
import com.app.toastmasters.exceptions.MeetingNotFoundException;
import com.app.toastmasters.exceptions.MemberNotFoundException;
import com.app.toastmasters.mapper.MeetingMapper;
import com.app.toastmasters.mapper.UserMapper;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.AssignEvaluatorRepository;
import com.app.toastmasters.repository.MeetingRepository;
import com.app.toastmasters.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.bcel.Const;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AssignEvaluatorServiceImpl implements AssignEvaluatorService{

    private final AssignEvaluatorRepository evaluatorRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingMapper meetingMapper;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public ResponseEntity<ResponseMessage<List<AssignEvaluator>>> assignEvaluators(List<AssignEvaluator> evaluators) {
        if (evaluators == null || evaluators.isEmpty()) {
            throw new EmptyObjectException(Constant.EMPTY_OBJECT);
        }

        evaluatorRepository.deleteAllByMeetingId(evaluators.get(0).getMeetingId());

        List<AssignEvaluator> assignEvaluators = new ArrayList<>();

        for(AssignEvaluator assign : evaluators){
            AssignEvaluator evaluator = new AssignEvaluator();
            evaluator.setMeetingId(assign.getMeetingId());
            evaluator.setEvaluatorId(assign.getEvaluatorId());
            evaluator.setSpeakerId(assign.getSpeakerId());
            assignEvaluators.add(evaluator);
        }
        List<AssignEvaluator> savedEvaluators = evaluatorRepository.saveAll(assignEvaluators);

        ResponseMessage<List<AssignEvaluator>> responseMessage =
                new ResponseMessage<List<AssignEvaluator>>(HttpStatus.CREATED, Constant.MEETING_ADDED_SUCCESS, savedEvaluators);

        return ResponseEntity.status(HttpStatus.CREATED).body(responseMessage);
    }


    @Override
    public ResponseEntity<ResponseMessage<List<AssignEvaluator>>> getAllAssignedEvaluators() {
        List<AssignEvaluator> evaluators = evaluatorRepository.findAll();
        if(evaluators.isEmpty())
            throw new EmptyListException(Constant.EMPTY_LIST);
        ResponseMessage<List<AssignEvaluator>> responseMessage =
                new ResponseMessage<List<AssignEvaluator>>(HttpStatus.OK,Constant.FOUND_ALL_ASSIGNED_EVALUATORS, evaluators);
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<AssignEvaluator>>> getAllAssignedEvaluatorsByMeeting(int meetingId) {
        Optional<Meeting> meeting = meetingRepository.findById(meetingId);
        if(meeting.isEmpty())
            throw new MeetingNotFoundException(Constant.MEETING_NOT_FOUND);


        List<AssignEvaluator> evaluators = evaluatorRepository.findAllByMeetingId(meeting.get().getMeetingId());

        ResponseMessage<List<AssignEvaluator>> responseMessage =
                new ResponseMessage<List<AssignEvaluator>>(HttpStatus.OK,Constant.FOUND_ALL_ASSIGNED_EVALUATORS, evaluators);
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<AssignEvaluator>>> getAllAssignedEvaluatorsBySpeakerAndMeeting(int speakerId, int meetingId) {
        Optional<Meeting> meeting = meetingRepository.findById(meetingId);
        Optional<User> speaker = userRepository.findById(speakerId);
        if(meeting.isEmpty())
            throw new MeetingNotFoundException(Constant.MEETING_NOT_FOUND);

        if(speaker.isEmpty())
            throw new MemberNotFoundException(Constant.MEMBER_NOT_FOUND);

        List<AssignEvaluator> evaluators = evaluatorRepository.findAllByMeetingIdAndSpeakerId(meetingId, speakerId);

        ResponseMessage<List<AssignEvaluator>> responseMessage =
                new ResponseMessage<List<AssignEvaluator>>(HttpStatus.OK,Constant.FOUND_ALL_ASSIGNED_EVALUATORS, evaluators);
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<AssignEvaluator>>> getAllAssignedEvaluatorsByEvaluatorAndMeeting(int evaluatorId, int meetingId) {
        Optional<Meeting> meeting = meetingRepository.findById(meetingId);
        Optional<User> evaluator = userRepository.findById(evaluatorId);
        if(meeting.isEmpty())
            throw new MeetingNotFoundException(Constant.MEETING_NOT_FOUND);

        if(evaluator.isEmpty())
            throw new MemberNotFoundException(Constant.MEMBER_NOT_FOUND);

        List<AssignEvaluator> evaluators = evaluatorRepository.findAllByMeetingIdAndEvaluatorId(meetingId, evaluatorId);

        ResponseMessage<List<AssignEvaluator>> responseMessage =
                new ResponseMessage<List<AssignEvaluator>>(HttpStatus.OK,Constant.FOUND_ALL_ASSIGNED_EVALUATORS, evaluators);
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<AssignEvaluator>> deleteAssignedEvaluatorById(int evaluatorId, int meetingId, int speakerId) {
        AssignEvaluator evaluator = evaluatorRepository.findByEvaluatorIdAndMeetingIdAndSpeakerId(evaluatorId,meetingId,speakerId);
        if(evaluator == null)
            throw new EmptyObjectException(Constant.EMPTY_OBJECT);
        evaluatorRepository.deleteByEvaluatorIdAndMeetingIdAndSpeakerId(evaluatorId,meetingId,speakerId);
        ResponseMessage<AssignEvaluator> responseMessage =
                new ResponseMessage<>(HttpStatus.OK, Constant.ROLE_DELETE_SUCCESS, evaluator);
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }


}
