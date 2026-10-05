package com.jobtracker.application.dto;

import com.jobtracker.application.domain.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ChangeApplicationStatusRequest(
		@NotNull(message = "지원 상태를 선택해 주세요.")
		ApplicationStatus status,

		@Size(max = 1000, message = "기록은 1000자 이하여야 합니다.")
		String note
) {
}
