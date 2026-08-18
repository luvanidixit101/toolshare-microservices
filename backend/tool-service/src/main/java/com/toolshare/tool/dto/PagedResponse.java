package com.toolshare.tool.dto;

import java.util.List;

public record PagedResponse<T>(
        boolean success,
        String message,
        List<T> data,
        List<T> items,
        int page,
        int size,
        long totalElements,
        long total,
        int totalPages
) {
    public static <T> PagedResponse<T> of(String message, List<T> items, int page, int size, long totalElements, int totalPages) {
        return new PagedResponse<>(true, message, items, items, page, size, totalElements, totalElements, totalPages);
    }
}

