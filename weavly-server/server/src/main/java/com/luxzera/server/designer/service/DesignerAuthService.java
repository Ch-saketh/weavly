package com.luxzera.server.designer.service;

import com.luxzera.server.designer.dto.DesignerAuthResponse;
import com.luxzera.server.designer.dto.DesignerLoginRequest;
import com.luxzera.server.designer.dto.DesignerProfileDto;
import com.luxzera.server.designer.dto.DesignerRegisterRequest;
import com.luxzera.server.designer.entity.Designer;

public interface DesignerAuthService {

    DesignerAuthResponse register(DesignerRegisterRequest request);

    DesignerAuthResponse register(DesignerRegisterRequest request, String ipAddress, String userAgent);

    DesignerAuthResponse login(DesignerLoginRequest request);

    DesignerAuthResponse login(DesignerLoginRequest request, String ipAddress, String userAgent);

    DesignerProfileDto getAuthenticatedDesignerProfile(String designerEmail);

    Designer getAuthenticatedDesigner(String designerEmail);
}
