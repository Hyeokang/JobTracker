package com.jobtracker.skill.domain;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SkillAliasRepository extends JpaRepository<SkillAlias, UUID> {

	@EntityGraph(attributePaths = "skill")
	Optional<SkillAlias> findByNormalizedAlias(String normalizedAlias);
}
