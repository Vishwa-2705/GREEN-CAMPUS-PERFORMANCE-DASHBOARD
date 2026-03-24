import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config

def send_admin_reply_email(user_email, user_name, subject, reply_text):
    """Send admin reply to user via email"""
    try:
        # Create message
        message = MIMEMultipart()
        message['From'] = Config.EMAIL_ADDRESS
        message['To'] = user_email
        message['Subject'] = f"Re: {subject}"
        
        # Email body
        body = f"""
        Hello {user_name},
        
        Thank you for reaching out to Green Campus Dashboard.
        
        Here is the admin's reply to your inquiry:
        
        {reply_text}
        
        If you have any further questions, feel free to contact us again.
        
        Best regards,
        Green Campus Team
        """
        
        message.attach(MIMEText(body, 'plain'))
        
        # Send email
        server = smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT)
        server.starttls()
        server.login(Config.EMAIL_ADDRESS, Config.EMAIL_PASSWORD)
        server.send_message(message)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
