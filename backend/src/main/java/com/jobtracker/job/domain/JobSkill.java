package com.jobtracker.job.domain;

import com.jobtracker.skill.domain.Skill;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "job_skills")
public class JobSkill {

	@Id
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "job_posting_id", nullable = false)
	private JobPosting jobPosting;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "skill_id", nullable = false)
	private Skill skill;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	protected JobSkill() {
	}

	JobSkill(JobPosting jobPosting, Skill skill) {
		this.id = UUID.randomUUID();
		this.jobPosting = jobPosting;
		this.skill = skill;
	}

	@PrePersist
	void onCreate() {
		this.createdAt = Instant.now();
	}

	public Skill getSkill() {
		return skill;
	}
}
