package com.jobtracker.application;

import com.jayway.jsonpath.JsonPath;
import com.jobtracker.application.domain.ApplicationEventRepository;
import com.jobtracker.application.domain.ApplicationRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApplicationControllerIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ApplicationRepository applicationRepository;

	@Autowired
	private ApplicationEventRepository applicationEventRepository;

	@Autowired
	private JobPostingRepository jobPostingRepository;

	@Autowired
	private CompanyRepository companyRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@BeforeEach
	void setUp() {
		userRepository.save(new User("user@example.com", passwordEncoder.encode("password123!"), "사용자"));
	}

	@AfterEach
	void cleanUp() {
		applicationEventRepository.deleteAll();
		applicationRepository.deleteAll();
		jobPostingRepository.deleteAll();
		companyRepository.deleteAll();
		userRepository.deleteAll();
	}

	@Test
	void createsAndListsApplicationWithInitialHistory() throws Exception {
		UUID jobPostingId = createJob("user@example.com", "지원할 공고");
		UUID applicationId = createApplication("user@example.com", jobPostingId, null);

		mockMvc.perform(get("/api/applications").with(user("user@example.com")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].id").value(applicationId.toString()))
				.andExpect(jsonPath("$[0].jobPostingId").value(jobPostingId.toString()))
				.andExpect(jsonPath("$[0].status").value("INTERESTED"));

		mockMvc.perform(get("/api/applications/{applicationId}/events", applicationId)
						.with(user("user@example.com")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].previousStatus").doesNotExist())
				.andExpect(jsonPath("$[0].newStatus").value("INTERESTED"));
	}

	@Test
	void changesStatusAndPreservesHistory() throws Exception {
		UUID jobPostingId = createJob("user@example.com", "상태 변경 공고");
		UUID applicationId = createApplication("user@example.com", jobPostingId, "PLANNED");

		mockMvc.perform(patch("/api/applications/{applicationId}/status", applicationId)
						.with(user("user@example.com"))
						.with(csrf())
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "status": "APPLIED",
								  "note": "지원서 제출 완료"
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("APPLIED"));

		mockMvc.perform(get("/api/applications/{applicationId}/events", applicationId)
						.with(user("user@example.com")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(2))
				.andExpect(jsonPath("$[0].previousStatus").value("PLANNED"))
				.andExpect(jsonPath("$[0].newStatus").value("APPLIED"))
				.andExpect(jsonPath("$[0].note").value("지원서 제출 완료"));
	}

	@Test
	void rejectsDuplicateAndHidesAnotherUsersApplication() throws Exception {
		userRepository.save(new User("other@example.com", passwordEncoder.encode("password123!"), "다른 사용자"));
		UUID jobPostingId = createJob("user@example.com", "내 공고");
		UUID applicationId = createApplication("user@example.com", jobPostingId, "INTERESTED");

		mockMvc.perform(post("/api/applications")
						.with(user("user@example.com"))
						.with(csrf())
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "jobPostingId": "%s"
								}
								""".formatted(jobPostingId)))
				.andExpect(status().isConflict());

		mockMvc.perform(patch("/api/applications/{applicationId}/status", applicationId)
						.with(user("other@example.com"))
						.with(csrf())
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "status": "APPLIED"
								}
								"""))
				.andExpect(status().isNotFound());
	}

	private UUID createJob(String email, String title) throws Exception {
		String response = mockMvc.perform(post("/api/jobs")
						.with(user(email))
						.with(csrf())
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "companyName": "JobTracker Labs",
								  "title": "%s"
								}
								""".formatted(title)))
				.andExpect(status().isCreated())
				.andReturn()
				.getResponse()
				.getContentAsString();

		return UUID.fromString(JsonPath.read(response, "$.id"));
	}

	private UUID createApplication(String email, UUID jobPostingId, String statusValue) throws Exception {
		String statusJson = statusValue == null ? "" : ", \"status\": \"" + statusValue + "\"";
		String response = mockMvc.perform(post("/api/applications")
						.with(user(email))
						.with(csrf())
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "jobPostingId": "%s"%s
								}
								""".formatted(jobPostingId, statusJson)))
				.andExpect(status().isCreated())
				.andReturn()
				.getResponse()
				.getContentAsString();

		return UUID.fromString(JsonPath.read(response, "$.id"));
	}
}
