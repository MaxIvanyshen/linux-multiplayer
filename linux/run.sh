#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Tokyo Night Container Setup Script${NC}"

# Stop and remove existing container if it exists
echo -e "${YELLOW}🧹 Cleaning up existing container...${NC}"
docker stop sandbox-container 2>/dev/null || echo "No existing container to stop"
docker rm sandbox-container 2>/dev/null || echo "No existing container to remove"

# Remove old image to ensure clean build
echo -e "${YELLOW}🗑️  Removing old image...${NC}"
docker rmi sandbox:latest 2>/dev/null || echo "No existing image to remove"

# Build new image
echo -e "${YELLOW}🏗️  Building new container image...${NC}"
docker build -t sandbox:latest .

# Create new container with proper port mapping
echo -e "${YELLOW}📦 Creating new container...${NC}"
docker run -d \
    --name sandbox-container \
    -p 2222:22 \
    -p 8080:8080 \
    sandbox:latest

# Wait for container to start
echo -e "${YELLOW}⏳ Waiting for container to start...${NC}"
sleep 3

# Copy SSH key to new container
echo -e "${YELLOW}🔑 Setting up SSH access...${NC}"
docker exec sandbox-container sh -c 'mkdir -p /root/.ssh && chmod 700 /root/.ssh'

# Check if SSH key exists, create if not
if [ ! -f ~/.ssh/tiny_linux_key ]; then
    echo -e "${YELLOW}🔐 Creating SSH key...${NC}"
    ssh-keygen -t rsa -f ~/.ssh/tiny_linux_key -N "" -C "sandbox-container"
fi

# Add public key to container
docker exec sandbox-container sh -c "echo '$(cat ~/.ssh/tiny_linux_key.pub)' > /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys"

# Test the container
echo -e "${GREEN}✅ Container setup complete!${NC}"
echo -e "${GREEN}📞 Testing container...${NC}"
docker exec sandbox-container sh -c "hostname && whoami && echo 'Container ready!'"

echo -e "${GREEN}🎯 Connection info:${NC}"
echo "SSH: ssh -i ~/.ssh/tiny_linux_key root@localhost -p 2222"
echo "Web: http://localhost:8080 (if you have a web service)"

