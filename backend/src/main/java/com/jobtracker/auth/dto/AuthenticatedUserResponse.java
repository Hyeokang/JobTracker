package com.jobtracker.auth.dto;

import com.jobtracker.user.domain.User;

import java.util.UUID;

public record AuthenticatedUserResponse(
		UUID id,
		String email,
		String displayName
) {
	public static AuthenticatedUserResponse from(User user) {
		return new AuthenticatedUserResponse(user.getId(), user.getEmail(), user.getDisplayName());
	}
}
