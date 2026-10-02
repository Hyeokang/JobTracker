package com.jobtracker.company.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "companies")
public class Company {

	@Id
	private UUID id;

	@Column(nullable = false, length = 100)
	private String name;

	@Column(name = "normalized_name", nullable = false, unique = true, length = 100)
	private String normalizedName;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	protected Company() {
	}

	public Company(String name, String normalizedName) {
		this.id = UUID.randomUUID();
		this.name = name;
		this.normalizedName = normalizedName;
	}

	@PrePersist
	void onCreate() {
		this.createdAt = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public String getName() {
		return name;
	}
}
