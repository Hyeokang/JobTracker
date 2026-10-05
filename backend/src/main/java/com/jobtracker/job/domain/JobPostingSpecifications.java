package com.jobtracker.job.domain;

import com.jobtracker.application.domain.Application;
import com.jobtracker.job.dto.JobPostingSearchCriteria;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

public final class JobPostingSpecifications {

	private JobPostingSpecifications() {
	}

	public static Specification<JobPosting> search(UUID userId, JobPostingSearchCriteria criteria) {
		return (root, query, builder) -> {
			List<Predicate> predicates = new ArrayList<>();
			predicates.add(builder.equal(root.get("user").get("id"), userId));

			String keyword = normalize(criteria.keyword());
			if (keyword != null) {
				String pattern = containsPattern(keyword);
				var company = root.join("company", JoinType.INNER);
				predicates.add(builder.or(
						builder.like(builder.lower(root.get("title")), pattern, '\\'),
						builder.like(builder.lower(root.get("position")), pattern, '\\'),
						builder.like(builder.lower(company.get("name")), pattern, '\\')
				));
			}

			addContains(predicates, builder, root.join("company", JoinType.INNER).get("name"), criteria.company());
			addContains(predicates, builder, root.get("careerRequirement"), criteria.career());
			addContains(predicates, builder, root.get("location"), criteria.location());

			if (criteria.employmentType() != null) {
				predicates.add(builder.equal(root.get("employmentType"), criteria.employmentType()));
			}
			if (criteria.recruitmentType() != null) {
				predicates.add(builder.equal(root.get("recruitmentType"), criteria.recruitmentType()));
			}
			if (criteria.skillId() != null) {
				predicates.add(builder.equal(
						root.join("jobSkills", JoinType.INNER).get("skill").get("id"),
						criteria.skillId()
				));
				query.distinct(true);
			}
			if (criteria.applicationStatus() != null) {
				Subquery<UUID> applicationSubquery = query.subquery(UUID.class);
				var application = applicationSubquery.from(Application.class);
				applicationSubquery.select(application.get("jobPosting").get("id"))
						.where(
								builder.equal(application.get("user").get("id"), userId),
								builder.equal(application.get("status"), criteria.applicationStatus())
						);
				predicates.add(root.get("id").in(applicationSubquery));
			}
			if (criteria.deadlineFrom() != null) {
				predicates.add(builder.greaterThanOrEqualTo(root.get("deadline"), criteria.deadlineFrom()));
			}
			if (criteria.deadlineTo() != null) {
				predicates.add(builder.lessThanOrEqualTo(root.get("deadline"), criteria.deadlineTo()));
			}
			if (criteria.savedFrom() != null) {
				predicates.add(builder.greaterThanOrEqualTo(
						root.get("createdAt"),
						criteria.savedFrom().atStartOfDay().toInstant(ZoneOffset.UTC)
				));
			}
			if (criteria.savedTo() != null) {
				predicates.add(builder.lessThan(
						root.get("createdAt"),
						criteria.savedTo().plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC)
				));
			}

			return builder.and(predicates.toArray(Predicate[]::new));
		};
	}

	private static void addContains(
			List<Predicate> predicates,
			jakarta.persistence.criteria.CriteriaBuilder builder,
			jakarta.persistence.criteria.Expression<String> expression,
			String value
	) {
		String normalized = normalize(value);
		if (normalized != null) {
			predicates.add(builder.like(builder.lower(expression), containsPattern(normalized), '\\'));
		}
	}

	private static String normalize(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		return value.trim().toLowerCase(Locale.ROOT);
	}

	private static String containsPattern(String value) {
		return "%" + value
				.replace("\\", "\\\\")
				.replace("%", "\\%")
				.replace("_", "\\_") + "%";
	}
}
