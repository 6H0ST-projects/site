#!/bin/bash

# Ensure Git LFS files are pulled properly
echo "Fetching LFS files..."
git lfs pull

# Build the site
echo "Building site..."
npm run build

# Copy files to the output directory
echo "Ensuring downloads are available..."
mkdir -p .next/static/downloads
cp -r public/downloads/* .next/static/downloads/

echo "Build completed successfully!"