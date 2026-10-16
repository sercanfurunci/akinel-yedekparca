using Akinel.Application.Configuration;
using Akinel.Application.Services;
using Microsoft.Extensions.Options;
using Resend;

namespace Akinel.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IResend _resend;
    private readonly ResendSettings _cfg;

    public EmailService(IResend resend, IOptions<ResendSettings> options)
    {
        _resend = resend;
        _cfg = options.Value;
    }

    public async Task SendVerificationEmailAsync(string toEmail, string firstName, string token, CancellationToken ct = default)
    {
        var link = $"{_cfg.WebsiteUrl}/auth/verify-email?token={Uri.EscapeDataString(token)}";
        var html = VerificationEmailHtml(firstName, link);

        var msg = new EmailMessage
        {
            From = $"{_cfg.FromName} <{_cfg.FromEmail}>",
            To = [toEmail],
            Subject = "E-posta adresinizi doğrulayın — Akinel Oto Yedek Parça",
            HtmlBody = html,
        };
        await _resend.EmailSendAsync(msg, ct);
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string firstName, string token, CancellationToken ct = default)
    {
        var link = $"{_cfg.WebsiteUrl}/auth/reset-password?token={Uri.EscapeDataString(token)}";
        var html = PasswordResetEmailHtml(firstName, link);

        var msg = new EmailMessage
        {
            From = $"{_cfg.FromName} <{_cfg.FromEmail}>",
            To = [toEmail],
            Subject = "Şifre sıfırlama isteği — Akinel Oto Yedek Parça",
            HtmlBody = html,
        };
        await _resend.EmailSendAsync(msg, ct);
    }

    public async Task SendOrderConfirmationEmailAsync(string toEmail, string firstName, string orderNumber, decimal total, CancellationToken ct = default)
    {
        var link = $"{_cfg.WebsiteUrl}/account/orders";
        var html = OrderConfirmationEmailHtml(firstName, orderNumber, total, link);

        var msg = new EmailMessage
        {
            From = $"{_cfg.FromName} <{_cfg.FromEmail}>",
            To = [toEmail],
            Subject = $"Siparişiniz alındı #{orderNumber} — Akinel Oto Yedek Parça",
            HtmlBody = html,
        };
        await _resend.EmailSendAsync(msg, ct);
    }

    private static string VerificationEmailHtml(string firstName, string link) => $"""
        <!DOCTYPE html>
        <html lang="tr">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
                <tr><td style="background:#C8102E;padding:24px 32px;">
                  <p style="margin:0;color:#fff;font-size:20px;font-weight:700;">Akinel Oto Yedek Parça</p>
                </td></tr>
                <tr><td style="padding:32px;">
                  <h1 style="margin:0 0 12px;font-size:22px;color:#111827;">Merhaba {firstName},</h1>
                  <p style="margin:0 0 24px;color:#4B5563;line-height:1.6;">
                    Hesabınızı oluşturduğunuz için teşekkürler! E-posta adresinizi doğrulamak için aşağıdaki butona tıklayın.
                    Bu bağlantı <strong>24 saat</strong> geçerlidir.
                  </p>
                  <a href="{link}" style="display:inline-block;background:#C8102E;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;">
                    E-posta Adresimi Doğrula
                  </a>
                  <p style="margin:24px 0 0;color:#9CA3AF;font-size:13px;line-height:1.5;">
                    Bu maili siz talep etmediyseniz güvenle yok sayabilirsiniz.<br>
                    Bağlantı çalışmıyorsa kopyalayıp tarayıcınıza yapıştırın:<br>
                    <span style="color:#C8102E;word-break:break-all;">{link}</span>
                  </p>
                </td></tr>
                <tr><td style="background:#F9FAFB;padding:16px 32px;border-top:1px solid #E5E7EB;">
                  <p style="margin:0;color:#9CA3AF;font-size:12px;">© {DateTime.UtcNow.Year} Akinel Oto Yedek Parça · Tüm hakları saklıdır.</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """;

    private static string PasswordResetEmailHtml(string firstName, string link) => $"""
        <!DOCTYPE html>
        <html lang="tr">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
                <tr><td style="background:#C8102E;padding:24px 32px;">
                  <p style="margin:0;color:#fff;font-size:20px;font-weight:700;">Akinel Oto Yedek Parça</p>
                </td></tr>
                <tr><td style="padding:32px;">
                  <h1 style="margin:0 0 12px;font-size:22px;color:#111827;">Şifre Sıfırlama</h1>
                  <p style="margin:0 0 8px;color:#4B5563;line-height:1.6;">Merhaba {firstName},</p>
                  <p style="margin:0 0 24px;color:#4B5563;line-height:1.6;">
                    Şifrenizi sıfırlamak için bir talep aldık. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.
                    Bu bağlantı <strong>1 saat</strong> geçerlidir.
                  </p>
                  <a href="{link}" style="display:inline-block;background:#C8102E;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;">
                    Şifremi Sıfırla
                  </a>
                  <p style="margin:24px 0 0;color:#9CA3AF;font-size:13px;line-height:1.5;">
                    Bu isteği siz yapmadıysanız güvenle yok sayabilirsiniz — şifreniz değişmeyecektir.
                  </p>
                </td></tr>
                <tr><td style="background:#F9FAFB;padding:16px 32px;border-top:1px solid #E5E7EB;">
                  <p style="margin:0;color:#9CA3AF;font-size:12px;">© {DateTime.UtcNow.Year} Akinel Oto Yedek Parça · Tüm hakları saklıdır.</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """;

    private static string OrderConfirmationEmailHtml(string firstName, string orderNumber, decimal total, string link) => $"""
        <!DOCTYPE html>
        <html lang="tr">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
                <tr><td style="background:#C8102E;padding:24px 32px;">
                  <p style="margin:0;color:#fff;font-size:20px;font-weight:700;">Akinel Oto Yedek Parça</p>
                </td></tr>
                <tr><td style="padding:32px;">
                  <h1 style="margin:0 0 12px;font-size:22px;color:#111827;">Siparişiniz Alındı! 🎉</h1>
                  <p style="margin:0 0 8px;color:#4B5563;line-height:1.6;">Merhaba {firstName},</p>
                  <p style="margin:0 0 24px;color:#4B5563;line-height:1.6;">
                    <strong>#{orderNumber}</strong> numaralı siparişiniz başarıyla alındı. Toplam tutar: <strong>{total:N2} ₺</strong>.<br>
                    Siparişiniz hazırlandıktan sonra kargo bilgilerini ayrıca iletecek.
                  </p>
                  <a href="{link}" style="display:inline-block;background:#C8102E;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;">
                    Siparişimi Görüntüle
                  </a>
                </td></tr>
                <tr><td style="background:#F9FAFB;padding:16px 32px;border-top:1px solid #E5E7EB;">
                  <p style="margin:0;color:#9CA3AF;font-size:12px;">© {DateTime.UtcNow.Year} Akinel Oto Yedek Parça · Tüm hakları saklıdır.</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """;
}
