package com.toolshare.user.dto;

import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record PreferencesRequest(@NotNull Map<String, String> preferences) {
}

