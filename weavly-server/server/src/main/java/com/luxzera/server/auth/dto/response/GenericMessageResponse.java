package com.luxzera.server.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenericMessageResponse {
    private String message;
    private boolean success;

    public static GenericMessageResponse of(String message) {
        return GenericMessageResponse.builder().message(message).success(true).build();
    }

    public static GenericMessageResponse of(String message, boolean success) {
        return GenericMessageResponse.builder().message(message).success(success).build();
    }
}
