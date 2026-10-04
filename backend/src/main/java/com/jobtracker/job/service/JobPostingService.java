package com.jobtracker.job.service;

import com.jobtracker.common.exception.DuplicateResourceException;
import com.jobtracker.common.exception.InvalidRequestException;
import com.jobtracker.common.exception.ResourceNotFoundException;
import com.jobtracker.company.domain.Company;
import com.jobtracker.company.domain.CompanyRepository;
import com.jobtracker.job.domain.JobPosting;
import com.jobtracker.job.domain.JobPostingRepository;
import com.jobtracker.job.dto.CreateJobPostingRequest;
import com.jobtracker.job.dto.JobPostingResponse;
import com.jobtracker.skill.domain.Skill;
import com.jobtracker.skill.domain.SkillRepository;
import com.jobtracker.user.domain.User;
import com.jobtracker.user.domain.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class JobPostingService {

	private final JobPostingRepository jobPostingRepository;
	private final CompanyRepository companyRepository;
	private final UserRepository userRepository;
	private final SkillRepository skillRepository;

	public JobPostingService(
			JobPostingRepository jobPostingRepository,
			CompanyRepository companyRepository,
			UserRepository userRepository,
			SkillRepository skillRepository
	) {
		this.jobPostingRepository = jobPostingRepository;
		this.companyRepository = companyRepository;
		this.userRepository = userRepository;
		this.skillRepository = skillRepository;
	}

	@Transactional
	public JobPostingResponse create(String email, CreateJobPostingRequest request) {
		User user = findUser(email);
		String originalUrl = clean(request.originalUrl());

		if (originalUrl != null && jobPostingRepository.existsByUserIdAndOriginalUrl(user.getId(), originalUrl)) {
			throw new DuplicateResourceException("이미 저장한 채용공고 URL입니다.");
		}
		validateDates(request);
		Company company = resolveCompany(request.companyName());

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
		jobPosting.replaceSkills(resolveSkills(request.skillIds()));

		return JobPostingResponse.from(jobPostingRepository.save(jobPosting));
	}

	@Transactional(readOnly = true)
	public List<JobPostingResponse> findAll(String email) {
		User user = findUser(email);
		return jobPostingRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId()).stream()
				.map(JobPostingResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public JobPostingResponse findById(String email, UUID jobPostingId) {
		User user = findUser(email);
		return JobPostingResponse.from(findOwnedJobPosting(jobPostingId, user));
	}

	@Transactional
	public JobPostingResponse update(String email, UUID jobPostingId, CreateJobPostingRequest request) {
		User user = findUser(email);
		JobPosting jobPosting = findOwnedJobPosting(jobPostingId, user);
		String originalUrl = clean(request.originalUrl());

		if (originalUrl != null && jobPostingRepository.existsByUserIdAndOriginalUrlAndIdNot(
				user.getId(), originalUrl, jobPostingId)) {
			throw new DuplicateResourceException("이미 저장한 채용공고 URL입니다.");
		}
		validateDates(request);
		Company company = resolveCompany(request.companyName());

		jobPosting.update(
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
		jobPosting.replaceSkills(resolveSkills(request.skillIds()));

		return JobPostingResponse.from(jobPosting);
	}

	@Transactional
	public void delete(String email, UUID jobPostingId) {
		User user = findUser(email);
		jobPostingRepository.delete(findOwnedJobPosting(jobPostingId, user));
	}

	private User findUser(String email) {
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
	}

	private JobPosting findOwnedJobPosting(UUID jobPostingId, User user) {
		return jobPostingRepository.findByIdAndUserId(jobPostingId, user.getId())
				.orElseThrow(() -> new ResourceNotFoundException("채용공고를 찾을 수 없습니다."));
	}

	private Company resolveCompany(String requestedCompanyName) {
		String companyName = normalizeSpaces(requestedCompanyName);
		String normalizedCompanyName = companyName.toLowerCase(Locale.ROOT);
		return companyRepository.findByNormalizedName(normalizedCompanyName)
				.orElseGet(() -> companyRepository.save(new Company(companyName, normalizedCompanyName)));
	}

	private void validateDates(CreateJobPostingRequest request) {
		if (request.startedDate() != null && request.deadline() != null
				&& request.deadline().isBefore(request.startedDate())) {
			throw new InvalidRequestException("마감일은 모집 시작일보다 빠를 수 없습니다.");
		}
	}

	private List<Skill> resolveSkills(Set<UUID> skillIds) {
		if (skillIds == null || skillIds.isEmpty()) {
			return List.of();
		}

		List<Skill> skills = skillRepository.findAllById(skillIds);
		if (skills.size() != skillIds.size()) {
			throw new InvalidRequestException("존재하지 않는 기술이 포함되어 있습니다.");
		}
		return skills;
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
