using System.Security.Claims;
using Akinel.Application.DTOs;
using Akinel.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Akinel.Api.Controllers;

[ApiController]
[Route("api/account")]
[Authorize]
public class AccountController : ControllerBase
{
    private readonly AkinelDbContext _db;

    public AccountController(AkinelDbContext db)
    {
        _db = db;
    }

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile(CancellationToken ct)
    {
        var user = await _db.Users.FindAsync([CurrentUserId], ct);
        if (user == null) return NotFound();

        return Ok(new ProfileDto(
            user.Id, user.Email, user.FirstName, user.LastName,
            user.PhoneNumber, user.AddressLine, user.District,
            user.City, user.PostalCode, user.Role.ToString()));
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req, CancellationToken ct)
    {
        var user = await _db.Users.FindAsync([CurrentUserId], ct);
        if (user == null) return NotFound();

        user.FirstName = req.FirstName.Trim();
        user.LastName = req.LastName.Trim();
        user.PhoneNumber = req.PhoneNumber?.Trim();
        user.AddressLine = req.AddressLine?.Trim();
        user.District = req.District?.Trim();
        user.City = req.City?.Trim();
        user.PostalCode = req.PostalCode?.Trim();

        await _db.SaveChangesAsync(ct);

        return Ok(new ProfileDto(
            user.Id, user.Email, user.FirstName, user.LastName,
            user.PhoneNumber, user.AddressLine, user.District,
            user.City, user.PostalCode, user.Role.ToString()));
    }

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req, CancellationToken ct)
    {
        var user = await _db.Users.FindAsync([CurrentUserId], ct);
        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Mevcut şifreniz hatalı." });

        if (req.NewPassword.Length < 8)
            return BadRequest(new { message = "Yeni şifre en az 8 karakter olmalı." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);

        // revoke all refresh tokens so other sessions are logged out
        var tokens = await _db.RefreshTokens
            .Where(t => t.UserId == user.Id && !t.IsRevoked)
            .ToListAsync(ct);
        foreach (var t in tokens) { t.IsRevoked = true; t.RevokedAt = DateTime.UtcNow; }

        await _db.SaveChangesAsync(ct);
        return Ok(new { message = "Şifreniz başarıyla güncellendi." });
    }
}
