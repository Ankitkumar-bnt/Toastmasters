package com.app.toastmasters.dto.requestDTO;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingRoleRequestDTO {
    private Integer meetingId;
    private Integer roleId;
    private Integer roleCount;
}
