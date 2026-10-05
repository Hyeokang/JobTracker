package com.jobtracker.calendar.dto;

import com.jobtracker.calendar.domain.CalendarEventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record CalendarEventRequest(
		@NotBlank @Size(max = 200) String title,
		@NotNull CalendarEventType type,
		@NotNull LocalDate date,
		LocalTime time,
		UUID applicationId,
		@Size(max = 1000) String notes
) {
}
