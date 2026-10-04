package com.jobtracker.skill;

import com.jobtracker.skill.service.SkillService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SkillIntegrationTest {

	@Autowired
	private SkillService skillService;

	@Autowired
	private MockMvc mockMvc;

	@Test
	void normalizesCanonicalNamesAndAliases() {
		assertThat(skillService.normalize("spring-boot")).get().extracting("name").isEqualTo("Spring Boot");
		assertThat(skillService.normalize("SpringBoot")).get().extracting("name").isEqualTo("Spring Boot");
		assertThat(skillService.normalize("스프링부트")).get().extracting("name").isEqualTo("Spring Boot");
		assertThat(skillService.normalize("K8s")).get().extracting("name").isEqualTo("Kubernetes");
		assertThat(skillService.normalize("unknown")).isEmpty();
	}

	@Test
	void listsSkillCatalogForAuthenticatedUser() throws Exception {
		mockMvc.perform(get("/api/skills").with(user("user@example.com")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(21))
				.andExpect(jsonPath("$[0].category").value("BACKEND"));
	}
}
