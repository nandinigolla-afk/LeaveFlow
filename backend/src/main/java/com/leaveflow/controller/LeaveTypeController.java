package com.leaveflow.controller;

import com.leaveflow.dto.request.LeaveTypeRequest;
import com.leaveflow.dto.response.ApiResponse;
import com.leaveflow.dto.response.LeaveTypeResponse;
import com.leaveflow.service.LeaveTypeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leave-types")
@RequiredArgsConstructor
@Tag(name = "Leave Types")
public class LeaveTypeController {

    private final LeaveTypeService leaveTypeService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LeaveTypeResponse>> create(@Valid @RequestBody LeaveTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Leave type created", leaveTypeService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LeaveTypeResponse>> update(@PathVariable Long id, @Valid @RequestBody LeaveTypeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Leave type updated", leaveTypeService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        leaveTypeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Leave type deactivated", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaveTypeResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(leaveTypeService.getAll()));
    }
}
