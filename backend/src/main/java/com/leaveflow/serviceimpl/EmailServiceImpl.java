package com.leaveflow.serviceimpl;

import com.leaveflow.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Override
    public void sendPasswordResetEmail(String toEmail, String fullName, String resetLink) {
        String subject = "Reset your LeaveFlow Pro password";
        String body = """
                <p>Hi %s,</p>
                <p>We received a request to reset your LeaveFlow Pro password. Click the link below to choose a new one:</p>
                <p><a href="%s">Reset Password</a></p>
                <p>This link expires in 30 minutes. If you didn't request this, you can safely ignore this email.</p>
                <p>— The LeaveFlow Pro Team</p>
                """.formatted(fullName, resetLink);
        send(toEmail, subject, body);
    }

    @Override
    public void sendWelcomeEmail(String toEmail, String fullName) {
        String subject = "Welcome to LeaveFlow Pro";
        String body = """
                <p>Hi %s,</p>
                <p>Your LeaveFlow Pro account has been created successfully. You can now log in and start managing your leave requests.</p>
                <p>— The LeaveFlow Pro Team</p>
                """.formatted(fullName);
        send(toEmail, subject, body);
    }

    private void send(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException | RuntimeException ex) {
            // Do not fail the request flow if mail delivery fails; log and move on.
            log.error("Failed to send email to {}: {}", to, ex.getMessage());
        }
    }
}
