package com.jobtracker.skill.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "skills")
public class Skill {

	@Id
	private UUID id;

	@Column(nullable = false, length = 100)
	private String name;

	@Column(name = "normalized_name", nullable = false, unique = true, length = 100)
	private String normalizedName;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private SkillCategory category;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	protected Skill() {
	}

	public UUID getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public SkillCategory getCategory() {
		return category;
	}
}
