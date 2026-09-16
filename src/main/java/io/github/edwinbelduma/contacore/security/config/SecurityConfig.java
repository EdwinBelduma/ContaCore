package io.github.edwinbelduma.contacore.security.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Collection;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/login")
                        .permitAll()
                        .anyRequest()
                        .authenticated()
                )

                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(
                                        jwtAuthenticationConverter()
                                )
                        )
                );

        return http.build();
    }

    private Converter<Jwt, ? extends AbstractAuthenticationToken>
    jwtAuthenticationConverter() {

        return jwt -> {

            List<String> roles = jwt.getClaimAsStringList("roles");

            Collection<SimpleGrantedAuthority> authorities =
                    roles == null
                            ? List.of()
                            : roles.stream()
                              .map(role ->
                                   new SimpleGrantedAuthority(
                                           "ROLE_" + role
                                   )
                              )
                              .toList();

            return new JwtAuthenticationToken(
                    jwt,
                    authorities,
                    jwt.getClaimAsString("email")
            );
        };
    }
}