package com.jobtracker.calendar.dto;

import com.jobtracker.calendar.domain.CalendarEvent;
import com.jobtracker.job.domain.JobPosting;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record CalendarItemResponse(
		UUID id,
		CalendarItemType type,
		String title,
		LocalDate date,
		LocalTime time,
		String notes,
		UUID jobPostingId,
		UUID applicationId,
		String companyName,
		boolean editable
) {
	public static CalendarItemResponse from(CalendarEvent event) {
		var application = event.getApplication();
		var jobPosting = application == null ? null : application.getJobPosting();
		return new CalendarItemResponse(
				event.getId(),
				CalendarItemType.valueOf(event.getType().name()),
				event.getTitle(),
				event.getDate(),
				event.getTime(),
				event.getNotes(),
				jobPosting == null ? null : jobPosting.getId(),
				application == null ? null : application.getId(),
				jobPosting == null ? null : jobPosting.getCompany().getName(),
				true
		);
	}

	public static CalendarItemResponse fromDeadline(JobPosting jobPosting) {
		return new CalendarItemResponse(
				jobPosting.getId(),
				CalendarItemType.DEADLINE,
				jobPosting.getTitle() + " 마감",
				jobPosting.getDeadline(),
				null,
				null,
				jobPosting.getId(),
				null,
				jobPosting.getCompany().getName(),
				false
		);
	}
}
