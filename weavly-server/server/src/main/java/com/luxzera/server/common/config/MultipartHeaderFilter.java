package com.luxzera.server.common.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE) // Run this before Spring Security or Spring MVC checks anything!
public class MultipartHeaderFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (request instanceof HttpServletRequest httpRequest) {
            String contentType = httpRequest.getContentType();

            if (contentType != null && contentType.toLowerCase().startsWith("multipart/form-data")) {
                String sanitizedContentType = sanitizeMultipartContentType(contentType);

                if (sanitizedContentType.equals(contentType)) {
                    chain.doFilter(request, response);
                    return;
                }

                HttpServletRequestWrapper wrappedRequest = new HttpServletRequestWrapper(httpRequest) {
                    @Override
                    public String getContentType() {
                        return sanitizedContentType;
                    }

                    @Override
                    public String getHeader(String name) {
                        if ("Content-Type".equalsIgnoreCase(name)) {
                            return sanitizedContentType;
                        }
                        return super.getHeader(name);
                    }

                    @Override
                    public Enumeration<String> getHeaders(String name) {
                        if ("Content-Type".equalsIgnoreCase(name)) {
                            return Collections.enumeration(List.of(sanitizedContentType));
                        }
                        return super.getHeaders(name);
                    }
                };

                chain.doFilter(wrappedRequest, response);
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private String sanitizeMultipartContentType(String contentType) {
        String[] parts = contentType.split(";");
        List<String> sanitizedParts = new ArrayList<>();
        sanitizedParts.add(parts[0].trim());

        for (int i = 1; i < parts.length; i++) {
            String part = parts[i].trim();
            if (!part.toLowerCase().startsWith("charset=")) {
                sanitizedParts.add(part);
            }
        }

        return String.join(";", sanitizedParts);
    }
}
