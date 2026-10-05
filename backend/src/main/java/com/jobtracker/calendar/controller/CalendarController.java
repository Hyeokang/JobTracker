package com.jobtracker.calendar.controller;

import com.jobtracker.calendar.dto.CalendarEventRequest;
import com.jobtracker.calendar.dto.CalendarItemResponse;
import com.jobtracker.calendar.service.CalendarService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/calendar")
public class CalendarController {

	private final CalendarService calendarService;

	public CalendarController(CalendarService calendarService) {
		this.calendarService = calendarService;
	}

	@GetMapping
	public List<CalendarItemResponse> findAll(
			Authentication authentication,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
	) {
		return calendarService.findAll(authentication.getName(), start, end);
	}

	@PostMapping("/events")
	@ResponseStatus(HttpStatus.CREATED)
	public CalendarItemResponse create(
			Authentication authentication,
			@Valid @RequestBody CalendarEventRequest request
	) {
		return calendarService.create(authentication.getName(), request);
	}

	@PutMapping("/events/{eventId}")
	public CalendarItemResponse update(
			Authentication authentication,
			@PathVariable UUID eventId,
			@Valid @RequestBody CalendarEventRequest request
	) {
		return calendarService.update(authentication.getName(), eventId, request);
	}

	@DeleteMapping("/events/{eventId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(Authentication authentication, @PathVariable UUID eventId) {
		calendarService.delete(authentication.getName(), eventId);
	}
}
