package com.jobtracker.application.domain;

import com.jobtracker.job.domain.JobPosting;
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
import java.util.UUID;

@Entity
@Table(name = "applications")
public class Application {

	@Id
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "job_posting_id", nullable = false)
	private JobPosting jobPosting;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private ApplicationStatus status;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected Application() {
	}

	public Application(User user, JobPosting jobPosting, ApplicationStatus status) {
		this.id = UUID.randomUUID();
		this.user = user;
		this.jobPosting = jobPosting;
		this.status = status;
	}

	public ApplicationStatus changeStatus(ApplicationStatus newStatus) {
		ApplicationStatus previousStatus = this.status;
		this.status = newStatus;
		this.updatedAt = Instant.now();
		return previousStatus;
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

	public JobPosting getJobPosting() {
		return jobPosting;
	}

	public ApplicationStatus getStatus() {
		return status;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}
