package com.luxzera.server.user.repository;

import com.luxzera.server.user.entity.UserSearchHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserSearchHistoryRepository extends JpaRepository<UserSearchHistory, UUID> {

    @Query("SELECT s FROM UserSearchHistory s WHERE s.user.id = :userId ORDER BY s.createdAt DESC")
    List<UserSearchHistory> findRecentByUserId(@Param("userId") UUID userId, Pageable pageable);

    @Modifying
    @Query("DELETE FROM UserSearchHistory s WHERE s.user.id = :userId")
    void deleteAllByUserId(@Param("userId") UUID userId);
}
