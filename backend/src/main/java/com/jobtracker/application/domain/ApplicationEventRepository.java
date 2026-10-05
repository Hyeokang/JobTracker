package com.jobtracker.application.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;
import java.util.UUID;

public interface ApplicationEventRepository extends JpaRepository<ApplicationEvent, UUID> {

	List<ApplicationEvent> findAllByApplicationIdOrderByOccurredAtDesc(UUID applicationId);

	@EntityGraph(attributePaths = {"application", "application.jobPosting", "application.jobPosting.company"})
	List<ApplicationEvent> findAllByApplicationUserIdOrderByOccurredAtDesc(UUID userId);
}
