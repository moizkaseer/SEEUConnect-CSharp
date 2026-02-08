# ============================================
# Multi-stage Dockerfile for SEEUConnect API
# Works with Azure App Service & Google Cloud Run
# ============================================

# Stage 1: Base runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

# Stage 2: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["SEEUConnect.Backend/SEEUConnect.Backend.csproj", "SEEUConnect.Backend/"]
RUN dotnet restore "./SEEUConnect.Backend/SEEUConnect.Backend.csproj"
COPY . .
WORKDIR "/src/SEEUConnect.Backend"
RUN dotnet build "./SEEUConnect.Backend.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Stage 3: Publish
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./SEEUConnect.Backend.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Stage 4: Final production image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Default to Production environment
ENV ASPNETCORE_ENVIRONMENT=Production
# Listen on port 8080 (required by Cloud Run, works with Azure too)
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "SEEUConnect.Backend.dll"]
