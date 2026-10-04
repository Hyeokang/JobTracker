package com.jobtracker.skill.dto;

import com.jobtracker.skill.domain.Skill;
import com.jobtracker.skill.domain.SkillCategory;

import java.util.UUID;

public record SkillResponse(
		UUID id,
		String name,
		SkillCategory category
) {
	public static SkillResponse from(Skill skill) {
		return new SkillResponse(skill.getId(), skill.getName(), skill.getCategory());
	}
}
