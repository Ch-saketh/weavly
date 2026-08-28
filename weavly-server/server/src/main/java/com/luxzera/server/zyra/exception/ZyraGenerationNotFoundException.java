package com.luxzera.server.zyra.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.UUID;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ZyraGenerationNotFoundException extends RuntimeException {
    public ZyraGenerationNotFoundException(String message) {
        super(message);
    }

    public ZyraGenerationNotFoundException(UUID generationId) {
        super("Recommendation generation not found: " + generationId);
    }
}
