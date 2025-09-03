package com.app.toastmasters.repository;

import com.app.toastmasters.entity.agenda.AgendaStaticInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgendaStaticInfoRepository extends JpaRepository<AgendaStaticInfo, Integer> {
    Optional<AgendaStaticInfo> findByInfoKeyOrInfoValue(String infoKey, String infoValue);

}
