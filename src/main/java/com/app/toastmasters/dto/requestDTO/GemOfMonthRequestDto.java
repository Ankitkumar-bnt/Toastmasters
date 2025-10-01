package com.app.toastmasters.dto.requestDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class GemOfMonthRequestDto {
    private LocalDate month;
    private int userId;
    private String userName;
    private int dayCount;
}
