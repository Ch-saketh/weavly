package com.luxzera.server.email.template;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EmailHtmlTemplatesTest {

    @Test
    void buildOtpTemplate_includesOtpAndExpectedCopy() {
        String html = EmailHtmlTemplates.buildOtpTemplate("123456");

        assertTrue(html.contains("Verify your email"));
        assertTrue(html.contains("<div class=\"otp\">123456</div>"));
        assertTrue(html.contains("expires in 15 minutes"));
        assertTrue(html.contains(EmailBranding.BRAND_NAME));
        assertTrue(html.contains("href=\"" + EmailBranding.HOME_URL + "\""));
        assertFalse(html.contains("zera-icon.png"));
    }

    @Test
    void buildForgotPasswordTemplate_escapesResetLink() {
        String html = EmailHtmlTemplates.buildForgotPasswordTemplate("https://example.com/reset?token=a&b=<x>");

        assertTrue(html.contains("Reset your password"));
        assertTrue(html.contains("https://example.com/reset?token=a&amp;b=&lt;x&gt;"));
        assertFalse(html.contains("href=\"https://example.com/reset?token=a&b=<x>\""));
    }

    @Test
    void buildAdminAlertTemplate_escapesUserProvidedFields() {
        String html = EmailHtmlTemplates.buildAdminAlertTemplate(
                "A&B <Admin>",
                "user@example.com",
                "+1-555-0100",
                "Need access for <ops> & \"support\""
        );

        assertTrue(html.contains("Admin Access Request"));
        assertTrue(html.contains("A&amp;B &lt;Admin&gt;"));
        assertTrue(html.contains("Need access for &lt;ops&gt; &amp; &quot;support&quot;"));
    }

    @Test
    void buildApprovalTemplate_handlesNullValuesSafely() {
        String html = EmailHtmlTemplates.buildApprovalTemplate(null);

        assertTrue(html.contains("Access Approved"));
        assertTrue(html.contains("Hi ,"));
    }
}
