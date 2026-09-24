using Akinel.Domain.Entities;
using Akinel.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Akinel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BasketController : ControllerBase
{
    private readonly AkinelDbContext _db;
    private readonly IWebHostEnvironment _env;
    private const string SessionCookieName = "basket_session";

    public BasketController(AkinelDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    private string GetOrCreateSessionId()
    {
        if (Request.Cookies.TryGetValue(SessionCookieName, out var existing) && !string.IsNullOrWhiteSpace(existing))
            return existing;

        var newId = Guid.NewGuid().ToString();
        Response.Cookies.Append(SessionCookieName, newId, new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Secure = !_env.IsDevelopment(), // true in production, false in development
            Expires = DateTimeOffset.UtcNow.AddDays(30),
        });
        return newId;
    }

    [HttpGet]
    public async Task<IActionResult> GetBasket(CancellationToken ct)
    {
        var sessionId = GetOrCreateSessionId();
        var items = await _db.BasketItems
            .Include(b => b.Product)
                .ThenInclude(p => p.Brand)
            .Include(b => b.Product)
                .ThenInclude(p => p.Images)
            .Where(b => b.SessionId == sessionId && b.Product != null && b.Product.IsActive)
            .OrderBy(b => b.CreatedAt)
            .ToListAsync(ct);

        // Remove stale basket items whose products have been deleted/deactivated
        var staleItems = await _db.BasketItems
            .Where(b => b.SessionId == sessionId)
            .ToListAsync(ct);
        var activeIds = items.Select(i => i.Id).ToHashSet();
        var toRemove = staleItems.Where(s => !activeIds.Contains(s.Id)).ToList();
        if (toRemove.Count > 0)
        {
            _db.BasketItems.RemoveRange(toRemove);
            await _db.SaveChangesAsync(ct);
        }

        return Ok(MapBasket(items));
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddToBasketRequest request, CancellationToken ct)
    {
        var sessionId = GetOrCreateSessionId();

        var product = await _db.Products
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == request.ProductId && p.IsActive, ct);
        if (product == null) return NotFound(new { message = "Ürün bulunamadı." });

        var existing = await _db.BasketItems.FirstOrDefaultAsync(
            b => b.SessionId == sessionId && b.ProductId == request.ProductId, ct);

        if (existing != null)
        {
            existing.Quantity += request.Quantity;
        }
        else
        {
            _db.BasketItems.Add(new BasketItem
            {
                SessionId = sessionId,
                ProductId = request.ProductId,
                Quantity = Math.Max(1, request.Quantity),
            });
        }

        await _db.SaveChangesAsync(ct);

        var items = await _db.BasketItems
            .Include(b => b.Product).ThenInclude(p => p.Brand)
            .Include(b => b.Product).ThenInclude(p => p.Images)
            .Where(b => b.SessionId == sessionId)
            .OrderBy(b => b.CreatedAt)
            .ToListAsync(ct);

        return Ok(MapBasket(items));
    }

    [HttpPut("items/{productId:guid}")]
    public async Task<IActionResult> UpdateItem(Guid productId, [FromBody] UpdateBasketItemRequest request, CancellationToken ct)
    {
        var sessionId = GetOrCreateSessionId();

        var item = await _db.BasketItems.FirstOrDefaultAsync(
            b => b.SessionId == sessionId && b.ProductId == productId, ct);
        if (item == null) return NotFound();

        if (request.Quantity <= 0)
        {
            _db.BasketItems.Remove(item);
        }
        else
        {
            item.Quantity = request.Quantity;
        }

        await _db.SaveChangesAsync(ct);

        var items = await _db.BasketItems
            .Include(b => b.Product).ThenInclude(p => p.Brand)
            .Include(b => b.Product).ThenInclude(p => p.Images)
            .Where(b => b.SessionId == sessionId)
            .OrderBy(b => b.CreatedAt)
            .ToListAsync(ct);

        return Ok(MapBasket(items));
    }

    [HttpDelete("items/{productId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid productId, CancellationToken ct)
    {
        var sessionId = GetOrCreateSessionId();

        var item = await _db.BasketItems.FirstOrDefaultAsync(
            b => b.SessionId == sessionId && b.ProductId == productId, ct);
        if (item == null) return NotFound();

        _db.BasketItems.Remove(item);
        await _db.SaveChangesAsync(ct);

        var items = await _db.BasketItems
            .Include(b => b.Product).ThenInclude(p => p.Brand)
            .Include(b => b.Product).ThenInclude(p => p.Images)
            .Where(b => b.SessionId == sessionId)
            .OrderBy(b => b.CreatedAt)
            .ToListAsync(ct);

        return Ok(MapBasket(items));
    }

    [HttpDelete]
    public async Task<IActionResult> ClearBasket(CancellationToken ct)
    {
        var sessionId = GetOrCreateSessionId();

        var items = await _db.BasketItems.Where(b => b.SessionId == sessionId).ToListAsync(ct);
        _db.BasketItems.RemoveRange(items);
        await _db.SaveChangesAsync(ct);

        return Ok(new { items = Array.Empty<object>(), subTotal = 0m, totalItems = 0 });
    }

    private static object MapBasket(List<BasketItem> items)
    {
        var mapped = items.Select(b => new
        {
            productId = b.ProductId,
            productName = b.Product.Name,
            brandName = b.Product.Brand.Name,
            slug = b.Product.Slug,
            imageUrl = b.Product.Images.FirstOrDefault(i => i.IsPrimary)?.Url ?? b.Product.Images.FirstOrDefault()?.Url,
            price = b.Product.Price,
            currency = b.Product.Currency,
            quantity = b.Quantity,
            lineTotal = b.Product.Price * b.Quantity,
        }).ToList();

        return new
        {
            items = mapped,
            subTotal = mapped.Sum(x => x.lineTotal),
            totalItems = mapped.Sum(x => x.quantity),
        };
    }
}

public record AddToBasketRequest(Guid ProductId, int Quantity = 1);
public record UpdateBasketItemRequest(int Quantity);
