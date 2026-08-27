package com.luxzera.server.email.template;

public final class EmailLayout {

    private EmailLayout() {
    }

    public static String build(String title, String content) {

        return """
                <!DOCTYPE html>

                <html lang="en">

                <head>

                    <meta charset="UTF-8">

                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0">

                """
                +

                EmailStyles.styles()

                +

                """

                </head>

                <body>

                    <div class="wrapper">

                        <div class="card">

                """

                +

                EmailComponents.header()

                +

                EmailComponents.title(title)

                +

                """

                        <div
                            style="margin-top:32px;">

                """

                +

                content

                +

                """

                        </div>

                """

                +

                EmailComponents.footer()

                +

                """

                        </div>

                    </div>

                </body>

                </html>

                """;

    }

}