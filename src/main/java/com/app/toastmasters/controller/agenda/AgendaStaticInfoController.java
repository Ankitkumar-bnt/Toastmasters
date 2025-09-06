package com.app.toastmasters.controller.agenda;

import com.app.toastmasters.dto.requestDTO.AgendaStaticInfoRequestDTO;
import com.app.toastmasters.dto.responseDTO.AgendaStaticInfoResponseDTO;
import com.app.toastmasters.entity.agenda.AgendaStaticInfo;
import com.app.toastmasters.message.ResponseMessage;
import com.app.toastmasters.services.AgendaStaticInfoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/agenda")
public class AgendaStaticInfoController {

    private final AgendaStaticInfoService agendaStaticInfoService;

    public AgendaStaticInfoController(AgendaStaticInfoService agendaStaticInfoService) {
        this.agendaStaticInfoService = agendaStaticInfoService;
    }

    @PostMapping("/addStaticInfo")
    public ResponseEntity<ResponseMessage<AgendaStaticInfoResponseDTO>> addStaticInfo(
            @RequestBody AgendaStaticInfoRequestDTO agendaStaticInfo){
        return agendaStaticInfoService.addStaticInfo(agendaStaticInfo);
    }

    @GetMapping("/getAllStaticInfo")
    public ResponseEntity<ResponseMessage<List<AgendaStaticInfoResponseDTO>>> getAllStaticInfo(){
        return agendaStaticInfoService.getAllStaticInfo();
    }

    @GetMapping("/getAllStaticInfoByInfoKeyOrInfoValue/{keyOrValue}")
    public ResponseEntity<ResponseMessage<AgendaStaticInfoResponseDTO>> getAllStaticInfoByInfoKeyOrInfoValue(
            @PathVariable String keyOrValue){
        return agendaStaticInfoService.getAllStaticInfoByInfoKeyOrInfoValue(keyOrValue);
    }

    @PutMapping("/updateStaticInfoById/{staticInfoId}")
    public ResponseEntity<ResponseMessage<AgendaStaticInfoResponseDTO>> updateStaticInfoById(
            @RequestBody AgendaStaticInfoRequestDTO agendaStaticInfoRequestDTO, @PathVariable int staticInfoId){
        return agendaStaticInfoService.updateStaticInfoById(agendaStaticInfoRequestDTO, staticInfoId);
    }

    @DeleteMapping("/deleteStaticInfoById/{staticInfoId}")
    public ResponseEntity<ResponseMessage<AgendaStaticInfoResponseDTO>> deleteStaticInfoById(
            @PathVariable int staticInfoId){
        return agendaStaticInfoService.deleteStaticInfoById(staticInfoId);
    }
}
