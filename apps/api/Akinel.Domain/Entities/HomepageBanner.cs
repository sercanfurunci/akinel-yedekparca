using Akinel.Domain.Common;

namespace Akinel.Domain.Entities;

public class HomepageBanner : BaseEntity
{
    public string SectionKey { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
}
