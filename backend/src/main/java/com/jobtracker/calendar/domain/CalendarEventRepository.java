package com.jobtracker.calendar.domain;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, UUID> {

	@EntityGraph(attributePaths = {"application", "application.jobPosting", "application.jobPosting.company"})
	List<CalendarEvent> findAllByUserIdAndDateBetweenOrderByDateAscTimeAsc(
			UUID userId,
			LocalDate start,
			LocalDate end
	);

	@EntityGraph(attributePaths = {"application", "application.jobPosting", "application.jobPosting.company"})
	Optional<CalendarEvent> findByIdAndUserId(UUID id, UUID userId);
}
