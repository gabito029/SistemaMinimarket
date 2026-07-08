# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy all csproj files and restore
COPY ["Minimarket.API/Minimarket.API.csproj", "Minimarket.API/"]
COPY ["Minimarket.Application/Minimarket.Application.csproj", "Minimarket.Application/"]
COPY ["Minimarket.Domain/Minimarket.Domain.csproj", "Minimarket.Domain/"]
COPY ["Minimarket.Infrastructure/Minimarket.Infrastructure.csproj", "Minimarket.Infrastructure/"]

RUN dotnet restore "Minimarket.API/Minimarket.API.csproj"

# Copy remaining code and publish
COPY . .
WORKDIR "/src/Minimarket.API"
RUN dotnet publish "Minimarket.API.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "Minimarket.API.dll"]
