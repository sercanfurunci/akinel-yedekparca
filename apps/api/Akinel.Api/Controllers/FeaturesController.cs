using Akinel.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Akinel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeaturesController : ControllerBase
{
    private readonly IFeatureFlagService _features;

    public FeaturesController(IFeatureFlagService features)
    {
        _features = features;
    }

    /// <summary>
    /// Returns current feature flag states. Safe for public consumption — no secrets exposed.
    /// Frontend uses this to show/hide features without a redeploy.
    /// </summary>
    [HttpGet]
    [ResponseCache(Duration = 60, Location = ResponseCacheLocation.Any)]
    public IActionResult GetFeatures() => Ok(_features.GetAll());
}
