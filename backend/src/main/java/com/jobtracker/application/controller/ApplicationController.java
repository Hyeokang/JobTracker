package com.jobtracker.application.controller;

import com.jobtracker.application.dto.ApplicationEventResponse;
import com.jobtracker.application.dto.ApplicationResponse;
import com.jobtracker.application.dto.ChangeApplicationStatusRequest;
import com.jobtracker.application.dto.CreateApplicationRequest;
import com.jobtracker.application.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

	private final ApplicationService applicationService;

	public ApplicationController(ApplicationService applicationService) {
		this.applicationService = applicationService;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ApplicationResponse create(
			Authentication authentication,
			@Valid @RequestBody CreateApplicationRequest request
	) {
		return applicationService.create(authentication.getName(), request);
	}

	@GetMapping
	public List<ApplicationResponse> findAll(Authentication authentication) {
		return applicationService.findAll(authentication.getName());
	}

	@PatchMapping("/{applicationId}/status")
	public ApplicationResponse changeStatus(
			Authentication authentication,
			@PathVariable UUID applicationId,
			@Valid @RequestBody ChangeApplicationStatusRequest request
	) {
		return applicationService.changeStatus(authentication.getName(), applicationId, request);
	}

	@GetMapping("/{applicationId}/events")
	public List<ApplicationEventResponse> findEvents(
			Authentication authentication,
			@PathVariable UUID applicationId
	) {
		return applicationService.findEvents(authentication.getName(), applicationId);
	}
}
