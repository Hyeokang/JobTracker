package com.jobtracker.application.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "application_events")
public class ApplicationEvent {

	@Id
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "application_id", nullable = false)
	private Application application;

	@Enumerated(EnumType.STRING)
	@Column(name = "previous_status", length = 30)
	private ApplicationStatus previousStatus;

	@Enumerated(EnumType.STRING)
	@Column(name = "new_status", nullable = false, length = 30)
	private ApplicationStatus newStatus;

	@Column(length = 1000)
	private String note;

	@Column(name = "occurred_at", nullable = false, updatable = false)
	private Instant occurredAt;

	protected ApplicationEvent() {
	}

	public ApplicationEvent(
			Application application,
			ApplicationStatus previousStatus,
			ApplicationStatus newStatus,
			String note
	) {
		this.id = UUID.randomUUID();
		this.application = application;
		this.previousStatus = previousStatus;
		this.newStatus = newStatus;
		this.note = note;
	}

	@PrePersist
	void onCreate() {
		this.occurredAt = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public Application getApplication() {
		return application;
	}

	public ApplicationStatus getPreviousStatus() {
		return previousStatus;
	}

	public ApplicationStatus getNewStatus() {
		return newStatus;
	}

	public String getNote() {
		return note;
	}

	public Instant getOccurredAt() {
		return occurredAt;
	}
}
