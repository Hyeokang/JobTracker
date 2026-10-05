package com.jobtracker.job.controller;

import com.jobtracker.application.domain.ApplicationStatus;
import com.jobtracker.job.domain.EmploymentType;
import com.jobtracker.job.domain.RecruitmentType;
import com.jobtracker.job.dto.CreateJobPostingRequest;
import com.jobtracker.job.dto.JobPostingResponse;
import com.jobtracker.job.dto.JobPostingSearchCriteria;
import com.jobtracker.job.service.JobPostingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
public class JobPostingController {

	private final JobPostingService jobPostingService;

	public JobPostingController(JobPostingService jobPostingService) {
		this.jobPostingService = jobPostingService;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public JobPostingResponse create(
			Authentication authentication,
			@Valid @RequestBody CreateJobPostingRequest request
	) {
		return jobPostingService.create(authentication.getName(), request);
	}

	@GetMapping
	public List<JobPostingResponse> findAll(
			Authentication authentication,
			@RequestParam(required = false) String keyword,
			@RequestParam(required = false) String company,
			@RequestParam(required = false) String career,
			@RequestParam(required = false) String location,
			@RequestParam(required = false) EmploymentType employmentType,
			@RequestParam(required = false) RecruitmentType recruitmentType,
			@RequestParam(required = false) UUID skillId,
			@RequestParam(required = false) ApplicationStatus applicationStatus,
			@RequestParam(required = false) LocalDate deadlineFrom,
			@RequestParam(required = false) LocalDate deadlineTo,
			@RequestParam(required = false) LocalDate savedFrom,
			@RequestParam(required = false) LocalDate savedTo
	) {
		return jobPostingService.findAll(authentication.getName(), new JobPostingSearchCriteria(
				keyword,
				company,
				career,
				location,
				employmentType,
				recruitmentType,
				skillId,
				applicationStatus,
				deadlineFrom,
				deadlineTo,
				savedFrom,
				savedTo
		));
	}

	@GetMapping("/{jobPostingId}")
	public JobPostingResponse findById(
			Authentication authentication,
			@PathVariable UUID jobPostingId
	) {
		return jobPostingService.findById(authentication.getName(), jobPostingId);
	}

	@PutMapping("/{jobPostingId}")
	public JobPostingResponse update(
			Authentication authentication,
			@PathVariable UUID jobPostingId,
			@Valid @RequestBody CreateJobPostingRequest request
	) {
		return jobPostingService.update(authentication.getName(), jobPostingId, request);
	}

	@DeleteMapping("/{jobPostingId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(
			Authentication authentication,
			@PathVariable UUID jobPostingId
	) {
		jobPostingService.delete(authentication.getName(), jobPostingId);
	}
}
