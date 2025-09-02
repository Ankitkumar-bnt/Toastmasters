package com.app.toastmasters.entity;

import com.app.toastmasters.dto.responseDTO.MeetingResponseDTO;
import com.app.toastmasters.dto.responseDTO.RoleResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MeetingWithRolesDTO {
    private MeetingResponseDTO meeting;
    private List<RoleResponseDTO> roles;
}
