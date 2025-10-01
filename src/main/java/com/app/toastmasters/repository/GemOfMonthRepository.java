package com.app.toastmasters.repository;

import com.app.toastmasters.entity.GemOfMonth;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface GemOfMonthRepository extends JpaRepository<GemOfMonth, Integer> {
    @Transactional
    void deleteByMonth(LocalDate month);
}
