package com.app.toastmasters.dto.responseDTO;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GrammarianResponseDTO {
    private int grammarianId;
    private String word;
    private String meaning;
    private String example;
    private String wordType;
    private LocalDateTime localDateTime;

    private int userId;
    private int meetingId;
}
