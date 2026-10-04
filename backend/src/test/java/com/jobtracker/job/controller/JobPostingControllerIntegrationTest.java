package com.jobtracker.job.controller;

import com.jobtracker.company.domain.CompanyRepository;
import com.jobtracker.job.domain.JobPostingRepository;
import com.jobtracker.user.domain.User;
import com.jobtracker.user.domain.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class JobPostingControllerIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private JobPostingRepository jobPostingRepository;

	@Autowired
	private CompanyRepository companyRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@BeforeEach
	void setUp() {
		userRepository.save(new User("user@example.com", passwordEncoder.encode("password123!"), "사용자"));
	}

	@AfterEach
	void cleanUp() {
		jobPostingRepository.deleteAll();
		companyRepository.deleteAll();
		userRepository.deleteAll();
	}

	@Test
	void createsAndListsJobPosting() throws Exception {
		mockMvc.perform(post("/api/jobs")
						.with(user("user@example.com"))
						.with(csrf())
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "companyName": "  JobTracker   Labs  ",
								  "title": "백엔드 개발자",
								  "position": "Backend Engineer",
								  "careerRequirement": "신입 또는 경력 3년 이하",
								  "employmentType": "FULL_TIME",
								  "location": "서울",
								  "startedDate": "2026-10-01",
								  "deadline": "2026-10-31",
								  "requirements": "Java와 Spring 경험",
								  "preferredQualifications": "Docker 경험",
								  "originalUrl": "https://example.com/jobs/1"
								}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").isNotEmpty())
				.andExpect(jsonPath("$.companyName").value("JobTracker Labs"))
				.andExpect(jsonPath("$.title").value("백엔드 개발자"))
				.andExpect(jsonPath("$.employmentType").value("FULL_TIME"));

		mockMvc.perform(get("/api/jobs").with(user("user@example.com")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].originalUrl").value("https://example.com/jobs/1"));
	}

	@Test
	void listsOnlyAuthenticatedUsersJobPostings() throws Exception {
		userRepository.save(new User("other@example.com", passwordEncoder.encode("password123!"), "다른 사용자"));

		createJob("user@example.com", "내 공고", "https://example.com/jobs/mine");
		createJob("other@example.com", "다른 공고", "https://example.com/jobs/other");

		mockMvc.perform(get("/api/jobs").with(user("user@example.com")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].title").value("내 공고"));
	}

	@Test
	void rejectsDuplicateUrlForSameUser() throws Exception {
		createJob("user@example.com", "첫 공고", "https://example.com/jobs/duplicate");

		mockMvc.perform(post("/api/jobs")
						.with(user("user@example.com"))
						.with(csrf())
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "companyName": "Example",
								  "title": "중복 공고",
								  "originalUrl": "https://example.com/jobs/duplicate"
								}
								"""))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.code").value("DUPLICATE_RESOURCE"));
	}

	@Test
	void rejectsDeadlineBeforeStartedDate() throws Exception {
		mockMvc.perform(post("/api/jobs")
						.with(user("user@example.com"))
						.with(csrf())
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "companyName": "Example",
								  "title": "잘못된 일정",
								  "startedDate": "2026-10-10",
								  "deadline": "2026-10-01"
								}
								"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
	}

	@Test
	void requiresAuthentication() throws Exception {
		mockMvc.perform(get("/api/jobs"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"));
	}

	@Test
	void getsAndUpdatesOwnedJobPosting() throws Exception {
		UUID jobPostingId = createJob("user@example.com", "수정 전 공고", "https://example.com/jobs/update");

		mockMvc.perform(get("/api/jobs/{jobPostingId}", jobPostingId)
						.with(user("user@example.com")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.title").value("수정 전 공고"));

		mockMvc.perform(put("/api/jobs/{jobPostingId}", jobPostingId)
						.with(user("user@example.com"))
						.with(csrf())
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "companyName": "Updated Company",
								  "title": "수정된 공고",
								  "employmentType": "CONTRACT",
								  "originalUrl": "https://example.com/jobs/updated"
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.companyName").value("Updated Company"))
				.andExpect(jsonPath("$.title").value("수정된 공고"))
				.andExpect(jsonPath("$.employmentType").value("CONTRACT"));
	}

	@Test
	void deletesOwnedJobPosting() throws Exception {
		UUID jobPostingId = createJob("user@example.com", "삭제할 공고", "https://example.com/jobs/delete");

		mockMvc.perform(delete("/api/jobs/{jobPostingId}", jobPostingId)
						.with(user("user@example.com"))
						.with(csrf()))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/jobs/{jobPostingId}", jobPostingId)
						.with(user("user@example.com")))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));
	}

	@Test
	void hidesAnotherUsersJobPosting() throws Exception {
		userRepository.save(new User("other@example.com", passwordEncoder.encode("password123!"), "다른 사용자"));
		UUID jobPostingId = createJob("other@example.com", "다른 사용자의 공고", "https://example.com/jobs/private");

		mockMvc.perform(get("/api/jobs/{jobPostingId}", jobPostingId)
						.with(user("user@example.com")))
				.andExpect(status().isNotFound());

		mockMvc.perform(put("/api/jobs/{jobPostingId}", jobPostingId)
						.with(user("user@example.com"))
						.with(csrf())
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "companyName": "탈취 시도",
								  "title": "수정 시도"
								}
								"""))
				.andExpect(status().isNotFound());

		mockMvc.perform(delete("/api/jobs/{jobPostingId}", jobPostingId)
						.with(user("user@example.com"))
						.with(csrf()))
				.andExpect(status().isNotFound());
	}

	@Test
	void rejectsDuplicateUrlWhenUpdating() throws Exception {
		createJob("user@example.com", "첫 공고", "https://example.com/jobs/first");
		UUID secondJobId = createJob("user@example.com", "두 번째 공고", "https://example.com/jobs/second");

		mockMvc.perform(put("/api/jobs/{jobPostingId}", secondJobId)
						.with(user("user@example.com"))
						.with(csrf())
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "companyName": "Example",
								  "title": "중복 URL 수정",
								  "originalUrl": "https://example.com/jobs/first"
								}
								"""))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.code").value("DUPLICATE_RESOURCE"));
	}

	private UUID createJob(String email, String title, String url) throws Exception {
		mockMvc.perform(post("/api/jobs")
					.with(user(email))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content("""
							{
							  "companyName": "Example",
							  "title": "%s",
							  "originalUrl": "%s"
							}
							""".formatted(title, url)))
			.andExpect(status().isCreated());

		return jobPostingRepository.findAll().stream()
				.filter(jobPosting -> jobPosting.getTitle().equals(title))
				.findFirst()
				.orElseThrow()
				.getId();
	}
}
