package com.jobtracker.job.service;

import com.jobtracker.common.exception.DuplicateResourceException;
import com.jobtracker.common.exception.InvalidRequestException;
import com.jobtracker.company.domain.Company;
import com.jobtracker.company.domain.CompanyRepository;
import com.jobtracker.job.domain.JobPosting;
import com.jobtracker.job.domain.JobPostingRepository;
import com.jobtracker.job.dto.CreateJobPostingRequest;
import com.jobtracker.job.dto.JobPostingResponse;
import com.jobtracker.user.domain.User;
import com.jobtracker.user.domain.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class JobPostingService {

	private final JobPostingRepository jobPostingRepository;
	private final CompanyRepository companyRepository;
	private final UserRepository userRepository;

	public JobPostingService(
			JobPostingRepository jobPostingRepository,
			CompanyRepository companyRepository,
			UserRepository userRepository
	) {
		this.jobPostingRepository = jobPostingRepository;
		this.companyRepository = companyRepository;
		this.userRepository = userRepository;
	}

	@Transactional
	public JobPostingResponse create(String email, CreateJobPostingRequest request) {
		User user = findUser(email);
		String originalUrl = clean(request.originalUrl());

		if (originalUrl != null && jobPostingRepository.existsByUserIdAndOriginalUrl(user.getId(), originalUrl)) {
			throw new DuplicateResourceException("이미 저장한 채용공고 URL입니다.");
		}
		if (request.startedDate() != null && request.deadline() != null
				&& request.deadline().isBefore(request.startedDate())) {
			throw new InvalidRequestException("마감일은 모집 시작일보다 빠를 수 없습니다.");
		}

		String companyName = normalizeSpaces(request.companyName());
		String normalizedCompanyName = companyName.toLowerCase(Locale.ROOT);
		Company company = companyRepository.findByNormalizedName(normalizedCompanyName)
				.orElseGet(() -> companyRepository.save(new Company(companyName, normalizedCompanyName)));

		JobPosting jobPosting = new JobPosting(
				user,
				company,
				normalizeSpaces(request.title()),
				clean(request.position()),
				clean(request.careerRequirement()),
				request.employmentType(),
				clean(request.location()),
				request.startedDate(),
				request.deadline(),
				clean(request.requirements()),
				clean(request.preferredQualifications()),
				originalUrl
		);

		return JobPostingResponse.from(jobPostingRepository.save(jobPosting));
	}

	@Transactional(readOnly = true)
	public List<JobPostingResponse> findAll(String email) {
		User user = findUser(email);
		return jobPostingRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId()).stream()
				.map(JobPostingResponse::from)
				.toList();
	}

	private User findUser(String email) {
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
	}

	private String normalizeSpaces(String value) {
		return value.trim().replaceAll("\\s+", " ");
	}

	private String clean(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		return value.trim();
	}
}
