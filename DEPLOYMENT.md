# SEEUConnect Cloud Deployment Guide

This guide covers deploying the SEEUConnect full-stack application (ASP.NET Core 10 API + React frontend) to **Azure** or **Google Cloud**.

---

## Architecture Overview

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   React Frontend │────▶│  .NET 10 API     │────▶│  SQL Server DB   │
│  (Static Files)  │     │  (Containerized) │     │  (Cloud Managed) │
└──────────────────┘     └──────────────────┘     └──────────────────┘
   Azure Static          Azure App Service         Azure SQL Database
   Web Apps              OR Cloud Run              OR Cloud SQL
   OR Cloud Storage
```

---

## Option A: Deploy to Azure

### Azure Services Used

| Component | Azure Service | Estimated Cost |
|-----------|---------------|----------------|
| Backend API | Azure App Service (B1) | ~$13/month |
| Frontend | Azure Static Web Apps | Free tier available |
| Database | Azure SQL Database (Basic) | ~$5/month |

### Step 1: Create Azure Resources

Open the [Azure Portal](https://portal.azure.com) and run these commands in Azure Cloud Shell (or Azure CLI locally):

```bash
# Variables - change these to your preferences
RESOURCE_GROUP="seeuconnect-rg"
LOCATION="eastus"
SQL_SERVER_NAME="seeuconnect-sql"
SQL_DB_NAME="SEEUConnectDB"
SQL_ADMIN_USER="seeuadmin"
SQL_ADMIN_PASSWORD="YourStrongPassword123!"   # Change this!
APP_SERVICE_PLAN="seeuconnect-plan"
WEB_APP_NAME="seeuconnect-api"

# 1. Create Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION

# 2. Create Azure SQL Server
az sql server create \
  --name $SQL_SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --admin-user $SQL_ADMIN_USER \
  --admin-password $SQL_ADMIN_PASSWORD

# 3. Create Database
az sql db create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name $SQL_DB_NAME \
  --service-objective Basic

# 4. Allow Azure services to access SQL Server
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# 5. Create App Service Plan (Linux)
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux

# 6. Create Web App
az webapp create \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --runtime "DOTNETCORE:10.0"

# 7. Configure connection string
az webapp config connection-string set \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --connection-string-type SQLAzure \
  --settings DefaultConnection="Server=tcp:${SQL_SERVER_NAME}.database.windows.net,1433;Database=${SQL_DB_NAME};User ID=${SQL_ADMIN_USER};Password=${SQL_ADMIN_PASSWORD};Encrypt=True;TrustServerCertificate=False;"

# 8. Set JWT secret as app setting
az webapp config appsettings set \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    Jwt__Key="YourProductionSecretKeyAtLeast32Characters!@#$" \
    Jwt__Issuer="SEEUConnect" \
    Jwt__Audience="SEEUConnectUsers" \
    ASPNETCORE_ENVIRONMENT="Production"
```

### Step 2: Create Azure Static Web App (Frontend)

```bash
# Create via Azure Portal:
# 1. Go to Azure Portal > Create a resource > Static Web App
# 2. Connect to your GitHub repository
# 3. Set build preset to "React"
# 4. App location: /client
# 5. Output location: dist
```

### Step 3: Configure GitHub Secrets

Go to your GitHub repo > **Settings** > **Secrets and variables** > **Actions**, and add:

| Secret Name | How to Get It |
|-------------|---------------|
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Azure Portal > Your App Service > **Get publish profile** (download XML) |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Azure Portal > Your Static Web App > **Manage deployment token** |
| `AZURE_API_URL` | `https://seeuconnect-api.azurewebsites.net/api` |

### Step 4: Deploy

Push to `main` or `master` branch. The GitHub Actions workflow (`.github/workflows/deploy-azure.yml`) will automatically build and deploy.

```bash
git push origin main
```

### Step 5: Run Database Migrations

After the first deployment, run EF Core migrations against Azure SQL:

```bash
# From your local machine
dotnet ef database update \
  --project ./SEEUConnect.Backend/SEEUConnect.Backend \
  --connection "Server=tcp:seeuconnect-sql.database.windows.net,1433;Database=SEEUConnectDB;User ID=seeuadmin;Password=YourStrongPassword123!;Encrypt=True;TrustServerCertificate=False;"
```

---

## Option B: Deploy to Google Cloud

### Google Cloud Services Used

| Component | GCP Service | Estimated Cost |
|-----------|-------------|----------------|
| Backend API | Cloud Run | Pay-per-use (generous free tier) |
| Frontend | Cloud Storage + CDN | ~$1/month |
| Database | Cloud SQL (SQL Server) | ~$25/month (Express) |

### Step 1: Initial GCP Setup

```bash
# Install gcloud CLI: https://cloud.google.com/sdk/docs/install

# Login and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com
```

### Step 2: Create Cloud SQL Instance

```bash
# Create SQL Server instance
gcloud sql instances create seeuconnect-db \
  --database-version=SQLSERVER_2019_EXPRESS \
  --tier=db-custom-1-3840 \
  --region=us-central1 \
  --root-password="YourStrongPassword123!"

# Create database
gcloud sql databases create SEEUConnectDB \
  --instance=seeuconnect-db
```

