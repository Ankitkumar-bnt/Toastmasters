package com.app.toastmasters.services;

import com.app.toastmasters.constants.Constant;
import com.app.toastmasters.entity.Backouts;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.repository.BackoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BackoutServiceImpl implements BackoutService{

    private final BackoutRepository backoutRepository;

    @Override
    public ResponseEntity<ResponseMessage<List<Backouts>>> getAllBackouts() {
        List<Backouts> backouts = backoutRepository.findAll();
        ResponseMessage<List<Backouts>> responseMessage =
                new ResponseMessage<List<Backouts>>(HttpStatus.OK, "Found all backouts", backouts);
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<Backouts>>> getBackoutsByUser(int userId) {
        List<Backouts> backouts = backoutRepository.findAllByUserId(userId);
        ResponseMessage<List<Backouts>> responseMessage =
                new ResponseMessage<List<Backouts>>(HttpStatus.OK, "Found all backouts by userId", backouts);
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }

    @Override
    public ResponseEntity<ResponseMessage<List<Backouts>>> getBackoutsByMeeting(int meetingId) {
        List<Backouts> backouts = backoutRepository.findAllByMeetingId(meetingId);
        ResponseMessage<List<Backouts>> responseMessage =
                new ResponseMessage<List<Backouts>>(HttpStatus.OK, "Found all backouts by userId", backouts);
        return ResponseEntity.status(HttpStatus.OK).body(responseMessage);
    }
}
