package com.jobtracker.common.config;

import com.jobtracker.common.exception.ErrorResponse;
import com.jobtracker.user.domain.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import tools.jackson.databind.ObjectMapper;

@Configuration
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http, ObjectMapper objectMapper) throws Exception {
		http
				.cors(cors -> { })
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers(HttpMethod.GET, "/api/auth/csrf").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
						.anyRequest().authenticated()
				)
				.formLogin(form -> form
						.loginProcessingUrl("/api/auth/login")
						.usernameParameter("email")
						.successHandler((request, response, authentication) -> response.setStatus(HttpStatus.NO_CONTENT.value()))
						.failureHandler((request, response, exception) -> writeError(
								response,
								objectMapper,
								HttpStatus.UNAUTHORIZED,
								"INVALID_CREDENTIALS",
								"이메일 또는 비밀번호가 올바르지 않습니다."
						))
				)
				.logout(logout -> logout
						.logoutUrl("/api/auth/logout")
						.logoutSuccessHandler((request, response, authentication) -> response.setStatus(HttpStatus.NO_CONTENT.value()))
				)
				.exceptionHandling(exceptions -> exceptions.authenticationEntryPoint((request, response, exception) -> writeError(
						response,
						objectMapper,
						HttpStatus.UNAUTHORIZED,
						"AUTHENTICATION_REQUIRED",
						"로그인이 필요합니다."
				)))
				.httpBasic(basic -> basic.disable());

		return http.build();
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	UserDetailsService userDetailsService(UserRepository userRepository) {
		return email -> userRepository.findByEmail(email.trim().toLowerCase(java.util.Locale.ROOT))
				.map(user -> org.springframework.security.core.userdetails.User
						.withUsername(user.getEmail())
						.password(user.getPasswordHash())
						.roles("USER")
						.build())
				.orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource(
			@Value("${app.cors.allowed-origins}") List<String> allowedOrigins
	) {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(allowedOrigins);
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("Content-Type", "Authorization", "X-CSRF-TOKEN"));
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/api/**", configuration);
		return source;
	}

	private void writeError(
			jakarta.servlet.http.HttpServletResponse response,
			ObjectMapper objectMapper,
			HttpStatus status,
			String code,
			String message
	) throws java.io.IOException {
		response.setStatus(status.value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.setCharacterEncoding(java.nio.charset.StandardCharsets.UTF_8.name());
		objectMapper.writeValue(response.getWriter(), ErrorResponse.of(status.value(), code, message));
	}
}
