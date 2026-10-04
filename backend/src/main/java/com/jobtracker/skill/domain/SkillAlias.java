package com.jobtracker.skill.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "skill_aliases")
public class SkillAlias {

	@Id
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "skill_id", nullable = false)
	private Skill skill;

	@Column(nullable = false, length = 100)
	private String alias;

	@Column(name = "normalized_alias", nullable = false, unique = true, length = 100)
	private String normalizedAlias;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	protected SkillAlias() {
	}

	public Skill getSkill() {
		return skill;
	}
}
