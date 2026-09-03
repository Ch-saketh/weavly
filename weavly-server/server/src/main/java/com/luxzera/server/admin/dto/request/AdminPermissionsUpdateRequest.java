package com.luxzera.server.admin.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminPermissionsUpdateRequest {
    @Builder.Default
    private List<String> grantedPermissions = new ArrayList<>();

    @Builder.Default
    private List<String> revokedPermissions = new ArrayList<>();
}
