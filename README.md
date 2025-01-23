# Newton Ads API

## Campaign Creation API

### POST /api/campaigns/:email

Creates a new campaign in the system using the customer's email.

#### Parameters

Path Parameter:
- `:email` - The email address of the customer

Query Parameters:
- `campaign_name` - Name of the campaign
- `start_date` - Start date in ISO format (e.g., 2024-03-15T00:00:00Z)
- `end_date` - End date in ISO format
- `budget` - Campaign budget (number)
- `status` - Campaign status (active, paused, or completed)
- `campaign_type` - Type of campaign
- `ad_type` - Type of ad (in-app, web-contextual, d-ooh, or ar-vr)
- `ad_platform` - Platform for the ad
- `target_type` - Type of target
- `target_kpi` - Target KPI
- `target_event` - Target event
- `targeting` - Targeting criteria

#### Example Request

```
POST https://api.yourdomain.com/api/campaigns/user@example.com?campaign_name=Test%20Campaign&start_date=2024-03-15T00:00:00Z&end_date=2024-04-15T00:00:00Z&budget=1000&status=active&campaign_type=awareness&ad_type=in-app&ad_platform=mobile&target_type=conversion&target_kpi=clicks&target_event=purchase&targeting=age:18-34,location:US
```

#### Response

Success (201):
```json
{
  "success": true,
  "message": "Campaign created successfully!",
  "data": {
    "$id": "string",
    "campaign_name": "string",
    "user_id": "string",
    "customers": ["string"],
    ...
  },
  "animation": {
    "type": "success",
    "duration": 3000
  }
}
```

Error (400, 404, 500):
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error message"
}
```

## Deployment Instructions

1. Install required software:
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

2. Install PM2:
```bash
npm install -g pm2
```

3. Configure Nginx:
```bash
# Copy nginx.conf to /etc/nginx/sites-available/
sudo cp nginx.conf /etc/nginx/sites-available/newton-ads-api
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/newton-ads-api /etc/nginx/sites-enabled/
# Test configuration
sudo nginx -t
# Reload Nginx
sudo systemctl reload nginx
```

4. Set up SSL certificate:
```bash
sudo certbot --nginx -d api.yourdomain.com
```

5. Start the application with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
```

6. Enable PM2 startup script:
```bash
pm2 startup
```