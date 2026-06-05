# Academica — Course Registration System

A Stripe-integrated course registration platform built with Node.js + Express. Students browse courses, view detailed pages, and complete payment via Stripe Checkout — all within a polished, production-ready interface.

---

## Project Structure

```
course-registration/
├── server.js                  # Express server — routes, Stripe checkout
├── package.json
├── .env.example               # Copy to .env and fill in your keys
├── Dockerfile
├── docker-compose.yml
├── .gitignore
└── client/
    ├── index.html             # Landing page with course cards
    ├── app.js                 # Frontend — card click → navigation
    ├── success.html           # Post-payment success page
    ├── cancel.html            # Cancelled checkout page
    ├── css/
    │   ├── style.css          # Global styles (landing page)
    │   └── courses.css        # Course detail page styles
    └── courses/
        ├── course1.html       # Scalable Systems Architecture
        ├── course2.html       # Applied ML Engineering
        ├── course3.html       # UX Fundamentals & Research
        ├── course4.html       # Modern Data Pipelines
        ├── course5.html       # Application Security Mastery
        └── course6.html       # AWS Cloud Practitioner
```

---

## Quick Start (Local)

### Prerequisites
- Node.js 18+
- A Stripe account (free) → https://stripe.com

### 1. Clone and install

```bash
git clone <your-repo-url>
cd course-registration
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your Stripe keys:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
PORT=3000
DOMAIN=http://localhost:3000
```

### 3. Create Stripe Products & Prices

In the [Stripe Dashboard](https://dashboard.stripe.com/products):

1. Create a Product for each course
2. Add a one-time Price to each product
3. Copy each `price_xxx` ID into the corresponding course HTML file:

| File | Variable | Course |
|------|----------|--------|
| `client/courses/course1.html` | `PRICE_ID` | Systems Architecture ($299) |
| `client/courses/course2.html` | `PRICE_ID` | ML Engineering ($449) |
| `client/courses/course3.html` | `PRICE_ID` | UX Fundamentals ($199) |
| `client/courses/course4.html` | `PRICE_ID` | Data Pipelines ($349) |
| `client/courses/course5.html` | `PRICE_ID` | App Security ($399) |
| `client/courses/course6.html` | `PRICE_ID` | AWS Practitioner ($249) |

### 4. Start the server

```bash
npm start
# → http://localhost:3000
```

---

## Docker

```bash
# Build and run with docker-compose
docker-compose up --build

# Or manually
docker build -t course-registration .
docker run -p 3000:3000 --env-file .env course-registration
```

---

## AWS EC2 Deployment

### Step 1 — Create an IAM User

1. AWS Console → **IAM** → **Users** → **Add users**
2. Username: `course-app-deployer`
3. Attach policy: `AmazonEC2FullAccess` (or a scoped custom policy)
4. Save the **Access Key ID** and **Secret Access Key**

### Step 2 — Launch an EC2 Instance

1. AWS Console → **EC2** → **Launch Instance**
2. **AMI**: Ubuntu Server 24.04 LTS (free tier eligible)
3. **Instance type**: `t2.micro` (free tier) or `t3.small` for production
4. **Key pair**: Create new → download the `.pem` file → save securely
5. **Network settings** → Edit Security Group:

| Type | Protocol | Port | Source |
|------|----------|------|--------|
| SSH  | TCP | 22 | Your IP (My IP) |
| HTTP | TCP | 80 | 0.0.0.0/0 |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 |

6. **Launch instance**

### Step 3 — Connect via SSH

```bash
# Fix key permissions
chmod 400 your-key.pem

# Connect
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

### Step 4 — Server Setup

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git

# Verify
node --version
npm --version
```

### Step 5 — Deploy the Application

```bash
# Clone your repo
git clone <your-repo-url>
cd course-registration

# Install dependencies
npm install --production

# Create .env
nano .env
# Paste your environment variables, save with Ctrl+X → Y → Enter
```

### Step 6 — Run with PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the app
pm2 start server.js --name "course-registration"

# Save PM2 process list (survives reboots)
pm2 save
pm2 startup
# Run the command PM2 outputs

# View logs
pm2 logs course-registration

# Restart after code changes
pm2 restart course-registration
```

### Step 7 — (Optional) Nginx Reverse Proxy on Port 80

```bash
sudo apt install -y nginx

sudo nano /etc/nginx/sites-available/courses
```

Paste:

```nginx
server {
    listen 80;
    server_name <YOUR_DOMAIN_OR_IP>;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/courses /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 8 — (Optional) HTTPS with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
# Update DOMAIN= in your .env to https://yourdomain.com
pm2 restart course-registration
```

---

## Architecture Overview

```
Browser
  │
  ├─ GET / → index.html (course cards)
  │   └─ app.js listens for card clicks → navigates to /courses/courseN
  │
  ├─ GET /courses/course1 → course1.html (detail + checkout button)
  │   └─ POST /create-checkout-session/:priceId
  │       └─ stripe.checkout.sessions.create()
  │           └─ redirect → Stripe hosted checkout
  │               ├─ success → /success?session_id=...
  │               └─ cancel  → /cancel
  │
  └─ GET /session-status?session_id=... → customer email for success page
```

---

## Adding New Courses

1. Create `client/courses/courseN.html` (copy an existing file)
2. Add a route in `server.js`: `app.get('/courses/courseN', ...)`
3. Add a card in `client/index.html` with id `work-N`
4. Register the mapping in `client/app.js`: `"work-N": "/courses/courseN"`
5. Set the correct Stripe `PRICE_ID` in the new course page

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key (backend only) | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` |
| `PORT` | Server port | `3000` |
| `DOMAIN` | Full URL for Stripe redirects | `https://yourdomain.com` |
| `STATIC_DIR` | Path to client directory | `client` |

---

## License

MIT — use freely, attribution appreciated.
