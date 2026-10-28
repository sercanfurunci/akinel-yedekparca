using Akinel.Application.DTOs;
using Akinel.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Akinel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("google")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleOAuthRequest request, CancellationToken ct)
    {
        try
        {
            var result = await _authService.GoogleOAuthLoginAsync(request.IdToken, ct);
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "Google kimlik doğrulaması başarısız." });
        }
    }

    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        try
        {
            var result = await _authService.LoginAsync(request, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex) when (ex.Message == "EMAIL_NOT_VERIFIED")
        {
            return StatusCode(403, new { message = "E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin.", code = "EMAIL_NOT_VERIFIED" });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "E-posta veya şifre hatalı." });
        }
    }

    [HttpPost("register")]
    [EnableRateLimiting("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        try
        {
            await _authService.RegisterAsync(request, ct);
            return Ok(new { message = "Kayıt başarılı. Hesabınızı aktifleştirmek için e-posta adresinizi kontrol edin." });
        }
        catch (ArgumentException)
        {
            return BadRequest(new { message = "Şifre en az 8 karakter olmalıdır." });
        }
        catch (InvalidOperationException)
        {
            return Conflict(new { message = "Bu e-posta adresiyle zaten bir hesap mevcut." });
        }
    }

    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token, CancellationToken ct)
    {
        var success = await _authService.VerifyEmailAsync(token, ct);
        if (!success)
            return BadRequest(new { message = "Doğrulama bağlantısı geçersiz veya süresi dolmuş." });

        return Ok(new { message = "E-posta adresiniz başarıyla doğrulandı. Giriş yapabilirsiniz." });
    }

    [HttpPost("forgot-password")]
    [EnableRateLimiting("register")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken ct)
    {
        await _authService.ForgotPasswordAsync(request.Email, ct);
        // Always return OK to prevent email enumeration
        return Ok(new { message = "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." });
    }

    [HttpPost("reset-password")]
    [EnableRateLimiting("register")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken ct)
    {
        var success = await _authService.ResetPasswordAsync(request.Token, request.NewPassword, ct);
        if (!success)
            return BadRequest(new { message = "Bağlantı geçersiz veya süresi dolmuş." });

        return Ok(new { message = "Şifreniz başarıyla güncellendi." });
    }

    [HttpPost("refresh")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request, CancellationToken ct)
    {
        var result = await _authService.RefreshTokenAsync(request.RefreshToken, ct);
        return result == null ? Unauthorized() : Ok(result);
    }

    [HttpPost("revoke")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Revoke([FromBody] RefreshTokenRequest request, CancellationToken ct)
    {
        await _authService.RevokeTokenAsync(request.RefreshToken, ct);
        return NoContent();
    }
}
