package com.leaveflow.service;

public interface EmailService {
    void sendPasswordResetEmail(String toEmail, String fullName, String resetLink);
    void sendWelcomeEmail(String toEmail, String fullName);
}
