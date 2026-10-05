package com.jobtracker.application.service;

import com.jobtracker.application.domain.Application;
import com.jobtracker.application.domain.ApplicationEvent;
import com.jobtracker.application.domain.ApplicationEventRepository;
import com.jobtracker.application.domain.ApplicationRepository;
import com.jobtracker.application.domain.ApplicationStatus;
import com.jobtracker.application.dto.ApplicationEventResponse;
import com.jobtracker.application.dto.ApplicationResponse;
import com.jobtracker.application.dto.ChangeApplicationStatusRequest;
import com.jobtracker.application.dto.CreateApplicationRequest;
import com.jobtracker.common.exception.DuplicateResourceException;
import com.jobtracker.common.exception.ResourceNotFoundException;
import com.jobtracker.job.domain.JobPosting;
import com.jobtracker.job.domain.JobPostingRepository;
import com.jobtracker.user.domain.User;
import com.jobtracker.user.domain.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ApplicationService {

	private final ApplicationRepository applicationRepository;
	private final ApplicationEventRepository applicationEventRepository;
	private final JobPostingRepository jobPostingRepository;
	private final UserRepository userRepository;

	public ApplicationService(
			ApplicationRepository applicationRepository,
			ApplicationEventRepository applicationEventRepository,
			JobPostingRepository jobPostingRepository,
			UserRepository userRepository
	) {
		this.applicationRepository = applicationRepository;
		this.applicationEventRepository = applicationEventRepository;
		this.jobPostingRepository = jobPostingRepository;
		this.userRepository = userRepository;
	}

	@Transactional
	public ApplicationResponse create(String email, CreateApplicationRequest request) {
		User user = findUser(email);
		JobPosting jobPosting = jobPostingRepository.findByIdAndUserId(request.jobPostingId(), user.getId())
				.orElseThrow(() -> new ResourceNotFoundException("채용공고를 찾을 수 없습니다."));

		if (applicationRepository.existsByUserIdAndJobPostingId(user.getId(), jobPosting.getId())) {
			throw new DuplicateResourceException("이미 지원 관리 중인 채용공고입니다.");
		}

		ApplicationStatus status = request.status() == null ? ApplicationStatus.INTERESTED : request.status();
		Application application = applicationRepository.save(new Application(user, jobPosting, status));
		applicationEventRepository.save(new ApplicationEvent(application, null, status, null));

		return ApplicationResponse.from(application);
	}

	@Transactional(readOnly = true)
	public List<ApplicationResponse> findAll(String email) {
		User user = findUser(email);
		return applicationRepository.findAllByUserIdOrderByUpdatedAtDesc(user.getId()).stream()
				.map(ApplicationResponse::from)
				.toList();
	}

	@Transactional
	public ApplicationResponse changeStatus(
			String email,
			UUID applicationId,
			ChangeApplicationStatusRequest request
	) {
		User user = findUser(email);
		Application application = findOwnedApplication(applicationId, user);
		ApplicationStatus previousStatus = application.getStatus();

		if (previousStatus != request.status()) {
			application.changeStatus(request.status());
			applicationEventRepository.save(new ApplicationEvent(
					application,
					previousStatus,
					request.status(),
					clean(request.note())
			));
		}

		return ApplicationResponse.from(application);
	}

	@Transactional(readOnly = true)
	public List<ApplicationEventResponse> findEvents(String email, UUID applicationId) {
		User user = findUser(email);
		findOwnedApplication(applicationId, user);

		return applicationEventRepository.findAllByApplicationIdOrderByOccurredAtDesc(applicationId).stream()
				.map(ApplicationEventResponse::from)
				.toList();
	}

	private User findUser(String email) {
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
	}

	private Application findOwnedApplication(UUID applicationId, User user) {
		return applicationRepository.findByIdAndUserId(applicationId, user.getId())
				.orElseThrow(() -> new ResourceNotFoundException("지원 정보를 찾을 수 없습니다."));
	}

	private String clean(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		return value.trim();
	}
}
