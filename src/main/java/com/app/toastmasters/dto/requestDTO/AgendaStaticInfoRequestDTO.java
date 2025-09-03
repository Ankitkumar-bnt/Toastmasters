package com.app.toastmasters.dto.requestDTO;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AgendaStaticInfoRequestDTO {
    private String infoKey;
    private String infoValue;
}
