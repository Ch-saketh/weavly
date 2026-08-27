package com.luxzera.server.email.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ResendEmailGatewayImpl implements ResendEmailGateway {

    private static final Logger log = LoggerFactory.getLogger(ResendEmailGatewayImpl.class);
    private static final String MISSING_API_KEY_MESSAGE =
            "Missing Resend API key. Set RESEND_API_KEY in the runtime environment.";

    @Value("${resend.api.key:}")
    private String apiKey;

    private Resend resend;

    @PostConstruct
    void init() {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("{} Email delivery will be unavailable until it is configured.", MISSING_API_KEY_MESSAGE);
            return;
        }

        this.resend = new Resend(apiKey.trim());
    }

    @Override
    public CreateEmailResponse send(CreateEmailOptions options) throws ResendException {
        if (resend == null) {
            throw new IllegalStateException(MISSING_API_KEY_MESSAGE);
        }
        return resend.emails().send(options);
    }
}
