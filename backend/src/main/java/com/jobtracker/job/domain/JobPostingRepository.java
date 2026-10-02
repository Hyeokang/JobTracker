package com.jobtracker.job.domain;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JobPostingRepository extends JpaRepository<JobPosting, UUID> {

	@EntityGraph(attributePaths = "company")
	List<JobPosting> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

	boolean existsByUserIdAndOriginalUrl(UUID userId, String originalUrl);
}
