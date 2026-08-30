package com.luxzera.server.email.template;

public final class EmailComponents {

    private EmailComponents() {
    }

    public static String header() {
        return "<div class=\"center\">"
                + "<a class=\"logo-link\" href=\"" + EmailBranding.HOME_URL + "\" aria-label=\"" + EmailBranding.BRAND_NAME + " home\">"
                + "<span class=\"logo-text\">" + EmailBranding.BRAND_NAME + "</span>"
                + "</a>"
                + "<div class=\"divider\"></div>"
                + "</div>";
    }

    public static String footer() {
        return "<div class=\"footer\">"
                + "<a class=\"logo-link\" href=\"" + EmailBranding.HOME_URL + "\" aria-label=\"" + EmailBranding.BRAND_NAME + " home\">"
                + "<span class=\"footer-logo-text\">" + EmailBranding.BRAND_NAME + "</span>"
                + "</a>"
                + "<div class=\"footer-text\">"
                + "Crafting the future of fashion."
                + "<br><br>"
                + "support@weavly.store"
                + "<br>"
                + "<a href=\"" + EmailBranding.HOME_URL + "\">weavly.store</a>"
                + "</div>"
                + "<div class=\"footer-links\">"
                + "<a href=\"#\">Privacy</a>"
                + "<a href=\"#\">Terms</a>"
                + "<a href=\"#\">Contact</a>"
                + "</div>"
                + "<div style=\"margin-top:24px;color:#999999;font-size:13px;\">"
                + "© 2026 " + EmailBranding.BRAND_NAME + ". All rights reserved."
                + "</div>"
                + "</div>";
    }

    public static String title(String title) {

        return "<h1>" + escape(title) + "</h1>";

    }

    public static String eyebrow(String text) {

        return "<div class=\"eyebrow\">" + escape(text) + "</div>";

    }

    public static String paragraph(String text) {

        return "<p>" + escape(text) + "</p>";

    }

    public static String muted(String text) {

        return "<div class=\"muted\">"

                + escape(text)

                + "</div>";

    }

    public static String otpBox(String otp) {
        return "<div class=\"code-box\">"
                + "<div class=\"code-label\">One-time verification code</div>"
                + "<div class=\"otp\">" + escape(otp) + "</div>"
                + "<div class=\"code-meta\">Valid for 15 minutes</div>"
                + "<div class=\"copy\">Copy this code and paste it into " + EmailBranding.BRAND_NAME + ".</div>"
                + "</div>";
    }

    public static String securityNote(String title, String text) {

        return "<div class=\"security-note\">"
                + "<div class=\"security-title\">" + escape(title) + "</div>"
                + "<div>" + escape(text) + "</div>"
                + "</div>";

    }

    public static String button(String text, String link) {

        return """
            <div class="center">

                <a
                    class="button"
                    href="
            """

                + escape(link)

                +

                """
                    ">
            """

                + escape(text)

                +

                """
                </a>

            </div>
            """;

    }

    public static String detailRow(String title, String value) {

        return """
                <div class="detail">

                    <div class="detail-title">
            """

                + escape(title)

                +

                """
                    </div>

                    <div class="detail-value">
            """

                + escape(value)

                +

                """
                    </div>

                </div>
                """;

    }

    private static String escape(String value) {

        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
