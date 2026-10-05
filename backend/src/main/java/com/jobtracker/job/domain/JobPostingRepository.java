package com.jobtracker.job.domain;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobPostingRepository extends JpaRepository<JobPosting, UUID> {

	@EntityGraph(attributePaths = {"company", "jobSkills.skill"})
	List<JobPosting> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

	@EntityGraph(attributePaths = {"company", "jobSkills.skill"})
	Optional<JobPosting> findByIdAndUserId(UUID id, UUID userId);

	@EntityGraph(attributePaths = "company")
	List<JobPosting> findAllByUserIdAndDeadlineBetweenOrderByDeadlineAsc(
			UUID userId,
			LocalDate start,
			LocalDate end
	);

	boolean existsByUserIdAndOriginalUrl(UUID userId, String originalUrl);

	boolean existsByUserIdAndOriginalUrlAndIdNot(UUID userId, String originalUrl, UUID id);
}
