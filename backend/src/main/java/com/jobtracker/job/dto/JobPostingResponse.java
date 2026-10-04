package com.jobtracker.job.dto;

import com.jobtracker.job.domain.EmploymentType;
import com.jobtracker.job.domain.JobPosting;
import com.jobtracker.job.domain.RecruitmentType;
import com.jobtracker.skill.dto.SkillResponse;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

public record JobPostingResponse(
		UUID id,
		UUID companyId,
		String companyName,
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
		String originalUrl,
		List<SkillResponse> skills,
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
				jobPosting.getRecruitmentType(),
				jobPosting.getLocation(),
				jobPosting.getStartedDate(),
				jobPosting.getDeadline(),
				jobPosting.getRequirements(),
				jobPosting.getPreferredQualifications(),
				jobPosting.getOriginalUrl(),
				jobPosting.getJobSkills().stream()
						.map(jobSkill -> SkillResponse.from(jobSkill.getSkill()))
						.sorted(Comparator.comparing(SkillResponse::category).thenComparing(SkillResponse::name))
						.toList(),
				jobPosting.getCreatedAt()
		);
	}
}
