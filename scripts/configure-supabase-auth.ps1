# Configura Auth URLs en el proyecto paws-pasto (negehfyvwvpwwjugfbie)
# Uso: $env:SUPABASE_ACCESS_TOKEN="sbp_..."; .\scripts\configure-supabase-auth.ps1

$ErrorActionPreference = "Stop"
$ProjectRef = "negehfyvwvpwwjugfbie"

if (-not $env:SUPABASE_ACCESS_TOKEN) {
  Write-Error "Falta SUPABASE_ACCESS_TOKEN. Créalo en https://supabase.com/dashboard/account/tokens"
}

$body = @{
  site_url = "http://localhost:5173"
  uri_allow_list = "http://localhost:5173,http://localhost:5173/**,http://127.0.0.1:5173,http://127.0.0.1:5173/**,https://paws.com,https://paws.com/**"
  mailer_autoconfirm = $true
} | ConvertTo-Json

$headers = @{
  Authorization = "Bearer $env:SUPABASE_ACCESS_TOKEN"
  "Content-Type" = "application/json"
}

Write-Host "Actualizando Auth config en $ProjectRef..."
$response = Invoke-RestMethod `
  -Method Patch `
  -Uri "https://api.supabase.com/v1/projects/$ProjectRef/config/auth" `
  -Headers $headers `
  -Body $body

Write-Host "OK - site_url: $($response.site_url)"
Write-Host "OK - redirect URLs configuradas"
