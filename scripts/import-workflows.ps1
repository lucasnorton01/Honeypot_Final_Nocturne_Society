# Import n8n workflows script
# This script imports the three workflow JSON files into n8n

$baseUrl = "http://localhost:5678"
$workflowDir = "n8n\workflows"

# Check if n8n is running
Write-Host "Checking if n8n is running..." -ForegroundColor Cyan
try {
    $test = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 5
    Write-Host "n8n is running at $baseUrl" -ForegroundColor Green
} catch {
    Write-Host "ERROR: n8n is not accessible at $baseUrl" -ForegroundColor Red
    Write-Host "Make sure Docker containers are running: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

# Try to authenticate with n8n API
Write-Host "`nAttempting to authenticate with n8n API..." -ForegroundColor Cyan

# Method 1: Try with default owner setup (first user)
# n8n creates owner on first setup, try to list workflows without auth first
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/workflows" -UseBasicParsing -TimeoutSec 5
    Write-Host "API access granted (no auth needed)" -ForegroundColor Green
    $headers = @{}
} catch {
    Write-Host "API requires authentication. Trying to get API key..." -ForegroundColor Yellow
    
    # If we get 401, n8n needs owner setup or API key
    # We'll import via the UI approach using the REST API with cookie auth
    Write-Host "`nIMPORTANT: n8n requires owner setup." -ForegroundColor Yellow
    Write-Host "Options to import workflows:" -ForegroundColor White
    Write-Host ""
    Write-Host "OPTION 1 - Import via n8n UI (Recommended):" -ForegroundColor Green
    Write-Host "  1. Open http://localhost:5678 in your browser" -ForegroundColor White
    Write-Host "  2. Set up owner account if prompted" -ForegroundColor White
    Write-Host "  3. Go to Workflows > Import from File" -ForegroundColor White
    Write-Host "  4. Import each file from $workflowDir\:" -ForegroundColor White
    Write-Host "     - event-ingest.json" -ForegroundColor White
    Write-Host "     - ioc-extractor.json" -ForegroundColor White
    Write-Host "     - report-generator.json" -ForegroundColor White
    Write-Host ""
    Write-Host "OPTION 2 - Use n8n CLI inside Docker:" -ForegroundColor Green
    Write-Host "  docker exec -it n8n n8n import:workflow --input=/home/node/.n8n/workflow-export.json" -ForegroundColor White
    Write-Host ""
    
    # Try alternative: Import via n8n internal endpoint (no auth needed for setup)
    Write-Host "Attempting alternative import method..." -ForegroundColor Cyan
    
    foreach ($file in @("event-ingest.json", "ioc-extractor.json", "report-generator.json")) {
        $filePath = Join-Path $workflowDir $file
        if (Test-Path $filePath) {
            $content = Get-Content $filePath -Raw
            Write-Host "Importing $file..." -ForegroundColor Gray
            
            # Try the /rest/workflows endpoint (internal API, may work without auth during setup)
            try {
                $body = @{
                    name = ($content | ConvertFrom-Json).name
                    nodes = ($content | ConvertFrom-Json).nodes
                    connections = ($content | ConvertFrom-Json).connections
                    settings = ($content | ConvertFrom-Json).settings
                    active = $false
                } | ConvertTo-Json -Depth 10
                
                $importResponse = Invoke-WebRequest -Uri "$baseUrl/rest/workflows" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
                Write-Host "  SUCCESS: $file imported" -ForegroundColor Green
            } catch {
                Write-Host "  Could not import $file via API: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  File not found: $filePath" -ForegroundColor Red
        }
    }
    
    Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
    Write-Host "MANUAL IMPORT INSTRUCTIONS:" -ForegroundColor Yellow
    Write-Host ("=" * 60) -ForegroundColor Gray
    Write-Host ""
    Write-Host "Since n8n requires owner setup, please:" -ForegroundColor White
    Write-Host "1. Open http://localhost:5678 in your browser" -ForegroundColor Cyan
    Write-Host "2. Complete the owner account setup" -ForegroundColor Cyan
    Write-Host "3. Navigate to Workflows" -ForegroundColor Cyan
    Write-Host "4. Click '+' to create new workflow" -ForegroundColor Cyan
    Write-Host "5. Click the '...' menu > Import from File" -ForegroundColor Cyan
    Write-Host "6. Import each of these 3 files:" -ForegroundColor Cyan
    Write-Host "   - $workflowDir\event-ingest.json" -ForegroundColor White
    Write-Host "   - $workflowDir\ioc-extractor.json" -ForegroundColor White
    Write-Host "   - $workflowDir\report-generator.json" -ForegroundColor White
    Write-Host "7. Activate each workflow after import" -ForegroundColor Cyan
    Write-Host ""
    
    exit 0
}

# If we got here, we have API access
Write-Host "`nImporting workflows..." -ForegroundColor Cyan

foreach ($file in @("event-ingest.json", "ioc-extractor.json", "report-generator.json")) {
    $filePath = Join-Path $workflowDir $file
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        Write-Host "Importing $file..." -ForegroundColor Gray
        
        try {
            $importResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/workflows" -Method POST -Body $content -ContentType "application/json" -Headers $headers -UseBasicParsing -TimeoutSec 10
            $result = $importResponse.Content | ConvertFrom-Json
            Write-Host "  SUCCESS: Imported '$($result.name)' (ID: $($result.id))" -ForegroundColor Green
        } catch {
            Write-Host "  ERROR importing $file : $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  File not found: $filePath" -ForegroundColor Red
    }
}

Write-Host "`nDone!" -ForegroundColor Green