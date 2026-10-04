package com.jobtracker.skill.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SkillRepository extends JpaRepository<Skill, UUID> {

	List<Skill> findAllByOrderByCategoryAscNameAsc();

	Optional<Skill> findByNormalizedName(String normalizedName);
}
