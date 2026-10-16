namespace Akinel.Application.Services;

public interface IEmailService
{
    Task SendVerificationEmailAsync(string toEmail, string firstName, string token, CancellationToken ct = default);
    Task SendPasswordResetEmailAsync(string toEmail, string firstName, string token, CancellationToken ct = default);
    Task SendOrderConfirmationEmailAsync(string toEmail, string firstName, string orderNumber, decimal total, CancellationToken ct = default);
}
