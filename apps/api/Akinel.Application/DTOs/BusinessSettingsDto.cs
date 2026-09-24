namespace Akinel.Application.DTOs;

public class BusinessSettingsDto
{
    public Guid Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? Phone { get; set; }
    public string? WhatsApp { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? District { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? GoogleMapsUrl { get; set; }
    public string? GoogleMapsEmbedUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? InstagramUrl { get; set; }
    public string? FacebookUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public List<BusinessWorkingHourDto> WorkingHours { get; set; } = [];
}

public class BusinessWorkingHourDto
{
    public int DayOfWeek { get; set; }
    public bool IsOpen { get; set; }
    public string? OpenTime { get; set; }
    public string? CloseTime { get; set; }
}

public class UpdateBusinessSettingsRequest
{
    public string CompanyName { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? Phone { get; set; }
    public string? WhatsApp { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? District { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? GoogleMapsUrl { get; set; }
    public string? GoogleMapsEmbedUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? InstagramUrl { get; set; }
    public string? FacebookUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public List<BusinessWorkingHourDto> WorkingHours { get; set; } = [];
}
