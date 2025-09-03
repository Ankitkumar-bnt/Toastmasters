package com.app.toastmasters.dto.responseDTO;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AgendaStaticInfoResponseDTO {
    private int infoId;
    private String infoKey;
    private String infoValue;
}
