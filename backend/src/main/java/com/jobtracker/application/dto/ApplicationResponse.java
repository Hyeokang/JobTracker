package com.jobtracker.application.dto;

import com.jobtracker.application.domain.Application;
import com.jobtracker.application.domain.ApplicationStatus;

import java.time.Instant;
import java.util.UUID;

public record ApplicationResponse(
		UUID id,
		UUID jobPostingId,
		String companyName,
		String jobTitle,
		ApplicationStatus status,
		Instant createdAt,
		Instant updatedAt
) {
	public static ApplicationResponse from(Application application) {
		return new ApplicationResponse(
				application.getId(),
				application.getJobPosting().getId(),
				application.getJobPosting().getCompany().getName(),
				application.getJobPosting().getTitle(),
				application.getStatus(),
				application.getCreatedAt(),
				application.getUpdatedAt()
		);
	}
}
