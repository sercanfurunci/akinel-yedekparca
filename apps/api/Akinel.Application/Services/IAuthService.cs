using Akinel.Application.DTOs;

namespace Akinel.Application.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<bool> VerifyEmailAsync(string token, CancellationToken ct = default);
    Task<bool> ForgotPasswordAsync(string email, CancellationToken ct = default);
    Task<bool> ResetPasswordAsync(string token, string newPassword, CancellationToken ct = default);
    Task<AuthResponse?> RefreshTokenAsync(string refreshToken, CancellationToken ct = default);
    Task RevokeTokenAsync(string refreshToken, CancellationToken ct = default);
    Task<AuthResponse> GoogleOAuthLoginAsync(string idToken, CancellationToken ct = default);
}
