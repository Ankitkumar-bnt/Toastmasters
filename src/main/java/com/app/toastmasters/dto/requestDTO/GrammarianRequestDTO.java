package com.app.toastmasters.dto.requestDTO;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GrammarianRequestDTO {
    private String word;
    private String meaning;
    private String example;
    private String wordType;

    private int userId;
    private int meetingId;
}
