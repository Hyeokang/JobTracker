package com.jobtracker.job.dto;

import com.jobtracker.job.domain.EmploymentType;
import com.jobtracker.job.domain.JobPosting;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record JobPostingResponse(
		UUID id,
		UUID companyId,
		String companyName,
		String title,
		String position,
		String careerRequirement,
		EmploymentType employmentType,
		String location,
		LocalDate startedDate,
		LocalDate deadline,
		String requirements,
		String preferredQualifications,
		String originalUrl,
		Instant createdAt
) {
	public static JobPostingResponse from(JobPosting jobPosting) {
		return new JobPostingResponse(
				jobPosting.getId(),
				jobPosting.getCompany().getId(),
				jobPosting.getCompany().getName(),
				jobPosting.getTitle(),
				jobPosting.getPosition(),
				jobPosting.getCareerRequirement(),
				jobPosting.getEmploymentType(),
				jobPosting.getLocation(),
				jobPosting.getStartedDate(),
				jobPosting.getDeadline(),
				jobPosting.getRequirements(),
				jobPosting.getPreferredQualifications(),
				jobPosting.getOriginalUrl(),
				jobPosting.getCreatedAt()
		);
	}
}
