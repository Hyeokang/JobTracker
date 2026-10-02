package com.jobtracker.common.exception;

import java.time.Instant;
import java.util.Map;

public record ErrorResponse(
		Instant timestamp,
		int status,
		String code,
		String message,
		Map<String, String> fieldErrors
) {
	public static ErrorResponse of(int status, String code, String message) {
		return new ErrorResponse(Instant.now(), status, code, message, Map.of());
	}

	public static ErrorResponse validation(int status, Map<String, String> fieldErrors) {
		return new ErrorResponse(
				Instant.now(),
				status,
				"VALIDATION_ERROR",
				"입력값을 확인해 주세요.",
				fieldErrors
		);
	}
}
