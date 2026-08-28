package com.luxzera.server.zyra.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ZyraValidationException extends RuntimeException {
    public ZyraValidationException(String message) {
        super(message);
    }
}
