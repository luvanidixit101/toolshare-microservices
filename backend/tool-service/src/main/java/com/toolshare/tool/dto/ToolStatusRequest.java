package com.toolshare.tool.dto;

import jakarta.validation.constraints.NotNull;

public record ToolStatusRequest(@NotNull Boolean available) {
}

