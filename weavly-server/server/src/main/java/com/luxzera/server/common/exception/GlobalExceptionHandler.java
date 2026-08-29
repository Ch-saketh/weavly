package com.luxzera.server.common.exception;

import com.luxzera.server.zyra.exception.ZyraAccessDeniedException;
import com.luxzera.server.zyra.exception.ZyraGenerationNotFoundException;
import com.luxzera.server.zyra.exception.ZyraProductNotFoundException;
import com.luxzera.server.zyra.exception.ZyraServiceUnavailableException;
import com.luxzera.server.zyra.exception.ZyraValidationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleResourceNotFoundException(
            ResourceNotFoundException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler({ZyraProductNotFoundException.class, ZyraGenerationNotFoundException.class})
    public ResponseEntity<Map<String, String>> handleZyraNotFoundException(
            RuntimeException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", ex.getMessage(), "error", "Not Found"));
    }

    @ExceptionHandler(ZyraAccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleZyraAccessDeniedException(
            ZyraAccessDeniedException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", ex.getMessage(), "error", "Forbidden"));
    }

    @ExceptionHandler(ZyraValidationException.class)
    public ResponseEntity<Map<String, String>> handleZyraValidationException(
            ZyraValidationException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage(), "error", "Bad Request"));
    }

    @ExceptionHandler({org.springframework.web.bind.MethodArgumentNotValidException.class, org.springframework.validation.BindException.class})
    public ResponseEntity<Map<String, String>> handleValidationExceptions(Exception ex) {
        String msg = "Validation failed";
        if (ex instanceof org.springframework.web.bind.MethodArgumentNotValidException manve) {
            if (manve.getBindingResult().getFieldError() != null) {
                msg = manve.getBindingResult().getFieldError().getField() + ": " + manve.getBindingResult().getFieldError().getDefaultMessage();
            }
        }
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", msg, "error", "Bad Request"));
    }

    @ExceptionHandler(ZyraServiceUnavailableException.class)
    public ResponseEntity<Map<String, String>> handleZyraServiceUnavailableException(
            ZyraServiceUnavailableException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("message", ex.getMessage(), "error", "Service Unavailable"));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, String>> handleBadRequestException(
            BadRequestException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalStateException(
            IllegalStateException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(
            RuntimeException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
    }
}
