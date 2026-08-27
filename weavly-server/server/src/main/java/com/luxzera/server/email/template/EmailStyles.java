package com.luxzera.server.email.template;

public final class EmailStyles {

    private EmailStyles() {}

    public static String styles() {
        return """
        <style>

        *{
            margin:0;
            padding:0;
            box-sizing:border-box;
        }

        body{
            margin:0;
            padding:0;
            background:#F8F8F6;
            font-family:
                Inter,
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                Helvetica,
                Arial,
                sans-serif;
            color:#111111;
        }

        a{
            text-decoration:none;
        }

        img{
            display:block;
            border:none;
            outline:none;
            height:auto;
        }

        .wrapper{
            width:100%;
            background:#F8F8F6;
            padding:60px 20px;
        }

        .card{

            max-width:600px;

            margin:auto;

            background:#FFFFFF;

            border:1px solid #ECECEC;

            border-radius:24px;

            padding:56px;

        }

        .logo-link{
            display:inline-block;
        }

        .logo{
            width:180px;
            max-width:70%;
            height:auto;
            margin:0 auto 18px;
        }

        .divider{

            width:70px;

            height:1px;

            background:#E5E7EB;

            margin:0 auto 42px;

        }

        h1{

            font-size:34px;

            font-weight:700;

            line-height:1.25;

            color:#111111;

            text-align:center;

            margin-bottom:18px;

        }

        .eyebrow{

            color:#A66A2C;

            font-size:12px;

            font-weight:700;

            letter-spacing:1.6px;

            margin-bottom:14px;

            text-align:center;

            text-transform:uppercase;

        }

        p{

            font-size:17px;

            line-height:1.8;

            color:#555555;

            margin-bottom:20px;

        }

        .center{

            text-align:center;

        }

        .code-box{

            background:#111111;

            border:1px solid #2A2A2A;

            border-radius:20px;

            box-shadow:0 18px 44px rgba(17,17,17,0.16);

            padding:30px 28px;

            text-align:center;

            margin:34px 0;

        }

        .code-label{

            color:#C9A46A;

            font-size:12px;

            font-weight:700;

            letter-spacing:1.4px;

            margin-bottom:16px;

            text-transform:uppercase;

        }

        .otp{

            font-size:42px;

            letter-spacing:12px;

            font-weight:700;

            color:#FFFFFF;

            font-family:
                SFMono-Regular,
                Consolas,
                monospace;

        }

        .code-meta{

            color:#D1D5DB;

            font-size:13px;

            margin-top:14px;

        }

        .copy{

            margin-top:18px;

            font-size:14px;

            color:#B6BDC8;

        }

        .security-note{

            background:#FFF8F0;

            border:1px solid #F0DFC8;

            border-radius:16px;

            color:#6B4A24;

            font-size:14px;

            line-height:1.7;

            margin-top:26px;

            padding:18px 20px;

        }

        .security-title{

            color:#111111;

            font-size:14px;

            font-weight:700;

            margin-bottom:6px;

        }

        .button{

            display:inline-block;

            background:#111111;

            color:#FFFFFF !important;

            padding:16px 34px;

            border-radius:999px;

            font-weight:600;

            font-size:16px;

            margin:30px auto;

        }

        .button:hover{

            background:#000000;

        }

        .detail{

            border:1px solid #ECECEC;

            border-radius:14px;

            padding:18px;

            margin-bottom:14px;

        }

        .detail-title{

            font-size:12px;

            color:#888888;

            text-transform:uppercase;

            margin-bottom:6px;

            letter-spacing:1px;

        }

        .detail-value{

            font-size:16px;

            color:#111111;

            word-break:break-word;

        }

        .muted{

            color:#777777;

            font-size:14px;

            line-height:1.7;

            text-align:center;

            margin-top:24px;

        }

        .footer{

            margin-top:52px;

            border-top:1px solid #ECECEC;

            padding-top:32px;

            text-align:center;

        }

        .footer-logo{
            width:132px;
            max-width:55%;
            height:auto;
            margin:0 auto 14px;
        }

        .footer-text{

            font-size:14px;

            color:#777777;

            line-height:1.7;

        }

        .footer-text a{
            color:#777777;
            text-decoration:underline;
        }

        .footer-links{

            margin-top:18px;

        }

        .footer-links a{

            color:#555555;

            margin:0 10px;

            font-size:14px;

        }

        @media only screen and (max-width:640px){

            .wrapper{

                padding:24px 14px;

            }

            .card{

                padding:34px 26px;

                border-radius:18px;

            }

            h1{

                font-size:28px;

            }

            .otp{

                font-size:34px;

                letter-spacing:8px;

            }

        }

        </style>
        """;
    }
}
