package com.jobtracker.skill.service;

import com.jobtracker.skill.domain.Skill;
import com.jobtracker.skill.domain.SkillAliasRepository;
import com.jobtracker.skill.domain.SkillRepository;
import com.jobtracker.skill.dto.SkillResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class SkillService {

	private final SkillRepository skillRepository;
	private final SkillAliasRepository skillAliasRepository;

	public SkillService(SkillRepository skillRepository, SkillAliasRepository skillAliasRepository) {
		this.skillRepository = skillRepository;
		this.skillAliasRepository = skillAliasRepository;
	}

	@Transactional(readOnly = true)
	public List<SkillResponse> findAll() {
		return skillRepository.findAllByOrderByCategoryAscNameAsc().stream()
				.map(SkillResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public Optional<Skill> normalize(String value) {
		String normalizedValue = normalizeValue(value);
		if (normalizedValue.isEmpty()) {
			return Optional.empty();
		}

		return skillRepository.findByNormalizedName(normalizedValue)
				.or(() -> skillAliasRepository.findByNormalizedAlias(normalizedValue)
						.map(alias -> alias.getSkill()));
	}

	private String normalizeValue(String value) {
		if (value == null) {
			return "";
		}

		return Normalizer.normalize(value, Normalizer.Form.NFKC)
				.toLowerCase(Locale.ROOT)
				.replaceAll("[\\s._-]", "");
	}
}
