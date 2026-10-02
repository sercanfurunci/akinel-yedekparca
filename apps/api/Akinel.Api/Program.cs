using System.Text;
using System.Threading.RateLimiting;
using Akinel.Infrastructure;
using Akinel.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// ── Sentry ──────────────────────────────────────────────────────────────────
// Configured via Sentry:Dsn (environment variable Sentry__Dsn in production).
// Automatically disabled when DSN is empty/null.
builder.WebHost.UseSentry(o =>
{
    o.Dsn = builder.Configuration["Sentry:Dsn"];
    o.Environment = builder.Environment.EnvironmentName;
    o.TracesSampleRate = builder.Configuration.GetValue<double>("Sentry:TracesSampleRate", 0.1);
    o.SendDefaultPii = false;
    o.SetBeforeSend((@event, _) =>
    {
        // Drop noise: cancelled requests are not errors worth alerting on
        if (@event.Exception is OperationCanceledException) return null;
        return @event;
    });
});

// ── Logging ──────────────────────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "AkinelApi")
    .Enrich.WithProperty("Environment", builder.Environment.EnvironmentName)
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// ── Core services ─────────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();
builder.Services.AddResponseCaching();
builder.Services.AddMemoryCache();

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddDataProtection().PersistKeysToDbContext<AkinelDbContext>();

// ── Health checks ─────────────────────────────────────────────────────────────
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AkinelDbContext>("database", tags: ["ready"]);

// ── Startup validation — fail fast on missing secrets ─────────────────────────
var jwtSecret = builder.Configuration["Jwt:Secret"];
if (string.IsNullOrEmpty(jwtSecret))
{
    if (!builder.Environment.IsDevelopment())
        throw new InvalidOperationException(
            "Jwt:Secret is required. Set the Jwt__Secret environment variable.");
    Log.Warning("Jwt:Secret is empty. Using empty signing key — acceptable in Development only.");
}

// ── Authentication ────────────────────────────────────────────────────────────
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSecret ?? string.Empty))
        };
    });

builder.Services.AddAuthorization();

// ── Rate limiting (configurable via RateLimiting section in appsettings) ──────
var rl = builder.Configuration.GetSection("RateLimiting");

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.OnRejected = (ctx, _) =>
    {
        Log.Warning("Rate limit exceeded: {Method} {Path} from {IP}",
            ctx.HttpContext.Request.Method,
            ctx.HttpContext.Request.Path,
            ctx.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown");
        return ValueTask.CompletedTask;
    };

    // Login — brute force protection
    options.AddPolicy("login", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = rl.GetValue("Login:PermitLimit", 10),
                Window = TimeSpan.FromMinutes(rl.GetValue("Login:WindowMinutes", 1)),
                QueueLimit = 0,
            }));

    // Register — spam protection
    options.AddPolicy("register", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = rl.GetValue("Register:PermitLimit", 5),
                Window = TimeSpan.FromMinutes(rl.GetValue("Register:WindowMinutes", 60)),
                QueueLimit = 0,
            }));

    // Checkout — prevents order spam
    options.AddPolicy("checkout", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = rl.GetValue("Checkout:PermitLimit", 10),
                Window = TimeSpan.FromMinutes(rl.GetValue("Checkout:WindowMinutes", 60)),
                QueueLimit = 0,
            }));

    // Search — anti-scraping (higher limit, normal browsing should not hit this)
    options.AddPolicy("search", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = rl.GetValue("Search:PermitLimit", 60),
                Window = TimeSpan.FromMinutes(rl.GetValue("Search:WindowMinutes", 1)),
                QueueLimit = 0,
            }));

    // VIN decode — calls external NHTSA API, expensive per request
    options.AddPolicy("vin", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = rl.GetValue("VinDecode:PermitLimit", 10),
                Window = TimeSpan.FromMinutes(rl.GetValue("VinDecode:WindowMinutes", 1)),
                QueueLimit = 0,
            }));
});

// ── CORS ──────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var origins = builder.Configuration["Cors:AllowedOrigins"]
            ?.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
            ?? ["http://localhost:3000"];
        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// ── Swagger (dev only) ────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ── Exception handling ────────────────────────────────────────────────────────
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { message = "Bir hata oluştu. Lütfen tekrar deneyin." });
    });
});

app.UseSerilogRequestLogging();

// ── Security headers ──────────────────────────────────────────────────────────
app.Use(async (ctx, next) =>
{
    ctx.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    ctx.Response.Headers.Append("X-Frame-Options", "DENY");
    ctx.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    ctx.Response.Headers.Append("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (ctx.Request.IsHttps)
        ctx.Response.Headers.Append("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    await next();
});

app.UseStaticFiles();
app.UseCors("AllowFrontend");
app.UseResponseCaching();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// ── Health checks ─────────────────────────────────────────────────────────────
// /health/live  — liveness: is the process running?
// /health/ready — readiness: can the app serve traffic (DB connected)?
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false,
    ResponseWriter = async (ctx, _) =>
    {
        ctx.Response.ContentType = "application/json";
        await ctx.Response.WriteAsJsonAsync(new
        {
            status = "ok",
            environment = app.Environment.EnvironmentName
        });
    }
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = async (ctx, report) =>
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.StatusCode = report.Status == HealthStatus.Healthy ? 200 : 503;
        await ctx.Response.WriteAsJsonAsync(new
        {
            status = report.Status.ToString().ToLower(),
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString().ToLower()
            })
        });
    }
});

app.MapControllers();

// ── Database seed ─────────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AkinelDbContext>();
    await DatabaseSeeder.SeedAsync(context);
}

app.Run();
