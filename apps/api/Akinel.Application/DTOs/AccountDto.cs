namespace Akinel.Application.DTOs;

public record UpdateProfileRequest(
    string FirstName,
    string LastName,
    string? PhoneNumber,
    string? AddressLine,
    string? District,
    string? City,
    string? PostalCode
);

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword
);

public record ProfileDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? PhoneNumber,
    string? AddressLine,
    string? District,
    string? City,
    string? PostalCode,
    string Role
);
