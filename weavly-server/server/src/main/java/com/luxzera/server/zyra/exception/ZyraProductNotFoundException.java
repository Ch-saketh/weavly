package com.luxzera.server.zyra.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ZyraProductNotFoundException extends RuntimeException {
    public ZyraProductNotFoundException(String message) {
        super(message);
    }

    public ZyraProductNotFoundException(String productId, String details) {
        super("Product not found in recommendation catalog: " + productId + " (" + details + ")");
    }
}
