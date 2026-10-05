package com.jobtracker.application.dto;

import com.jobtracker.application.domain.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateApplicationRequest(
		@NotNull(message = "채용공고를 선택해 주세요.")
		UUID jobPostingId,

		ApplicationStatus status
) {
}
