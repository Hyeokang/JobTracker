package com.jobtracker.auth.controller;

import com.jobtracker.auth.dto.AuthenticatedUserResponse;
import com.jobtracker.auth.dto.CsrfTokenResponse;
import com.jobtracker.auth.dto.RegisterRequest;
import com.jobtracker.auth.dto.RegisterResponse;
import com.jobtracker.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/register")
	@ResponseStatus(HttpStatus.CREATED)
	public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
		return authService.register(request);
	}

	@GetMapping("/csrf")
	public CsrfTokenResponse csrf(CsrfToken csrfToken) {
		return CsrfTokenResponse.from(csrfToken);
	}

	@GetMapping("/me")
	public AuthenticatedUserResponse me(Authentication authentication) {
		return authService.getAuthenticatedUser(authentication.getName());
	}
}
