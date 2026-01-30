import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

SMTP_EMAIL = "aryanbhekare05@gmail.com"   # <-- YOUR EMAIL
SMTP_PASSWORD = "bejafwsfmfooluvy"  # <-- PASTE APP PASSWORD HERE

def send_reset_email(to_email: str, reset_link: str):
    msg = MIMEMultipart()
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email
    msg["Subject"] = "Reset Your Password"

    body = f"""
    Hi,

    Click the link below to reset your password:
    {reset_link}

    This link expires in 15 minutes.

    If you didn't request this, ignore this email.
    """

    msg.attach(MIMEText(body, "plain"))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        server.quit()

        print("✅ Reset email sent successfully")

    except Exception as e:
        print("❌ Email sending failed:", str(e))
