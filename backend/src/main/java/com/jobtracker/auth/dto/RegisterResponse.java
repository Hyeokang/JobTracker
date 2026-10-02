package com.jobtracker.auth.dto;

import com.jobtracker.user.domain.User;

import java.time.Instant;
import java.util.UUID;

public record RegisterResponse(
		UUID id,
		String email,
		String displayName,
		Instant createdAt
) {
	public static RegisterResponse from(User user) {
		return new RegisterResponse(
				user.getId(),
				user.getEmail(),
				user.getDisplayName(),
				user.getCreatedAt()
		);
	}
}
