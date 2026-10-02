package com.jobtracker.auth.controller;

import com.jobtracker.user.domain.User;
import com.jobtracker.user.domain.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@AfterEach
	void cleanUp() {
		userRepository.deleteAll();
	}

	@Test
	void registersUser() throws Exception {
		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "NewUser@Example.com",
								  "password": "password123!",
								  "displayName": "홍길동"
								}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.email").value("newuser@example.com"))
				.andExpect(jsonPath("$.displayName").value("홍길동"))
				.andExpect(jsonPath("$.id").isNotEmpty())
				.andExpect(jsonPath("$.createdAt").isNotEmpty());

		User savedUser = userRepository.findByEmail("newuser@example.com").orElseThrow();
		assertThat(savedUser.getPasswordHash()).isNotEqualTo("password123!");
		assertThat(passwordEncoder.matches("password123!", savedUser.getPasswordHash())).isTrue();
	}

	@Test
	void rejectsDuplicateEmail() throws Exception {
		userRepository.save(new User("user@example.com", passwordEncoder.encode("password123!"), "기존 사용자"));

		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "USER@example.com",
								  "password": "password123!",
								  "displayName": "새 사용자"
								}
								"""))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.code").value("DUPLICATE_RESOURCE"))
				.andExpect(jsonPath("$.message").value("이미 가입된 이메일입니다."));
	}

	@Test
	void rejectsInvalidRegistration() throws Exception {
		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "invalid-email",
								  "password": "short",
								  "displayName": ""
								}
								"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
				.andExpect(jsonPath("$.fieldErrors.email").exists())
				.andExpect(jsonPath("$.fieldErrors.password").exists())
				.andExpect(jsonPath("$.fieldErrors.displayName").exists());
	}
}
