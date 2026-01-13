"""Email service for sending invites and notifications."""
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

try:
    import aiosmtplib
    SMTP_AVAILABLE = True
except ImportError:
    SMTP_AVAILABLE = False

from ..config import get_settings

settings = get_settings()


class EmailService:
    """Service for sending emails."""

    def __init__(self):
        self.host = settings.smtp_host
        self.port = settings.smtp_port
        self.user = settings.smtp_user
        self.password = settings.smtp_password
        self.from_addr = settings.smtp_from
        self.app_url = settings.app_url

    @property
    def is_configured(self) -> bool:
        """Check if email is configured."""
        return bool(self.host and self.user and self.password)

    async def send_email(
        self,
        to: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None
    ) -> bool:
        """Send an email."""
        if not SMTP_AVAILABLE:
            print(f"[EMAIL] aiosmtplib not installed. Would send to: {to}")
            print(f"[EMAIL] Subject: {subject}")
            return False

        if not self.is_configured:
            print(f"[EMAIL] Not configured. Would send to: {to}")
            print(f"[EMAIL] Subject: {subject}")
            return False

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.from_addr
            msg["To"] = to

            if text_body:
                msg.attach(MIMEText(text_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            await aiosmtplib.send(
                msg,
                hostname=self.host,
                port=self.port,
                username=self.user,
                password=self.password,
                start_tls=True
            )
            return True

        except Exception as e:
            print(f"[EMAIL] Failed to send: {e}")
            return False

    async def send_invite(self, email: str, token: str, role_name: str, inviter_name: str) -> bool:
        """Send an invitation email."""
        invite_url = f"{self.app_url}/portal/invite/{token}"

        subject = "You're invited to Elektrokombinacija Portal"

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .button {{
                    display: inline-block;
                    padding: 12px 24px;
                    background: #00d4ff;
                    color: #000;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                }}
                .footer {{ margin-top: 30px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>You're Invited!</h1>
                <p>{inviter_name} has invited you to join the Elektrokombinacija Portal as <strong>{role_name}</strong>.</p>
                <p>Click the button below to accept the invitation and create your account:</p>
                <p style="margin: 30px 0;">
                    <a href="{invite_url}" class="button">Accept Invitation</a>
                </p>
                <p>Or copy this link: <br><code>{invite_url}</code></p>
                <p>This invitation expires in {settings.invite_expire_days} days.</p>
                <div class="footer">
                    <p>Elektrokombinacija - Modular EV Charging Infrastructure</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_body = f"""
You're Invited!

{inviter_name} has invited you to join the Elektrokombinacija Portal as {role_name}.

Accept the invitation here: {invite_url}

This invitation expires in {settings.invite_expire_days} days.

--
Elektrokombinacija - Modular EV Charging Infrastructure
        """

        return await self.send_invite(email, subject, html_body, text_body)

    def send_invite_sync(self, email: str, token: str, role_name: str, inviter_name: str) -> bool:
        """Synchronous wrapper for send_invite."""
        try:
            loop = asyncio.get_event_loop()
            return loop.run_until_complete(
                self.send_invite(email, token, role_name, inviter_name)
            )
        except RuntimeError:
            # No event loop running
            return asyncio.run(
                self.send_invite(email, token, role_name, inviter_name)
            )


# Singleton instance
email_service = EmailService()
