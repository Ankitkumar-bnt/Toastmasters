package com.app.toastmasters.dto.responseDTO;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AssignedRoleResponseDTO {
    private int id;
    private int userId;
    private int meetingId;
    private int roleId;
}
