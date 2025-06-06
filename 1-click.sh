#!/bin/bash

# One-Click Setup Script for SecTracker Project
# Clones the project from GitHub and handles all setup automatically

set -e  # Exit on any error

# Project configuration
REPO_URL="https://github.com/SecFathy/sectracker.git"
PROJECT_NAME="sectracker"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "${PURPLE}[SETUP]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate URL
validate_url() {
    if [[ $1 =~ ^https?:// ]]; then
        return 0
    else
        return 1
    fi
}

# Make script executable
chmod +x "$0"

log_header "SecTracker One-Click Setup"
echo "=========================================="
log_info "This script will:"
echo "  1. Clone the SecTracker project from GitHub"
echo "  2. Install all required dependencies"
echo "  3. Configure Supabase integration"
echo "  4. Set up the database"
echo "  5. Prepare the project for development"
echo ""

# Check if git is installed
if ! command_exists git; then
    log_error "Git is not installed. Please install Git first:"
    echo "  - macOS: Install Xcode Command Line Tools or use 'brew install git'"
    echo "  - Linux: sudo apt install git (Ubuntu/Debian) or equivalent for your distro"
    exit 1
fi

# Clone the repository
log_info "Cloning SecTracker project..."
if [[ -d "$PROJECT_NAME" ]]; then
    log_warning "Directory '$PROJECT_NAME' already exists."
    read -p "Do you want to remove it and clone fresh? (y/N): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Removing existing directory..."
        rm -rf "$PROJECT_NAME"
    else
        log_info "Using existing directory. Pulling latest changes..."
        cd "$PROJECT_NAME"
        git pull origin main || git pull origin master || {
            log_warning "Failed to pull latest changes. Continuing with existing code..."
        }
    fi
else
    git clone "$REPO_URL" "$PROJECT_NAME" || {
        log_error "Failed to clone repository. Please check your internet connection."
        exit 1
    }
    cd "$PROJECT_NAME"
fi

# Navigate to project directory if not already there
if [[ ! -f "package.json" ]]; then
    if [[ -d "$PROJECT_NAME" ]]; then
        cd "$PROJECT_NAME"
    else
        log_error "Could not find the project directory or package.json"
        exit 1
    fi
fi

log_success "Project cloned successfully!"
log_info "Current directory: $(pwd)"

# Check if required files exist
if [[ ! -f "package.json" ]]; then
    log_error "package.json not found in the project directory."
    exit 1
fi

if [[ ! -f "database/init.sql" ]]; then
    log_warning "database/init.sql not found. Database import will be skipped."
fi

# Check OS System
log_info "Detecting operating system..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    log_success "Detected macOS"
    OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    log_success "Detected Linux"
    OS="linux"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    log_error "Windows detected. Please use WSL (Windows Subsystem for Linux) or install Node.js manually."
    exit 1
else
    log_error "Unsupported OS: $OSTYPE. Please run this script on macOS or Linux."
    exit 1
fi

# Install Node.js and npm based on OS
if ! command_exists node || ! command_exists npm; then
    log_info "Node.js not found. Installing..."
    
    if [[ "$OS" == "macos" ]]; then
        # Install Homebrew if not installed
        if ! command_exists brew; then
            log_info "Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || {
                log_error "Failed to install Homebrew"
                exit 1
            }
        fi
        
        # Install Node.js and npm
        log_info "Installing Node.js and npm via Homebrew..."
        brew install node || {
            log_error "Failed to install Node.js"
            exit 1
        }
        
    elif [[ "$OS" == "linux" ]]; then
        # Update package list
        log_info "Updating package list..."
        sudo apt update || {
            log_error "Failed to update package list"
            exit 1
        }
        
        # Install Node.js and npm
        log_info "Installing Node.js and npm..."
        if command_exists curl; then
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - || {
                log_error "Failed to add NodeSource repository"
                exit 1
            }
            sudo apt install -y nodejs || {
                log_error "Failed to install Node.js"
                exit 1
            }
        else
            log_info "curl not found, installing it first..."
            sudo apt install -y curl
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt install -y nodejs
        fi
    fi
else
    log_success "Node.js and npm are already installed"
    log_info "Node.js version: $(node --version)"
    log_info "npm version: $(npm --version)"
fi

# Install dependencies
log_info "Installing project dependencies..."
npm install || {
    log_error "Failed to install dependencies"
    exit 1
}

log_success "Dependencies installed successfully"

# Create .env file if it doesn't exist
if [[ ! -f ".env" ]]; then
    log_info "Creating .env file..."
    touch .env
fi

# Supabase configuration
echo ""
log_info "Supabase Configuration"
echo "========================================"
echo "Please obtain the following from your Supabase dashboard:"
echo "1. Project URL: https://supabase.com/dashboard/project/[project-name]/settings/api"
echo "2. Anon API Key: https://supabase.com/dashboard/project/[project-name]/settings/api"
echo "3. Direct Connection String: https://supabase.com/dashboard/project/[project-name]/settings/database"
echo ""

# Function to get user input with validation
get_supabase_url() {
    while true; do
        read -p "Enter your Supabase Project URL: " SUPABASE_URL
        if [[ -n "$SUPABASE_URL" ]] && validate_url "$SUPABASE_URL"; then
            break
        else
            log_error "Please enter a valid URL starting with http:// or https://"
        fi
    done
}

get_supabase_key() {
    while true; do
        read -p "Enter your Supabase Anon API Key: " SUPABASE_ANON_KEY
        if [[ -n "$SUPABASE_ANON_KEY" ]]; then
            break
        else
            log_error "API Key cannot be empty"
        fi
    done
}

get_connection_string() {
    while true; do
        read -p "Enter your Direct connection string (optional, press Enter to skip): " CONNECTION_STRING
        if [[ -z "$CONNECTION_STRING" ]]; then
            log_warning "Skipping database import"
            break
        elif [[ "$CONNECTION_STRING" =~ ^postgresql:// ]]; then
            break
        else
            log_error "Please enter a valid PostgreSQL connection string starting with postgresql://"
        fi
    done
}

# Get Supabase configuration
get_supabase_url
get_supabase_key
get_connection_string

# Create src/integrations/supabase directory if it doesn't exist
mkdir -p src/integrations/supabase

# Update client.ts with Supabase details
log_info "Updating Supabase client configuration..."
cat > src/integrations/supabase/client.ts << EOL
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { database } from '@/lib/database';

const SUPABASE_URL = "${SUPABASE_URL}";
const SUPABASE_PUBLISHABLE_KEY = "${SUPABASE_ANON_KEY}";

// Check if we're in offline mode
const isOfflineMode = import.meta.env.VITE_SUPABASE_ANON_KEY === 'offline_mode';

// Use local database client in offline mode, otherwise use Supabase
export const supabase = isOfflineMode 
  ? database as any
  : createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
EOL

log_success "Supabase client configuration updated"

# Update .env file
log_info "Updating environment variables..."
{
    echo "VITE_SUPABASE_URL=${SUPABASE_URL}"
    echo "VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}"
} >> .env

# Import database if connection string provided
if [[ -n "$CONNECTION_STRING" ]] && [[ -f "database/init.sql" ]]; then
    log_info "Importing database from init.sql..."
    
    # Check if psql is installed
    if command_exists psql; then
        psql "$CONNECTION_STRING" -f database/init.sql || {
            log_error "Failed to import database. Please check your connection string and try again manually."
            log_info "Manual command: psql \"$CONNECTION_STRING\" -f database/init.sql"
        }
        log_success "Database imported successfully"
    else
        log_error "psql (PostgreSQL client) not found. Please install it to import the database."
        log_info "On macOS: brew install postgresql"
        log_info "On Linux: sudo apt install postgresql-client"
        log_info "Manual command: psql \"$CONNECTION_STRING\" -f database/init.sql"
    fi
fi

# Display project information
echo ""
log_header "SecTracker Project Information"
echo "=========================================="
log_info "Repository: https://github.com/SecFathy/sectracker"
log_info "Project directory: $(pwd)"

# Final success message
echo ""
log_success "SecTracker setup completed successfully!"
echo "=========================================="
log_info "Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Open your browser to the URL shown in the terminal (usually http://localhost:5173)"
echo "3. Your Supabase configuration is saved in src/integrations/supabase/client.ts"
echo "4. Environment variables are saved in .env"
echo "5. Check the project README for additional setup instructions"
echo ""
log_info "Development commands:"
echo "  • npm run dev     - Start development server"
echo "  • npm run build   - Build for production"
echo "  • npm run preview - Preview production build"
echo "  • npm run lint    - Run code linting"
echo ""
log_info "If you need to reconfigure Supabase, run this script again or edit the files manually."
log_info "For issues or questions, visit: https://github.com/SecFathy/sectracker/issues"
