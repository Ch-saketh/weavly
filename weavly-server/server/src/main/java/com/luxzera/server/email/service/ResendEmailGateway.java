package com.luxzera.server.email.service;

import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;

public interface ResendEmailGateway {
    CreateEmailResponse send(CreateEmailOptions options) throws ResendException;
}
