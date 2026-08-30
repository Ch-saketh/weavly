package com.luxzera.server.user.repository;

import com.luxzera.server.user.entity.UserClickHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserClickHistoryRepository extends JpaRepository<UserClickHistory, UUID> {

    @Query("SELECT c FROM UserClickHistory c WHERE c.user.id = :userId ORDER BY c.createdAt DESC")
    List<UserClickHistory> findRecentByUserId(@Param("userId") UUID userId, Pageable pageable);
}
