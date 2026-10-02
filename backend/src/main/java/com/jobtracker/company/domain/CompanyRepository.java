package com.jobtracker.company.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID> {

	Optional<Company> findByNormalizedName(String normalizedName);
}
