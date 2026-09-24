using Akinel.Domain.Common;

namespace Akinel.Domain.Entities;

public class BusinessSettings : BaseEntity
{
    public string CompanyName { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? FaviconUrl { get; set; }
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

    public ICollection<BusinessWorkingHour> WorkingHours { get; set; } = new List<BusinessWorkingHour>();
}
