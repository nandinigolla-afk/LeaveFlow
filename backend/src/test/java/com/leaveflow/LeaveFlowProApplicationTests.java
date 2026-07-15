package com.leaveflow;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class LeaveFlowProApplicationTests {

    @Test
    void contextLoads() {
        // Verifies the full Spring context wires up correctly:
        // all beans, JPA entity mappings, and Spring Security configuration.
    }
}