### Step 3: Store Secrets in Secret Manager

```bash
# Store the database connection string
echo -n "Server=/cloudsql/YOUR_PROJECT:us-central1:seeuconnect-db;Database=SEEUConnectDB;User ID=sqlserver;Password=YourStrongPassword123!;TrustServerCertificate=True;" | \
  gcloud secrets create DB_CONNECTION_STRING --data-file=-

# Store the JWT key
echo -n "YourProductionSecretKeyAtLeast32Characters!@#$" | \
  gcloud secrets create JWT_SECRET_KEY --data-file=-
```

### Step 4: Create Artifact Registry Repository

```bash
gcloud artifacts repositories create seeuconnect \
  --repository-format=docker \
  --location=us-central1 \
  --description="SEEUConnect Docker images"
```

### Step 5: Build and Deploy Backend (Manual)

```bash
# Build Docker image
cd SEEUConnect.Backend
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT/seeuconnect/seeuconnect-api:latest \
  -f SEEUConnect.Backend/Dockerfile .

# Push to Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev
docker push us-central1-docker.pkg.dev/YOUR_PROJECT/seeuconnect/seeuconnect-api:latest

# Deploy to Cloud Run
gcloud run deploy seeuconnect-api \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT/seeuconnect/seeuconnect-api:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --set-env-vars ASPNETCORE_ENVIRONMENT=Production \
  --set-secrets "ConnectionStrings__DefaultConnection=DB_CONNECTION_STRING:latest,Jwt__Key=JWT_SECRET_KEY:latest" \
  --add-cloudsql-instances YOUR_PROJECT:us-central1:seeuconnect-db
```

### Step 6: Deploy Frontend to Cloud Storage

```bash
# Build the frontend
cd client
VITE_API_URL="https://seeuconnect-api-xxxxx-uc.a.run.app/api" npm run build

# Create a storage bucket
gsutil mb -l us-central1 gs://seeuconnect-frontend

# Enable website hosting
gsutil web set -m index.html -e index.html gs://seeuconnect-frontend

# Make public
gsutil iam ch allUsers:objectViewer gs://seeuconnect-frontend

# Upload files
gsutil -m rsync -r -d dist/ gs://seeuconnect-frontend
```

### Step 7: Configure GitHub Secrets (for CI/CD)

Go to GitHub repo > **Settings** > **Secrets and variables** > **Actions**:

| Secret Name | How to Get It |
|-------------|---------------|
| `GCP_PROJECT_ID` | Your GCP project ID |
| `GCP_SA_KEY` | Service account JSON key (see below) |
| `GCP_API_URL` | Cloud Run service URL + `/api` |

**Create a Service Account:**
```bash
# Create service account
gcloud iam service-accounts create github-deployer \
  --display-name="GitHub Actions Deployer"

# Grant roles
PROJECT_ID=$(gcloud config get-value project)

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Generate key (save this as GCP_SA_KEY secret)
gcloud iam service-accounts keys create key.json \
  --iam-account=github-deployer@${PROJECT_ID}.iam.gserviceaccount.com

cat key.json  # Copy this entire JSON into the GitHub secret
rm key.json   # Delete after copying
```

### Step 8: Run Database Migrations

```bash
# Use Cloud SQL Proxy to connect locally
cloud-sql-proxy YOUR_PROJECT:us-central1:seeuconnect-db &

dotnet ef database update \
  --project ./SEEUConnect.Backend/SEEUConnect.Backend \
  --connection "Server=127.0.0.1;Database=SEEUConnectDB;User ID=sqlserver;Password=YourStrongPassword123!;TrustServerCertificate=True;"
```

---

## Important Security Notes

1. **Never commit real secrets** to the repository. Use environment variables or secret managers.
2. The `appsettings.Production.json` file has placeholder values. Real values should be set via:
   - **Azure**: App Service Configuration (Application Settings)
   - **GCP**: Secret Manager + Cloud Run environment variables
3. **Change the JWT key** in production to a strong, unique value (at least 32 characters).
4. **Restrict CORS** in production to only your frontend domain instead of `AllowAllOrigins`.
5. **Enable HTTPS** redirection in production (uncomment `app.UseHttpsRedirection()` in `Program.cs`).

---

## Quick Reference: Which to Choose?

| Factor | Azure | Google Cloud |
|--------|-------|-------------|
| **Easiest for .NET** | Yes - native support | Good - via containers |
| **Cheapest to start** | ~$18/month | ~$26/month (SQL Server costs more) |
| **Free tier** | Static Web Apps free, App Service F1 free (limited) | Cloud Run generous free tier |
| **Auto-scaling** | App Service scales manually (or Premium) | Cloud Run scales to zero automatically |
| **Best for students** | Azure for Students ($100 credit) | GCP Free Tier ($300 credit) |
| **CI/CD** | GitHub Actions or Azure DevOps | GitHub Actions or Cloud Build |
