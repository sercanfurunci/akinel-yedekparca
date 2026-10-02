using Akinel.Application.DTOs;

namespace Akinel.Application.Services;

public interface IFeatureFlagService
{
    bool IsEnabled(string flagName);
    FeatureFlagsDto GetAll();
}
