package com.luxzera.server.auth.repository;

import com.luxzera.server.auth.entity.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthSessionRepository extends JpaRepository<AuthSession, UUID> {

    Optional<AuthSession> findBySessionTokenHash(String sessionTokenHash);

    List<AuthSession> findAllByAccountIdAndAccountTypeAndIsRevokedFalseOrderByLastActivityAtDesc(String accountId, String accountType);

    List<AuthSession> findAllByAccountEmailIgnoreCaseAndIsRevokedFalseOrderByLastActivityAtDesc(String accountEmail);

    @Modifying
    @Query("UPDATE AuthSession s SET s.isRevoked = true, s.revokedAt = :revokedAt WHERE s.accountEmail = :accountEmail AND s.isRevoked = false")
    int revokeAllSessionsForEmail(@Param("accountEmail") String accountEmail, @Param("revokedAt") LocalDateTime revokedAt);

    @Modifying
    @Query("UPDATE AuthSession s SET s.isRevoked = true, s.revokedAt = :revokedAt WHERE s.accountEmail = :accountEmail AND s.sessionTokenHash <> :currentTokenHash AND s.isRevoked = false")
    int revokeOtherSessionsForEmail(@Param("accountEmail") String accountEmail, @Param("currentTokenHash") String currentTokenHash, @Param("revokedAt") LocalDateTime revokedAt);

    @Modifying
    @Query("UPDATE AuthSession s SET s.lastActivityAt = :activityTime WHERE s.id = :sessionId")
    void updateLastActivity(@Param("sessionId") UUID sessionId, @Param("activityTime") LocalDateTime activityTime);
}
