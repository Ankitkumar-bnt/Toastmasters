package com.app.toastmasters.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class MeetingRoleHelper {

    private int roleId;
    private String roleName;
    private String roleDescription;
    private int roleCount;
}
