package com.leaveflow.security;

import com.leaveflow.exception.BadRequestException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    public UserPrincipal getCurrentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new BadRequestException("No authenticated user in context.");
        }
        return principal;
    }

    public Long getCurrentEmployeeId() {
        return getCurrentPrincipal().getEmployeeId();
    }

    public Long getCurrentUserId() {
        return getCurrentPrincipal().getUserId();
    }

    public boolean hasRole(String role) {
        return getCurrentPrincipal().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }
}
