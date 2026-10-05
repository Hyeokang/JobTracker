package com.jobtracker.application.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ApplicationEventRepository extends JpaRepository<ApplicationEvent, UUID> {

	List<ApplicationEvent> findAllByApplicationIdOrderByOccurredAtDesc(UUID applicationId);
}
