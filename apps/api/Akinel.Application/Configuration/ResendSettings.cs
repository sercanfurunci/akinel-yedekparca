namespace Akinel.Application.Configuration;

public class ResendSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string FromEmail { get; set; } = "noreply@akinelotoyedekparca.com.tr";
    public string FromName { get; set; } = "Akinel Oto Yedek Parça";
    public string WebsiteUrl { get; set; } = "https://akinelotoyedekparca.com.tr";
}
