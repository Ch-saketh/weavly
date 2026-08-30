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

                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&display=swap" rel="stylesheet">

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