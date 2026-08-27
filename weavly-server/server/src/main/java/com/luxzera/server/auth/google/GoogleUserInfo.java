package com.luxzera.server.auth.google;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoogleUserInfo {

    private String providerUserId;

    private String email;

    private String firstName;

    private String lastName;
    private boolean emailVerified;

    private String profilePicture;
}
