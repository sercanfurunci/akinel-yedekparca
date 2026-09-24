using Akinel.Application.DTOs;
using Akinel.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Akinel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IWebHostEnvironment _env;
    private const string SessionCookieName = "basket_session";

    public OrdersController(IOrderService orderService, IWebHostEnvironment env)
    {
        _orderService = orderService;
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

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request, CancellationToken ct)
    {
        var sessionId = GetOrCreateSessionId();
        var userId = GetUserId();

        try
        {
            var order = await _orderService.CreateOrderAsync(sessionId, userId, request, ct);
            return Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetMyOrders(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var orders = await _orderService.GetUserOrdersAsync(userId.Value, ct);
        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetOrder(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var order = await _orderService.GetOrderByIdAsync(id, userId, isAdmin: false, ct);
        return order == null ? NotFound() : Ok(order);
    }
}
