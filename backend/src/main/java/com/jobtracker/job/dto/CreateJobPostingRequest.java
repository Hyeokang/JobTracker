package com.jobtracker.job.dto;

import com.jobtracker.job.domain.EmploymentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

public record CreateJobPostingRequest(
		@NotBlank(message = "회사명을 입력해 주세요.")
		@Size(max = 100, message = "회사명은 100자 이하여야 합니다.")
		String companyName,

		@NotBlank(message = "공고 제목을 입력해 주세요.")
		@Size(max = 200, message = "공고 제목은 200자 이하여야 합니다.")
		String title,

		@Size(max = 100, message = "직무는 100자 이하여야 합니다.")
		String position,

		@Size(max = 100, message = "경력 조건은 100자 이하여야 합니다.")
		String careerRequirement,

		EmploymentType employmentType,

		@Size(max = 100, message = "근무 지역은 100자 이하여야 합니다.")
		String location,

		LocalDate startedDate,

		LocalDate deadline,

		@Size(max = 5000, message = "자격요건은 5000자 이하여야 합니다.")
		String requirements,

		@Size(max = 5000, message = "우대사항은 5000자 이하여야 합니다.")
		String preferredQualifications,

		@Size(max = 2048, message = "URL은 2048자 이하여야 합니다.")
		@Pattern(regexp = "^$|https?://.+", message = "URL은 http 또는 https로 시작해야 합니다.")
		String originalUrl,

		@Size(max = 100, message = "기술은 100개 이하로 선택해 주세요.")
		Set<UUID> skillIds
) {
}
