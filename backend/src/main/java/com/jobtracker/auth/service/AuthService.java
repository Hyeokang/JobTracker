package com.jobtracker.auth.service;

import com.jobtracker.auth.dto.RegisterRequest;
import com.jobtracker.auth.dto.RegisterResponse;
import com.jobtracker.common.exception.DuplicateResourceException;
import com.jobtracker.user.domain.User;
import com.jobtracker.user.domain.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Transactional
	public RegisterResponse register(RegisterRequest request) {
		String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);

		if (userRepository.existsByEmail(normalizedEmail)) {
			throw new DuplicateResourceException("이미 가입된 이메일입니다.");
		}

		User user = new User(
				normalizedEmail,
				passwordEncoder.encode(request.password()),
				request.displayName().trim()
		);

		try {
			return RegisterResponse.from(userRepository.saveAndFlush(user));
		} catch (DataIntegrityViolationException exception) {
			throw new DuplicateResourceException("이미 가입된 이메일입니다.");
		}
	}
}
