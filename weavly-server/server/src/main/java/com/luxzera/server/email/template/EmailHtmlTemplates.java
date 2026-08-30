package com.luxzera.server.email.template;

public final class EmailHtmlTemplates {

    private EmailHtmlTemplates() {
    }

    /*
     * ------------------------------------------------------------
     * OTP EMAIL
     * ------------------------------------------------------------
     */

    public static String buildOtpTemplate(String otp) {

        String body =

                EmailComponents.eyebrow(
                        "Secure verification"
                )

                        + EmailComponents.paragraph(
                        "Use the verification code below to complete your Weavly sign in."
                )

                        + EmailComponents.otpBox(otp)

                        + EmailComponents.securityNote(
                        "Keep this code private",
                        "Weavly will never ask for this code outside the app. If you didn't request this email, you can safely ignore it."
                )

                        + EmailComponents.muted(
                        "This code expires in 15 minutes."
                );

        return EmailLayout.build(
                "Verify your email",
                body
        );
    }

    /*
     * ------------------------------------------------------------
     * RESEND OTP
     * ------------------------------------------------------------
     */

    public static String buildResendOtpTemplate(String otp) {

        String body =

                EmailComponents.eyebrow(
                        "New code issued"
                )

                        + EmailComponents.paragraph(
                        "Use the latest verification code below to continue with your Weavly account."
                )

                        + EmailComponents.otpBox(otp)

                        + EmailComponents.securityNote(
                        "Only use the latest code",
                        "Earlier verification codes are no longer valid after a new one is requested."
                )

                        + EmailComponents.muted(
                        "This code expires in 15 minutes."
                );

        return EmailLayout.build(
                "Your new verification code",
                body
        );
    }

    /*
     * ------------------------------------------------------------
     * FORGOT PASSWORD
     * ------------------------------------------------------------
     */

    public static String buildForgotPasswordTemplate(String resetLink) {

        String body =

                EmailComponents.paragraph(
                        "We received a request to reset your Weavly password."
                )

                        + EmailComponents.button(
                        "Reset Password",
                        resetLink
                )

                        + EmailComponents.muted(
                        "This password reset link expires in 15 minutes."
                );

        return EmailLayout.build(
                "Reset your password",
                body
        );
    }

    /*
     * ------------------------------------------------------------
     * PASSWORD CHANGED
     * ------------------------------------------------------------
     */

    public static String buildPasswordChangedTemplate() {

        String body =

                EmailComponents.paragraph(
                        "Your Weavly password has been changed successfully."
                )

                        + EmailComponents.muted(
                        "If you didn't make this change, contact support immediately."
                );

        return EmailLayout.build(
                "Password updated",
                body
        );
    }

    /*
     * ------------------------------------------------------------
     * WELCOME EMAIL
     * ------------------------------------------------------------
     */

    public static String buildWelcomeTemplate(String firstName) {

        String body =

                EmailComponents.paragraph(
                        "Hi " + escape(firstName) + ","
                )

                        + EmailComponents.paragraph(
                        "Welcome to Weavly. We're excited to have you join our community."
                );

        return EmailLayout.build(
                "Welcome to Weavly",
                body
        );
    }

    /*
     * ------------------------------------------------------------
     * ADMIN ALERT
     * ------------------------------------------------------------
     */

    public static String buildAdminAlertTemplate(
            String name,
            String email,
            String phone,
            String reason
    ) {

        String body =

                EmailComponents.paragraph(
                        "A new administrator has requested platform access."
                )

                        + EmailComponents.detailRow("Name", name)

                        + EmailComponents.detailRow("Email", email)

                        + EmailComponents.detailRow("Phone", phone)

                        + EmailComponents.detailRow("Reason", reason);

        return EmailLayout.build(
                "Admin Access Request",
                body
        );
    }

    /*
     * ------------------------------------------------------------
     * ADMIN APPROVED
     * ------------------------------------------------------------
     */

    public static String buildApprovalTemplate(String name) {

        String body =

                EmailComponents.paragraph(
                        "Hi " + escape(name) + ","
                )

                        + EmailComponents.paragraph(
                        "Your administrator account has been approved."
                )

                        + EmailComponents.muted(
                        "You can now sign in using your registered email address."
                );

        return EmailLayout.build(
                "Access Approved",
                body
        );
    }

    /*
     * ------------------------------------------------------------
     * ESCAPE
     * ------------------------------------------------------------
     */

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
