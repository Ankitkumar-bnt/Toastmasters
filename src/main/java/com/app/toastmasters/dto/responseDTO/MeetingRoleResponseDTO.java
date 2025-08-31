package com.app.toastmasters.dto.responseDTO;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingRoleResponseDTO {
    private Integer id;
    private Integer meetingId;
    private Integer roleId;
    private Integer roleCount;
}
