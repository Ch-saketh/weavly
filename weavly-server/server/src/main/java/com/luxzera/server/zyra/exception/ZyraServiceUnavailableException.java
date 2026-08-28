package com.luxzera.server.zyra.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class ZyraServiceUnavailableException extends RuntimeException {
    public ZyraServiceUnavailableException(String message) {
        super(message);
    }

    public ZyraServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
