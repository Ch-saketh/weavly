package com.luxzera.server.zyra.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class ZyraAccessDeniedException extends RuntimeException {
    public ZyraAccessDeniedException(String message) {
        super(message);
    }
}
