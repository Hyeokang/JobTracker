package com.jobtracker.job.domain;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobPostingRepository extends JpaRepository<JobPosting, UUID> {

	@EntityGraph(attributePaths = "company")
	List<JobPosting> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

	@EntityGraph(attributePaths = "company")
	Optional<JobPosting> findByIdAndUserId(UUID id, UUID userId);

	boolean existsByUserIdAndOriginalUrl(UUID userId, String originalUrl);

	boolean existsByUserIdAndOriginalUrlAndIdNot(UUID userId, String originalUrl, UUID id);
}
