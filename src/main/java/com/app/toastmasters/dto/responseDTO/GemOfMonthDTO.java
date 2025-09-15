package com.app.toastmasters.dto.responseDTO;

import com.app.toastmasters.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GemOfMonthDTO {

    private String month;
    private User user;
    private int dayCount;
}
