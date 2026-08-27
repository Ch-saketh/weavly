package com.luxzera.server.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.ResourceHttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class MultipartCharsetConfig implements WebMvcConfigurer {

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        for (HttpMessageConverter<?> converter : converters) {
            if (converter instanceof ResourceHttpMessageConverter ||
                    converter.getClass().getName().contains("AllEncompassingFormHttpMessageConverter")) {

                // Extract existing supported media types
                List<MediaType> supportedTypes = new ArrayList<>(converter.getSupportedMediaTypes());

                // Explicitly force the mapping system to recognize the appended charset variant as valid
                supportedTypes.add(MediaType.parseMediaType("multipart/form-data;charset=UTF-8"));

                // Re-inject the expanded list into the active converter context
                try {
                    if (converter instanceof org.springframework.http.converter.support.AllEncompassingFormHttpMessageConverter formConverter) {
                        formConverter.setSupportedMediaTypes(supportedTypes);
                    }
                } catch (Exception e) {
                    System.err.println("⚠️ Zera Engine: Could not set explicit multipart media type overrides: " + e.getMessage());
                }
            }
        }
    }
}