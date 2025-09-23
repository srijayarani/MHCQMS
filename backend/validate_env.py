#!/usr/bin/env python3
"""
Environment validation script for MHCQMS backend.
Run this script to check if all required environment variables are set.
"""

import os
from dotenv import load_dotenv

def validate_environment():
    """Validate that all required environment variables are set."""
    
    # Load environment variables from config.env if it exists (for local development)
    config_paths = ["config.env", "../config.env"]
    config_loaded = False
    
    for config_path in config_paths:
        if os.path.exists(config_path):
            load_dotenv(config_path)
            print(f"✓ Loaded environment variables from {config_path}")
            config_loaded = True
            break
    
    if not config_loaded:
        print("⚠ config.env not found, using system environment variables")
    
    # Required environment variables
    required_vars = [
        "DATABASE_URL",
        "SECRET_KEY", 
        "JWT_SECRET",
        "JWT_ALGORITHM",
        "ACCESS_TOKEN_EXPIRE_MINUTES"
    ]
    
    # Optional environment variables with defaults
    optional_vars = {
        "ALGORITHM": "HS256",
        "REFRESH_TOKEN_EXPIRE_DAYS": "7"
    }
    
    print("\n🔍 Checking required environment variables:")
    all_good = True
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            # Mask sensitive values
            if "SECRET" in var or "KEY" in var or "URL" in var:
                masked_value = value[:10] + "..." if len(value) > 10 else "***"
                print(f"✓ {var}: {masked_value}")
            else:
                print(f"✓ {var}: {value}")
        else:
            print(f"✗ {var}: NOT SET")
            all_good = False
    
    print("\n🔍 Checking optional environment variables:")
    for var, default in optional_vars.items():
        value = os.getenv(var, default)
        if value == default:
            print(f"○ {var}: {value} (default)")
        else:
            print(f"✓ {var}: {value}")
    
    print("\n" + "="*50)
    if all_good:
        print("🎉 All required environment variables are set!")
        print("✅ Ready for deployment")
    else:
        print("❌ Some required environment variables are missing!")
        print("💡 Make sure to set all required environment variables in your deployment platform")
    
    return all_good

if __name__ == "__main__":
    validate_environment()
