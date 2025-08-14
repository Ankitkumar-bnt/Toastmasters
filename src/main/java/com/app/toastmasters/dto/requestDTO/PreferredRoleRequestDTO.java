package com.app.toastmasters.dto.requestDTO;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PreferredRoleRequestDTO {

    private int userId;
    private int meetingId;
    private int roleId;
}
