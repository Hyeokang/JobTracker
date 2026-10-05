package com.jobtracker.calendar.service;

import com.jobtracker.application.domain.Application;
import com.jobtracker.application.domain.ApplicationRepository;
import com.jobtracker.calendar.domain.CalendarEvent;
import com.jobtracker.calendar.domain.CalendarEventRepository;
import com.jobtracker.calendar.dto.CalendarEventRequest;
import com.jobtracker.calendar.dto.CalendarItemResponse;
import com.jobtracker.common.exception.InvalidRequestException;
import com.jobtracker.common.exception.ResourceNotFoundException;
import com.jobtracker.job.domain.JobPostingRepository;
import com.jobtracker.user.domain.User;
import com.jobtracker.user.domain.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Service
public class CalendarService {

	private final CalendarEventRepository calendarEventRepository;
	private final ApplicationRepository applicationRepository;
	private final JobPostingRepository jobPostingRepository;
	private final UserRepository userRepository;

	public CalendarService(
			CalendarEventRepository calendarEventRepository,
			ApplicationRepository applicationRepository,
			JobPostingRepository jobPostingRepository,
			UserRepository userRepository
	) {
		this.calendarEventRepository = calendarEventRepository;
		this.applicationRepository = applicationRepository;
		this.jobPostingRepository = jobPostingRepository;
		this.userRepository = userRepository;
	}

	@Transactional(readOnly = true)
	public List<CalendarItemResponse> findAll(String email, LocalDate start, LocalDate end) {
		validateRange(start, end);
		User user = findUser(email);

		Stream<CalendarItemResponse> events = calendarEventRepository
				.findAllByUserIdAndDateBetweenOrderByDateAscTimeAsc(user.getId(), start, end)
				.stream()
				.map(CalendarItemResponse::from);
		Stream<CalendarItemResponse> deadlines = jobPostingRepository
				.findAllByUserIdAndDeadlineBetweenOrderByDeadlineAsc(user.getId(), start, end)
				.stream()
				.map(CalendarItemResponse::fromDeadline);

		return Stream.concat(events, deadlines)
				.sorted(Comparator.comparing(CalendarItemResponse::date)
						.thenComparing(CalendarItemResponse::time, Comparator.nullsLast(Comparator.naturalOrder())))
				.toList();
	}

	@Transactional
	public CalendarItemResponse create(String email, CalendarEventRequest request) {
		User user = findUser(email);
		Application application = findOwnedApplication(request.applicationId(), user);
		CalendarEvent event = new CalendarEvent(
				user,
				application,
				normalizeSpaces(request.title()),
				request.type(),
				request.date(),
				request.time(),
				clean(request.notes())
		);
		return CalendarItemResponse.from(calendarEventRepository.save(event));
	}

	@Transactional
	public CalendarItemResponse update(String email, UUID eventId, CalendarEventRequest request) {
		User user = findUser(email);
		CalendarEvent event = findOwnedEvent(eventId, user);
		Application application = findOwnedApplication(request.applicationId(), user);
		event.update(
				application,
				normalizeSpaces(request.title()),
				request.type(),
				request.date(),
				request.time(),
				clean(request.notes())
		);
		return CalendarItemResponse.from(event);
	}

	@Transactional
	public void delete(String email, UUID eventId) {
		User user = findUser(email);
		calendarEventRepository.delete(findOwnedEvent(eventId, user));
	}

	private void validateRange(LocalDate start, LocalDate end) {
		if (end.isBefore(start)) {
			throw new InvalidRequestException("조회 종료일은 시작일보다 빠를 수 없습니다.");
		}
		if (ChronoUnit.DAYS.between(start, end) > 366) {
			throw new InvalidRequestException("일정은 최대 1년 범위로 조회할 수 있습니다.");
		}
	}

	private User findUser(String email) {
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
	}

	private Application findOwnedApplication(UUID applicationId, User user) {
		if (applicationId == null) {
			return null;
		}
		return applicationRepository.findByIdAndUserId(applicationId, user.getId())
				.orElseThrow(() -> new ResourceNotFoundException("지원 정보를 찾을 수 없습니다."));
	}

	private CalendarEvent findOwnedEvent(UUID eventId, User user) {
		return calendarEventRepository.findByIdAndUserId(eventId, user.getId())
				.orElseThrow(() -> new ResourceNotFoundException("일정을 찾을 수 없습니다."));
	}

	private String normalizeSpaces(String value) {
		return value.trim().replaceAll("\\s+", " ");
	}

	private String clean(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		return value.trim();
	}
}
