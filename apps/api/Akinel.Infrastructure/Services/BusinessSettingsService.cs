using Akinel.Application.DTOs;
using Akinel.Application.Services;
using Akinel.Domain.Entities;
using Akinel.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Akinel.Infrastructure.Services;

public class BusinessSettingsService : IBusinessSettingsService
{
    private readonly AkinelDbContext _db;

    public BusinessSettingsService(AkinelDbContext db) => _db = db;

    public async Task<BusinessSettingsDto?> GetAsync(CancellationToken ct = default)
    {
        var entity = await _db.BusinessSettings
            .Include(b => b.WorkingHours)
            .OrderBy(b => b.CreatedAt)
            .FirstOrDefaultAsync(ct);

        return entity == null ? null : ToDto(entity);
    }

    public async Task<BusinessSettingsDto> UpdateAsync(UpdateBusinessSettingsRequest request, CancellationToken ct = default)
    {
        var entity = await _db.BusinessSettings
            .OrderBy(b => b.CreatedAt)
            .FirstOrDefaultAsync(ct);

        if (entity == null)
        {
            entity = new BusinessSettings();
            _db.BusinessSettings.Add(entity);
        }

        entity.CompanyName = request.CompanyName;
        entity.ShortDescription = request.ShortDescription;
        entity.Description = request.Description;
        entity.LogoUrl = request.LogoUrl;
        entity.Phone = request.Phone;
        entity.WhatsApp = request.WhatsApp;
        entity.Email = request.Email;
        entity.Address = request.Address;
        entity.District = request.District;
        entity.City = request.City;
        entity.Country = request.Country;
        entity.PostalCode = request.PostalCode;
        entity.GoogleMapsUrl = request.GoogleMapsUrl;
        entity.GoogleMapsEmbedUrl = request.GoogleMapsEmbedUrl;
        entity.WebsiteUrl = request.WebsiteUrl;
        entity.InstagramUrl = request.InstagramUrl;
        entity.FacebookUrl = request.FacebookUrl;
        entity.LinkedInUrl = request.LinkedInUrl;

        await _db.SaveChangesAsync(ct);

        // Replace working hours separately to avoid EF concurrency issues with nav collection
        await _db.BusinessWorkingHours
            .Where(w => w.BusinessSettingsId == entity.Id)
            .ExecuteDeleteAsync(ct);

        _db.BusinessWorkingHours.AddRange(request.WorkingHours.Select(h => new BusinessWorkingHour
        {
            BusinessSettingsId = entity.Id,
            DayOfWeek = h.DayOfWeek,
            IsOpen = h.IsOpen,
            OpenTime = h.OpenTime,
            CloseTime = h.CloseTime,
        }));
        await _db.SaveChangesAsync(ct);

        entity.WorkingHours = await _db.BusinessWorkingHours
            .Where(w => w.BusinessSettingsId == entity.Id)
            .OrderBy(w => w.DayOfWeek)
            .ToListAsync(ct);

        return ToDto(entity);
    }

    private static BusinessSettingsDto ToDto(BusinessSettings e) => new()
    {
        Id = e.Id,
        CompanyName = e.CompanyName,
        ShortDescription = e.ShortDescription,
        Description = e.Description,
        LogoUrl = e.LogoUrl,
        Phone = e.Phone,
        WhatsApp = e.WhatsApp,
        Email = e.Email,
        Address = e.Address,
        District = e.District,
        City = e.City,
        Country = e.Country,
        PostalCode = e.PostalCode,
        GoogleMapsUrl = e.GoogleMapsUrl,
        GoogleMapsEmbedUrl = e.GoogleMapsEmbedUrl,
        WebsiteUrl = e.WebsiteUrl,
        InstagramUrl = e.InstagramUrl,
        FacebookUrl = e.FacebookUrl,
        LinkedInUrl = e.LinkedInUrl,
        WorkingHours = e.WorkingHours
            .OrderBy(h => h.DayOfWeek)
            .Select(h => new BusinessWorkingHourDto
            {
                DayOfWeek = h.DayOfWeek,
                IsOpen = h.IsOpen,
                OpenTime = h.OpenTime,
                CloseTime = h.CloseTime,
            }).ToList(),
    };
}
