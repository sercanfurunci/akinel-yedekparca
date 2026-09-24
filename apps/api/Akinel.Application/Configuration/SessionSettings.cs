namespace Akinel.Application.Configuration;

public class SessionSettings
{
    public int AccessTokenMinutes { get; set; } = 15;
    public int RefreshTokenDays { get; set; } = 7;
    public int AdminIdleTimeoutMinutes { get; set; } = 30;
    public int AdminAbsoluteTimeoutHours { get; set; } = 8;
}
