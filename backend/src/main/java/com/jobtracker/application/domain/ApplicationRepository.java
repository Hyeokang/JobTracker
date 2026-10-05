package com.jobtracker.application.domain;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {

	@EntityGraph(attributePaths = {"jobPosting", "jobPosting.company"})
	List<Application> findAllByUserIdOrderByUpdatedAtDesc(UUID userId);

	@EntityGraph(attributePaths = {"jobPosting", "jobPosting.company"})
	Optional<Application> findByIdAndUserId(UUID id, UUID userId);

	boolean existsByUserIdAndJobPostingId(UUID userId, UUID jobPostingId);
}
