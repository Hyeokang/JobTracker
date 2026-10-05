package com.jobtracker.job.dto;

import com.jobtracker.application.domain.ApplicationStatus;
import com.jobtracker.job.domain.EmploymentType;
import com.jobtracker.job.domain.RecruitmentType;

import java.time.LocalDate;
import java.util.UUID;

public record JobPostingSearchCriteria(
		String keyword,
		String company,
		String career,
		String location,
		EmploymentType employmentType,
		RecruitmentType recruitmentType,
		UUID skillId,
		ApplicationStatus applicationStatus,
		LocalDate deadlineFrom,
		LocalDate deadlineTo,
		LocalDate savedFrom,
		LocalDate savedTo
) {
}
