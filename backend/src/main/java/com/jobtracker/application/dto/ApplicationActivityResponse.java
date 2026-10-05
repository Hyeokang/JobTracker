package com.jobtracker.application.dto;

import com.jobtracker.application.domain.ApplicationEvent;
import com.jobtracker.application.domain.ApplicationStatus;

import java.time.Instant;
import java.util.UUID;

public record ApplicationActivityResponse(
		UUID id,
		UUID applicationId,
		UUID jobPostingId,
		String companyName,
		String jobTitle,
		ApplicationStatus previousStatus,
		ApplicationStatus newStatus,
		String note,
		Instant occurredAt
) {
	public static ApplicationActivityResponse from(ApplicationEvent event) {
		var application = event.getApplication();
		var jobPosting = application.getJobPosting();
		return new ApplicationActivityResponse(
				event.getId(),
				application.getId(),
				jobPosting.getId(),
				jobPosting.getCompany().getName(),
				jobPosting.getTitle(),
				event.getPreviousStatus(),
				event.getNewStatus(),
				event.getNote(),
				event.getOccurredAt()
		);
	}
}
