using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Akinel.Application.Configuration;
using Akinel.Application.DTOs;
using Akinel.Application.Services;
using Akinel.Domain.Entities;
using Akinel.Domain.Enums;
using Akinel.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Akinel.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AkinelDbContext _context;
    private readonly IEmailService _email;
    private readonly SessionSettings _session;
    private readonly string _jwtSecret;
    private readonly string _jwtIssuer;
    private readonly string _jwtAudience;

    public AuthService(
        AkinelDbContext context,
        IEmailService email,
        IOptions<SessionSettings> sessionOptions,
        IOptions<JwtSettings> jwtOptions)
    {
        _context = context;
        _email = email;
        _session = sessionOptions.Value;
        _jwtSecret = jwtOptions.Value.Secret;
        _jwtIssuer = jwtOptions.Value.Issuer;
        _jwtAudience = jwtOptions.Value.Audience;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var normalized = request.Email.ToUpperInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == normalized, ct)
            ?? throw new UnauthorizedAccessException("Invalid credentials.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials.");

        if (!user.IsEmailVerified)
            throw new InvalidOperationException("EMAIL_NOT_VERIFIED");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Invalid credentials.");

        return await GenerateAuthResponseAsync(user, ct);
    }

    public async Task RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (request.Password.Length < 8)
            throw new ArgumentException("Password too short.");

        var normalized = request.Email.ToUpperInvariant();
        if (await _context.Users.AnyAsync(u => u.NormalizedEmail == normalized, ct))
            throw new InvalidOperationException("Email already registered.");

        var token = GenerateSecureToken();
        var user = new User
        {
            Email = request.Email,
            NormalizedEmail = normalized,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            Role = UserRole.Customer,
            IsActive = true,
            IsEmailVerified = false,
            EmailVerificationToken = token,
            EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24),
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(ct);

        await _email.SendVerificationEmailAsync(user.Email, user.FirstName, token, ct);
    }

    public async Task<bool> VerifyEmailAsync(string token, CancellationToken ct = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(
            u => u.EmailVerificationToken == token && !u.IsEmailVerified, ct);

        if (user == null) return false;
        if (user.EmailVerificationTokenExpiry < DateTime.UtcNow) return false;

        user.IsEmailVerified = true;
        user.EmailVerificationToken = null;
        user.EmailVerificationTokenExpiry = null;
        await _context.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> ForgotPasswordAsync(string email, CancellationToken ct = default)
    {
        var normalized = email.ToUpperInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == normalized && u.IsEmailVerified, ct);
        if (user == null) return true; // don't reveal existence

        var token = GenerateSecureToken();
        user.PasswordResetToken = token;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
        await _context.SaveChangesAsync(ct);

        await _email.SendPasswordResetEmailAsync(user.Email, user.FirstName, token, ct);
        return true;
    }

    public async Task<bool> ResetPasswordAsync(string token, string newPassword, CancellationToken ct = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.PasswordResetToken == token, ct);
        if (user == null) return false;
        if (user.PasswordResetTokenExpiry < DateTime.UtcNow) return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;

        // revoke all refresh tokens for security
        var tokens = await _context.RefreshTokens
            .Where(t => t.UserId == user.Id && !t.IsRevoked)
            .ToListAsync(ct);
        foreach (var t in tokens) { t.IsRevoked = true; t.RevokedAt = DateTime.UtcNow; }

        await _context.SaveChangesAsync(ct);
        return true;
    }

    public async Task<AuthResponse?> RefreshTokenAsync(string refreshToken, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;

        var token = await _context.RefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == refreshToken && !t.IsRevoked && t.ExpiresAt > now, ct);

        if (token == null) return null;

        if (token.AbsoluteExpiresAt < now) return null;

        if (token.User.Role == UserRole.Admin)
        {
            var lastActivity = token.LastUsedAt ?? token.CreatedAt;
            if (now - lastActivity > TimeSpan.FromMinutes(_session.AdminIdleTimeoutMinutes))
                return null;
        }

        token.IsRevoked = true;
        token.RevokedAt = now;
        await _context.SaveChangesAsync(ct);

        return await GenerateAuthResponseAsync(token.User, ct, token.AbsoluteExpiresAt);
    }

    public async Task RevokeTokenAsync(string refreshToken, CancellationToken ct = default)
    {
        var token = await _context.RefreshTokens.FirstOrDefaultAsync(t => t.Token == refreshToken, ct);
        if (token == null) return;
        token.IsRevoked = true;
        token.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
    }

    private async Task<AuthResponse> GenerateAuthResponseAsync(User user, CancellationToken ct, DateTime? inheritedAbsoluteExpiry = null)
    {
        var now = DateTime.UtcNow;
        var accessToken = GenerateJwt(user, now);
        var refreshTokenValue = GenerateSecureToken();

        var idleMinutes = user.Role == UserRole.Admin ? _session.AdminIdleTimeoutMinutes : _session.RefreshTokenDays * 24 * 60;
        var refreshExpiry = now.AddMinutes(idleMinutes);
        var absoluteExpiry = inheritedAbsoluteExpiry ?? (user.Role == UserRole.Admin
            ? now.AddHours(_session.AdminAbsoluteTimeoutHours)
            : now.AddDays(_session.RefreshTokenDays));

        _context.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenValue,
            ExpiresAt = refreshExpiry,
            AbsoluteExpiresAt = absoluteExpiry,
            LastUsedAt = now
        });
        await _context.SaveChangesAsync(ct);

        return new AuthResponse(accessToken, refreshTokenValue, now.AddMinutes(_session.AccessTokenMinutes),
            new UserDto(user.Id, user.Email, user.FirstName, user.LastName, user.Role.ToString()));
    }

    private string GenerateJwt(User user, DateTime now)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("firstName", user.FirstName),
        };
        var token = new JwtSecurityToken(
            issuer: _jwtIssuer,
            audience: _jwtAudience,
            claims: claims,
            expires: now.AddMinutes(_session.AccessTokenMinutes),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateSecureToken()
    {
        var bytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").TrimEnd('=');
    }
}
