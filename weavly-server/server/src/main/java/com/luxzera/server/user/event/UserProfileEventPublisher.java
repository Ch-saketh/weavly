package com.luxzera.server.user.event;

import java.util.UUID;

/**
 * Publisher abstraction for emitting Zyra profile update events.
 */
public interface UserProfileEventPublisher {

    void publishProfileUpdated(UUID userId, UserProfileUpdateType updateType);
}
