package com.app.toastmasters.repository;

import com.app.toastmasters.entity.Meeting;
import com.app.toastmasters.entity.User;
import com.app.toastmasters.entity.agenda.SpeakerSpeech;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpeakerSpeechRepository extends JpaRepository<SpeakerSpeech, Integer> {
    List<SpeakerSpeech> findByMeeting_MeetingId(int meetingId);

    List<SpeakerSpeech> findAllByMeeting(Meeting meetingData);

    Optional<SpeakerSpeech> findByUser_UserIdAndMeeting_MeetingId(int userId, int meetingId);
}
