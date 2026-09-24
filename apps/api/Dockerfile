FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Akinel.Domain/Akinel.Domain.csproj Akinel.Domain/
COPY Akinel.Application/Akinel.Application.csproj Akinel.Application/
COPY Akinel.Infrastructure/Akinel.Infrastructure.csproj Akinel.Infrastructure/
COPY Akinel.Api/Akinel.Api.csproj Akinel.Api/
RUN dotnet restore Akinel.Api/Akinel.Api.csproj

COPY . .
RUN dotnet publish Akinel.Api/Akinel.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

RUN mkdir -p wwwroot/uploads/products

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

ENTRYPOINT ["dotnet", "Akinel.Api.dll"]
