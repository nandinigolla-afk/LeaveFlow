package com.leaveflow.serviceimpl;

import com.leaveflow.dto.request.DepartmentRequest;
import com.leaveflow.dto.response.DepartmentResponse;
import com.leaveflow.entity.Department;
import com.leaveflow.exception.ConflictException;
import com.leaveflow.exception.ResourceNotFoundException;
import com.leaveflow.mapper.DepartmentMapper;
import com.leaveflow.repository.DepartmentRepository;
import com.leaveflow.repository.EmployeeRepository;
import com.leaveflow.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentMapper departmentMapper;

    @Override
    @Transactional
    public DepartmentResponse create(DepartmentRequest request) {
        if (departmentRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("A department with this name already exists.");
        }
        Department department = Department.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        department = departmentRepository.save(department);
        return departmentMapper.toResponse(department, 0);
    }

    @Override
    @Transactional
    public DepartmentResponse update(Long id, DepartmentRequest request) {
        Department department = findOrThrow(id);
        department.setName(request.getName());
        department.setDescription(request.getDescription());
        department = departmentRepository.save(department);
        return departmentMapper.toResponse(department, employeeRepository.findByManagerId(id).size());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Department department = findOrThrow(id);
        departmentRepository.delete(department);
    }

    @Override
    public DepartmentResponse getById(Long id) {
        Department department = findOrThrow(id);
        long count = countEmployees(id);
        return departmentMapper.toResponse(department, count);
    }

    @Override
    public List<DepartmentResponse> getAll() {
        return departmentRepository.findAll().stream()
                .map(d -> departmentMapper.toResponse(d, countEmployees(d.getId())))
                .collect(Collectors.toList());
    }

    private long countEmployees(Long departmentId) {
        return employeeRepository.search(null, departmentId, null,
                        org.springframework.data.domain.Pageable.unpaged())
                .getTotalElements();
    }

    private Department findOrThrow(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }
}
