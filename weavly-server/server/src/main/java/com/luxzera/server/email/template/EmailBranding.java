package com.luxzera.server.email.template;

import org.springframework.stereotype.Component;

@Component("emailBranding")
public final class EmailBranding {

    public static final String BRAND_NAME = "Weavly";
    public static final String HOME_URL = "https://weavly.store";
    public static final String LOGO_URL = "https://raw.githubusercontent.com/Ch-saketh/weavly/main/weavly-client/LUXZERA/frontend/public/weavly.png";
    public static final String FAVICON_URL = "https://raw.githubusercontent.com/Ch-saketh/weavly/main/weavly-client/LUXZERA/frontend/public/weavly.png";

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
