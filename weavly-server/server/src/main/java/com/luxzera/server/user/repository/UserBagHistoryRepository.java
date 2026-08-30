package com.luxzera.server.user.repository;

import com.luxzera.server.user.entity.UserBagHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserBagHistoryRepository extends JpaRepository<UserBagHistory, UUID> {

    @Query("SELECT b FROM UserBagHistory b WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    List<UserBagHistory> findRecentByUserId(@Param("userId") UUID userId, Pageable pageable);
}
