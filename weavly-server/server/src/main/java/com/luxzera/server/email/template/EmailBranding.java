package com.luxzera.server.email.template;

import org.springframework.stereotype.Component;

@Component("emailBranding")
public final class EmailBranding {

    public static final String BRAND_NAME = "LuxZera";
    public static final String HOME_URL = "https://luxzera.store";
    public static final String LOGO_URL = "https://pub-b09de1c5dd3640839563534a412f1988.r2.dev/LuxZera.png";
    public static final String FAVICON_URL = "https://pub-b09de1c5dd3640839563534a412f1988.r2.dev/favicon.png";

    public String getBrandName() {
        return BRAND_NAME;
    }

    public String getHomeUrl() {
        return HOME_URL;
    }

    public String getLogoUrl() {
        return LOGO_URL;
    }

    public String getFaviconUrl() {
        return FAVICON_URL;
    }
}
