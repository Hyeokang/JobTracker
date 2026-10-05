package com.jobtracker.application.dto;

import com.jobtracker.application.domain.ApplicationEvent;
import com.jobtracker.application.domain.ApplicationStatus;

import java.time.Instant;
import java.util.UUID;

public record ApplicationEventResponse(
		UUID id,
		ApplicationStatus previousStatus,
		ApplicationStatus newStatus,
		String note,
		Instant occurredAt
) {
	public static ApplicationEventResponse from(ApplicationEvent event) {
		return new ApplicationEventResponse(
				event.getId(),
				event.getPreviousStatus(),
				event.getNewStatus(),
				event.getNote(),
				event.getOccurredAt()
		);
	}
}
