package com.jobtracker.job.domain;

import com.jobtracker.company.domain.Company;
import com.jobtracker.skill.domain.Skill;
import com.jobtracker.user.domain.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Entity
@Table(name = "job_postings")
public class JobPosting {

	@Id
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "company_id", nullable = false)
	private Company company;

	@Column(nullable = false, length = 200)
	private String title;

	@Column(length = 100)
	private String position;

	@Column(name = "career_requirement", length = 100)
	private String careerRequirement;

	@Enumerated(EnumType.STRING)
	@Column(name = "employment_type", length = 30)
	private EmploymentType employmentType;

	@Enumerated(EnumType.STRING)
	@Column(name = "recruitment_type", length = 30)
	private RecruitmentType recruitmentType;

	@Column(length = 100)
	private String location;

	@Column(name = "started_date")
	private LocalDate startedDate;

	private LocalDate deadline;

	@Column(length = 5000)
	private String requirements;

	@Column(name = "preferred_qualifications", length = 5000)
	private String preferredQualifications;

	@Column(name = "original_url", length = 2048)
	private String originalUrl;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@OneToMany(mappedBy = "jobPosting", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<JobSkill> jobSkills = new LinkedHashSet<>();

	protected JobPosting() {
	}

	public JobPosting(
			User user,
			Company company,
			String title,
			String position,
			String careerRequirement,
			EmploymentType employmentType,
			RecruitmentType recruitmentType,
			String location,
			LocalDate startedDate,
			LocalDate deadline,
			String requirements,
			String preferredQualifications,
			String originalUrl
	) {
		this.id = UUID.randomUUID();
		this.user = user;
		this.company = company;
		this.title = title;
		this.position = position;
		this.careerRequirement = careerRequirement;
		this.employmentType = employmentType;
		this.recruitmentType = recruitmentType;
		this.location = location;
		this.startedDate = startedDate;
		this.deadline = deadline;
		this.requirements = requirements;
		this.preferredQualifications = preferredQualifications;
		this.originalUrl = originalUrl;
	}

	public void update(
			Company company,
			String title,
			String position,
			String careerRequirement,
			EmploymentType employmentType,
			RecruitmentType recruitmentType,
			String location,
			LocalDate startedDate,
			LocalDate deadline,
			String requirements,
			String preferredQualifications,
			String originalUrl
	) {
		this.company = company;
		this.title = title;
		this.position = position;
		this.careerRequirement = careerRequirement;
		this.employmentType = employmentType;
		this.recruitmentType = recruitmentType;
		this.location = location;
		this.startedDate = startedDate;
		this.deadline = deadline;
		this.requirements = requirements;
		this.preferredQualifications = preferredQualifications;
		this.originalUrl = originalUrl;
	}

	public void replaceSkills(Collection<Skill> skills) {
		Set<UUID> requestedSkillIds = skills.stream()
				.map(Skill::getId)
				.collect(Collectors.toSet());
		this.jobSkills.removeIf(jobSkill -> !requestedSkillIds.contains(jobSkill.getSkill().getId()));

		Set<UUID> existingSkillIds = this.jobSkills.stream()
				.map(jobSkill -> jobSkill.getSkill().getId())
				.collect(Collectors.toSet());
		skills.stream()
				.filter(skill -> !existingSkillIds.contains(skill.getId()))
				.map(skill -> new JobSkill(this, skill))
				.forEach(this.jobSkills::add);
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

	public Company getCompany() {
		return company;
	}

	public String getTitle() {
		return title;
	}

	public String getPosition() {
		return position;
	}

	public String getCareerRequirement() {
		return careerRequirement;
	}

	public EmploymentType getEmploymentType() {
		return employmentType;
	}

	public RecruitmentType getRecruitmentType() {
		return recruitmentType;
	}

	public String getLocation() {
		return location;
	}

	public LocalDate getStartedDate() {
		return startedDate;
	}

	public LocalDate getDeadline() {
		return deadline;
	}

	public String getRequirements() {
		return requirements;
	}

	public String getPreferredQualifications() {
		return preferredQualifications;
	}

	public String getOriginalUrl() {
		return originalUrl;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Set<JobSkill> getJobSkills() {
		return Set.copyOf(jobSkills);
	}
}
