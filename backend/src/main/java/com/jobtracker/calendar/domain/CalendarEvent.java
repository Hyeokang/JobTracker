package com.jobtracker.calendar.domain;

import com.jobtracker.application.domain.Application;
import com.jobtracker.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "calendar_events")
public class CalendarEvent {

	@Id
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "application_id")
	private Application application;

	@Column(nullable = false, length = 200)
	private String title;

	@Enumerated(EnumType.STRING)
	@Column(name = "event_type", nullable = false, length = 30)
	private CalendarEventType type;

	@Column(name = "event_date", nullable = false)
	private LocalDate date;

	@Column(name = "event_time")
	private LocalTime time;

	@Column(length = 1000)
	private String notes;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected CalendarEvent() {
	}

	public CalendarEvent(
			User user,
			Application application,
			String title,
			CalendarEventType type,
			LocalDate date,
			LocalTime time,
			String notes
	) {
		this.id = UUID.randomUUID();
		this.user = user;
		this.application = application;
		this.title = title;
		this.type = type;
		this.date = date;
		this.time = time;
		this.notes = notes;
	}

	public void update(
			Application application,
			String title,
			CalendarEventType type,
			LocalDate date,
			LocalTime time,
			String notes
	) {
		this.application = application;
		this.title = title;
		this.type = type;
		this.date = date;
		this.time = time;
		this.notes = notes;
	}

	@PrePersist
	void onCreate() {
		Instant now = Instant.now();
		this.createdAt = now;
		this.updatedAt = now;
	}

	@PreUpdate
	void onUpdate() {
		this.updatedAt = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public Application getApplication() {
		return application;
	}

	public String getTitle() {
		return title;
	}

	public CalendarEventType getType() {
		return type;
	}

	public LocalDate getDate() {
		return date;
	}

	public LocalTime getTime() {
		return time;
	}

	public String getNotes() {
		return notes;
	}
}
