$files = Get-ChildItem -Path "Minimarket.Domain\Entities" -Recurse -File -Filter "*.cs"
foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $content = $content -replace "namespace Minimarket.API.Models", "namespace Minimarket.Domain.Entities"
    Set-Content -Path $file.FullName -Value $content
}

$files = Get-ChildItem -Path "Minimarket.Application\DTOs" -Recurse -File -Filter "*.cs"
foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $content = $content -replace "namespace Minimarket.API.DTOs", "namespace Minimarket.Application.DTOs"
    $content = $content -replace "using Minimarket.API.Models;", "using Minimarket.Domain.Entities;"
    Set-Content -Path $file.FullName -Value $content
}

$files = Get-ChildItem -Path "Minimarket.Application\Interfaces" -Recurse -File -Filter "*.cs"
foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $content = $content -replace "namespace Minimarket.API.Interfaces", "namespace Minimarket.Application.Interfaces"
    $content = $content -replace "using Minimarket.API.Models;", "using Minimarket.Domain.Entities;"
    $content = $content -replace "using Minimarket.API.DTOs;", "using Minimarket.Application.DTOs;"
    Set-Content -Path $file.FullName -Value $content
}

$files = Get-ChildItem -Path "Minimarket.Infrastructure\Services" -Recurse -File -Filter "*.cs"
foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $content = $content -replace "namespace Minimarket.API.Services", "namespace Minimarket.Infrastructure.Services"
    $content = $content -replace "using Minimarket.API.Models;", "using Minimarket.Domain.Entities;"
    $content = $content -replace "using Minimarket.API.DTOs;", "using Minimarket.Application.DTOs;"
    $content = $content -replace "using Minimarket.API.Interfaces;", "using Minimarket.Application.Interfaces;"
    Set-Content -Path $file.FullName -Value $content
}

$files = Get-ChildItem -Path "Minimarket.Infrastructure\Data" -Recurse -File -Filter "*.cs"
foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $content = $content -replace "namespace Minimarket.API.Models", "namespace Minimarket.Infrastructure.Data"
    Set-Content -Path $file.FullName -Value $content
}

$files = Get-ChildItem -Path "Minimarket.API\Controllers" -Recurse -File -Filter "*.cs"
foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $content = $content -replace "using Minimarket.API.Models;", "using Minimarket.Domain.Entities;"
    $content = $content -replace "using Minimarket.API.DTOs;", "using Minimarket.Application.DTOs;"
    $content = $content -replace "using Minimarket.API.Interfaces;", "using Minimarket.Application.Interfaces;"
    Set-Content -Path $file.FullName -Value $content
}
