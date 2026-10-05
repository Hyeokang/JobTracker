package com.jobtracker.calendar;

import com.jayway.jsonpath.JsonPath;
import com.jobtracker.application.domain.ApplicationEventRepository;
import com.jobtracker.application.domain.ApplicationRepository;
import com.jobtracker.calendar.domain.CalendarEventRepository;
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
class CalendarControllerIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private CalendarEventRepository calendarEventRepository;

	@Autowired
	private ApplicationEventRepository applicationEventRepository;

	@Autowired
	private ApplicationRepository applicationRepository;

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
		calendarEventRepository.deleteAll();
		applicationEventRepository.deleteAll();
		applicationRepository.deleteAll();
		jobPostingRepository.deleteAll();
		companyRepository.deleteAll();
		userRepository.deleteAll();
	}

	@Test
	void listsJobDeadlinesAndUserEventsTogether() throws Exception {
		UUID jobPostingId = createJob("user@example.com", "백엔드 개발자", "2026-10-20");
		UUID applicationId = createApplication("user@example.com", jobPostingId);

		mockMvc.perform(post("/api/calendar/events")
					.with(user("user@example.com"))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content("""
							{
							  "title": "1차 기술 면접",
							  "type": "INTERVIEW",
							  "date": "2026-10-15",
							  "time": "14:30",
							  "applicationId": "%s"
							}
							""".formatted(applicationId)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.editable").value(true))
				.andExpect(jsonPath("$.jobPostingId").value(jobPostingId.toString()));

		mockMvc.perform(get("/api/calendar")
					.param("start", "2026-10-01")
					.param("end", "2026-10-31")
					.with(user("user@example.com")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(2))
				.andExpect(jsonPath("$[0].type").value("INTERVIEW"))
				.andExpect(jsonPath("$[0].title").value("1차 기술 면접"))
				.andExpect(jsonPath("$[1].type").value("DEADLINE"))
				.andExpect(jsonPath("$[1].editable").value(false));
	}

	@Test
	void updatesAndDeletesOwnedEvent() throws Exception {
		UUID eventId = createPersonalEvent("user@example.com", "서류 작성", "2026-10-10");

		mockMvc.perform(put("/api/calendar/events/{eventId}", eventId)
					.with(user("user@example.com"))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content("""
							{
							  "title": "포트폴리오 제출",
							  "type": "PERSONAL",
							  "date": "2026-10-11",
							  "notes": "최종 확인"
							}
							"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.title").value("포트폴리오 제출"))
				.andExpect(jsonPath("$.date").value("2026-10-11"));

		mockMvc.perform(delete("/api/calendar/events/{eventId}", eventId)
					.with(user("user@example.com"))
					.with(csrf()))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/calendar")
					.param("start", "2026-10-01")
					.param("end", "2026-10-31")
					.with(user("user@example.com")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(0));
	}

	@Test
	void preventsUsingAnotherUsersApplication() throws Exception {
		userRepository.save(new User("other@example.com", passwordEncoder.encode("password123!"), "다른 사용자"));
		UUID jobPostingId = createJob("user@example.com", "내 공고", "2026-10-20");
		UUID applicationId = createApplication("user@example.com", jobPostingId);

		mockMvc.perform(post("/api/calendar/events")
					.with(user("other@example.com"))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content("""
							{
							  "title": "잘못된 일정",
							  "type": "INTERVIEW",
							  "date": "2026-10-15",
							  "applicationId": "%s"
							}
							""".formatted(applicationId)))
				.andExpect(status().isNotFound());
	}

	private UUID createJob(String email, String title, String deadline) throws Exception {
		String response = mockMvc.perform(post("/api/jobs")
					.with(user(email))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content("""
							{
							  "companyName": "JobTracker Labs",
							  "title": "%s",
							  "deadline": "%s"
							}
							""".formatted(title, deadline)))
				.andExpect(status().isCreated())
				.andReturn()
				.getResponse()
				.getContentAsString();

		return UUID.fromString(JsonPath.read(response, "$.id"));
	}

	private UUID createApplication(String email, UUID jobPostingId) throws Exception {
		String response = mockMvc.perform(post("/api/applications")
					.with(user(email))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content("""
							{
							  "jobPostingId": "%s"
							}
							""".formatted(jobPostingId)))
				.andExpect(status().isCreated())
				.andReturn()
				.getResponse()
				.getContentAsString();

		return UUID.fromString(JsonPath.read(response, "$.id"));
	}

	private UUID createPersonalEvent(String email, String title, String date) throws Exception {
		String response = mockMvc.perform(post("/api/calendar/events")
					.with(user(email))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content("""
							{
							  "title": "%s",
							  "type": "PERSONAL",
							  "date": "%s"
							}
							""".formatted(title, date)))
				.andExpect(status().isCreated())
				.andReturn()
				.getResponse()
				.getContentAsString();

		return UUID.fromString(JsonPath.read(response, "$.id"));
	}
}
