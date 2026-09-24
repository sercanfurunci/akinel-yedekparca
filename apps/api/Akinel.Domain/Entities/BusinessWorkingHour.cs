using Akinel.Domain.Common;

namespace Akinel.Domain.Entities;

public class BusinessWorkingHour : BaseEntity
{
    public Guid BusinessSettingsId { get; set; }
    public BusinessSettings BusinessSettings { get; set; } = null!;

    /// <summary>0 = Sunday, 1 = Monday ... 6 = Saturday</summary>
    public int DayOfWeek { get; set; }
    public bool IsOpen { get; set; }
    public string? OpenTime { get; set; }
    public string? CloseTime { get; set; }
}
