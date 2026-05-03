export const generateVerificationEmailTemplate = (userName: string, otp: string, appName: string = "Revlytics") => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 30px;
            border-bottom: 2px solid #f0f0f0;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .title {
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 20px;
        }
        .greeting {
            font-size: 16px;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .otp-section {
            background-color: #f9fafb;
            border: 2px dashed #e5e7eb;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #6b7280;
            letter-spacing: 1px;
            margin-bottom: 12px;
        }
        .otp-code {
            font-size: 36px;
            font-weight: 700;
            color: #2563eb;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin-bottom: 15px;
        }
        .otp-expiry {
            font-size: 12px;
            color: #ef4444;
            font-weight: 600;
        }
        .instructions {
            background-color: #eff6ff;
            border-left: 4px solid #2563eb;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .instructions-title {
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .instructions-list {
            font-size: 14px;
            color: #1e3a8a;
            margin: 0;
            padding-left: 20px;
        }
        .instructions-list li {
            margin-bottom: 8px;
        }
        .footer {
            text-align: center;
            padding-top: 30px;
            border-top: 2px solid #f0f0f0;
            margin-top: 30px;
            font-size: 12px;
            color: #6b7280;
        }
        .security-note {
            background-color: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 4px;
            padding: 12px;
            margin: 20px 0;
            font-size: 12px;
            color: #92400e;
        }
        .button-group {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 0 10px;
        }
        .button:hover {
            background-color: #1d4ed8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">${appName}</div>
            <div class="title">Verify Your Email</div>
            <div class="subtitle">Complete your account setup in seconds</div>
        </div>

        <div class="greeting">
            Hello ${userName},
        </div>

        <p>
            Thank you for signing up with ${appName}. To complete your account setup and start accessing market intelligence features, please verify your email address using the code below.
        </p>

        <div class="otp-section">
            <div class="otp-label">Your Verification Code</div>
            <div class="otp-code">${otp}</div>
            <div class="otp-expiry">⏱️ This code expires in 10 minutes</div>
        </div>

        <div class="instructions">
            <div class="instructions-title">How to verify your email:</div>
            <ul class="instructions-list">
                <li>Copy the 6-digit code above</li>
                <li>Go to the verification page in your ${appName} account</li>
                <li>Paste the code and click "Verify Email"</li>
                <li>That's it! Your account will be activated</li>
            </ul>
        </div>

        <div class="security-note">
            🔒 <strong>Security Note:</strong> Never share this code with anyone. ${appName} staff will never ask for this code via email or support.
        </div>

        <p style="margin-top: 20px; color: #6b7280;">
            If you didn't create this account, you can safely ignore this email.
        </p>

        <div class="footer">
            <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            <p style="margin-top: 10px; color: #9ca3af;">
                Questions? Contact our support team at support@revlytics.com
            </p>
        </div>
    </div>
</body>
</html>
    `;
};
