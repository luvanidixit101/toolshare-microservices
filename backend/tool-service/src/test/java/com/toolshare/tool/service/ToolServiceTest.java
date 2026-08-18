package com.toolshare.tool.service;

import com.toolshare.tool.dto.ToolPatchRequest;
import com.toolshare.tool.exception.ApiException;
import com.toolshare.tool.model.Tool;
import com.toolshare.tool.model.ToolCondition;
import com.toolshare.tool.repository.ToolRepository;
import com.toolshare.tool.security.CurrentUser;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ToolServiceTest {

    private final ToolRepository repository = mock(ToolRepository.class);
    private final ToolService service = new ToolService(repository);

    @Test
    void patchRejectsNonOwner() {
        UUID ownerId = UUID.randomUUID();
        Tool tool = new Tool();
        tool.setId(UUID.randomUUID());
        tool.setOwnerId(ownerId);
        tool.setOwnerName("Owner");
        tool.setName("Drill");
        tool.setCategory("POWER_TOOLS");
        tool.setDescription("Cordless drill");
        tool.setCondition(ToolCondition.GOOD);
        tool.setPricePerDay(BigDecimal.TEN);
        tool.setSecurityDeposit(BigDecimal.TEN);
        tool.setLocation("Delhi");

        when(repository.findById(tool.getId())).thenReturn(Optional.of(tool));
        when(repository.save(any(Tool.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThatThrownBy(() -> service.patch(tool.getId(), new ToolPatchRequest("New Drill", null, null, null, null, null, null, null, null, null, null, null),
                new CurrentUser(UUID.randomUUID(), "other@example.com", "Other", "User", "USER")))
                .isInstanceOf(ApiException.class)
                .hasMessage("Only the owner or an admin can manage this tool");
    }
}

