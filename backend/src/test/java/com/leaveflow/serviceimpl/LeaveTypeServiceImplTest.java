package com.leaveflow.serviceimpl;

import com.leaveflow.dto.request.LeaveTypeRequest;
import com.leaveflow.dto.response.LeaveTypeResponse;
import com.leaveflow.entity.LeaveType;
import com.leaveflow.exception.ConflictException;
import com.leaveflow.mapper.LeaveTypeMapper;
import com.leaveflow.repository.LeaveTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LeaveTypeServiceImplTest {

    @Mock
    private LeaveTypeRepository leaveTypeRepository;

    @Mock
    private LeaveTypeMapper leaveTypeMapper;

    @InjectMocks
    private LeaveTypeServiceImpl leaveTypeService;

    private LeaveTypeRequest request;

    @BeforeEach
    void setUp() {
        request = new LeaveTypeRequest();
        request.setName("Sabbatical");
        request.setCode("SAB");
        request.setDefaultAnnualDays(BigDecimal.valueOf(30));
        request.setRequiresApproval(true);
        request.setActive(true);
        request.setColorHex("#6366F1");
    }

    @Test
    void create_throwsConflict_whenCodeAlreadyExists() {
        when(leaveTypeRepository.findByCodeIgnoreCase("SAB"))
                .thenReturn(Optional.of(LeaveType.builder().code("SAB").build()));

        assertThatThrownBy(() -> leaveTypeService.create(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void create_savesAndReturnsMappedResponse_whenCodeIsUnique() {
        when(leaveTypeRepository.findByCodeIgnoreCase("SAB")).thenReturn(Optional.empty());

        LeaveType saved = LeaveType.builder()
                .id(1L).name("Sabbatical").code("SAB")
                .defaultAnnualDays(BigDecimal.valueOf(30))
                .requiresApproval(true).active(true).colorHex("#6366F1")
                .build();
        when(leaveTypeRepository.save(any(LeaveType.class))).thenReturn(saved);

        LeaveTypeResponse expected = LeaveTypeResponse.builder()
                .id(1L).name("Sabbatical").code("SAB")
                .defaultAnnualDays(BigDecimal.valueOf(30))
                .requiresApproval(true).active(true).colorHex("#6366F1")
                .build();
        when(leaveTypeMapper.toResponse(saved)).thenReturn(expected);

        LeaveTypeResponse result = leaveTypeService.create(request);

        assertThat(result.getCode()).isEqualTo("SAB");
        assertThat(result.getDefaultAnnualDays()).isEqualByComparingTo("30");
    }
}
