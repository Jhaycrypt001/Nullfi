# Test Escrow API Endpoints

# Get auth message
Write-Host "1. Getting auth message..."
$messageResponse = curl -s http://localhost:3000/api/auth/message | ConvertFrom-Json
Write-Host "Message: $($messageResponse.message)"
Write-Host ""

# For testing, we'll create a test JWT manually
# In production, you'd sign the message with your wallet

Write-Host "2. Testing Escrow Create (without valid signature - will fail without proper auth)"
Write-Host ""

# Test data
$testEscrow = @{
    freelancerId = "test-freelancer-id"
    jobTitle = "Build a website"
    jobDescription = "Create a modern responsive website"
    category = "development"
    totalAmount = "1000000000"
    milestoneCount = 3
    milestones = @(
        @{
            title = "Design"
            description = "Create design mockups"
            amount = "300000000"
        },
        @{
            title = "Development"
            description = "Code the website"
            amount = "500000000"
        },
        @{
            title = "Testing"
            description = "QA and deployment"
            amount = "200000000"
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "Test data: $testEscrow"
Write-Host ""
Write-Host "To test with auth, you need a valid JWT token from /api/auth/verify-signature"
Write-Host "Example with token:"
Write-Host 'curl -X POST http://localhost:3000/api/escrow/create `'
Write-Host '  -H "Authorization: Bearer YOUR_JWT_TOKEN" `'
Write-Host '  -H "Content-Type: application/json" `'
Write-Host '  -d $testEscrow'
