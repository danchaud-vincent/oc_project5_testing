package com.openclassrooms.starterjwt.integration.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Base64;
import java.util.Date;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import com.openclassrooms.starterjwt.integration.BaseIntegrationIT;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@SpringBootTest
@TestPropertySource(properties = {
        "oc.app.jwtSecret=exempleDeValeurJwtSecret01234",
        "oc.app.jwtExpirationMs=3600000"
})
public class JwtUtilsIT extends BaseIntegrationIT {

    @Autowired
    private JwtUtils jwtUtils;

    @Test
    public void shouldReturnFalse_whenTokenIsNull() {
        // ACT & ASSERT
        assertThat(jwtUtils.validateJwtToken(null)).isFalse();
    }

    @Test
    public void shouldReturnFalse_whenTokenIsEmpty() {
        // ACT & ASSERT
        assertThat(jwtUtils.validateJwtToken("")).isFalse();
    }

    @Test
    public void shouldReturnFalse_whenTokenIsMalformed() {
        // ARRANGE
        String malformedToken = "abc.def";

        // ACT & ASSERT
        assertThat(jwtUtils.validateJwtToken(malformedToken)).isFalse();
    }

    @Test
    public void shouldReturnFalse_whenTokenIsExpired() {
        // ARRANGE
        String expiredToken = Jwts.builder()
                .setSubject("test@email.com")
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() - 1000))
                .signWith(SignatureAlgorithm.HS512, "exempleDeValeurJwtSecret01234")
                .compact();

        // ACT & ASSERT
        assertThat(jwtUtils.validateJwtToken(expiredToken)).isFalse();
    }

    @Test
    public void shouldReturnFalse_whenInvalidSignature() {
        // ARRANGE
        String tokenWithBadSignature = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
                + "eyJzdWIiOiJ1c2VyIn0."
                + "bad_signature";

        // ACT
        boolean result = jwtUtils.validateJwtToken(tokenWithBadSignature);

        // ASSERT
        assertThat(result).isFalse();
    }

    @Test
    public void shouldReturnFalse_whenTokenUnsupported() {
        // ARRANGE
        String header = Base64.getUrlEncoder().withoutPadding().encodeToString("{\"alg\":\"none\"}".getBytes());
        String payload = Base64.getUrlEncoder().withoutPadding().encodeToString("{\"sub\":\"user\"}".getBytes());

        // token with no signateur
        String unsupportedToken = header + "." + payload + "."; // signature vide

        // ACT
        boolean result = jwtUtils.validateJwtToken(unsupportedToken);

        // ASSERT
        assertThat(result).isFalse();
    }

}
