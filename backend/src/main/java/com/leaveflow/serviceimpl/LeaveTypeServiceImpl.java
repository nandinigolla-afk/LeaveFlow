package com.leaveflow.serviceimpl;

import com.leaveflow.dto.request.LeaveTypeRequest;
import com.leaveflow.dto.response.LeaveTypeResponse;
import com.leaveflow.entity.LeaveType;
import com.leaveflow.exception.ConflictException;
import com.leaveflow.exception.ResourceNotFoundException;
import com.leaveflow.mapper.LeaveTypeMapper;
import com.leaveflow.repository.LeaveTypeRepository;
import com.leaveflow.service.LeaveTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveTypeServiceImpl implements LeaveTypeService {

    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveTypeMapper leaveTypeMapper;

    @Override
    @Transactional
    public LeaveTypeResponse create(LeaveTypeRequest request) {
        if (leaveTypeRepository.findByCodeIgnoreCase(request.getCode()).isPresent()) {
            throw new ConflictException("A leave type with this code already exists.");
        }
        LeaveType leaveType = LeaveType.builder()
                .name(request.getName())
                .code(request.getCode().toUpperCase())
                .defaultAnnualDays(request.getDefaultAnnualDays())
                .requiresApproval(request.isRequiresApproval())
                .active(request.isActive())
                .colorHex(request.getColorHex() != null ? request.getColorHex() : "#6366F1")
                .build();
        leaveType = leaveTypeRepository.save(leaveType);
        return leaveTypeMapper.toResponse(leaveType);
    }

    @Override
    @Transactional
    public LeaveTypeResponse update(Long id, LeaveTypeRequest request) {
        LeaveType leaveType = findOrThrow(id);
        leaveType.setName(request.getName());
        leaveType.setDefaultAnnualDays(request.getDefaultAnnualDays());
        leaveType.setRequiresApproval(request.isRequiresApproval());
        leaveType.setActive(request.isActive());
        if (request.getColorHex() != null) {
            leaveType.setColorHex(request.getColorHex());
        }
        leaveType = leaveTypeRepository.save(leaveType);
        return leaveTypeMapper.toResponse(leaveType);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        LeaveType leaveType = findOrThrow(id);
        leaveType.setActive(false);
        leaveTypeRepository.save(leaveType);
    }

    @Override
    public List<LeaveTypeResponse> getAll() {
        return leaveTypeRepository.findAll().stream()
                .map(leaveTypeMapper::toResponse)
                .collect(Collectors.toList());
    }

    private LeaveType findOrThrow(Long id) {
        return leaveTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave type not found with id: " + id));
    }
}
