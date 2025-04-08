# Product Health Analyzer

## Overview

The Product Health Analyzer is an AI-powered tool that evaluates consumer products for health implications. It uses computer vision to analyze product images and nutrition/ingredient labels, then searches for health information to provide comprehensive assessments.

## Features

- **Product Image Analysis**: Upload a photo of any consumer product
- **Label Analysis**: Optional upload of nutrition facts or ingredients label
- **Health Score**: Get a 1-10 rating of the product's health implications
- **Detailed Analysis**: Comprehensive breakdown of ingredients and their health effects
- **Alternative Suggestions**: Recommendations for healthier product alternatives

## Technical Implementation

### Components

- **ProductAnalysisApp**: Main component handling the UI and analysis logic
- **API Integration**: 
  - `/api/analyze-image`: For OpenAI Vision analysis of product images
  - `/api/search-analyze`: For detailed health information retrieval and analysis

### Technologies

- Next.js (React framework)
- TypeScript
- OpenAI GPT-4 Vision API
- OpenAI GPT-4 Turbo for text analysis
- Streaming response handling for real-time analysis updates

## Usage Flow

1. User uploads a product image (required)
2. User uploads a label image (optional)
3. User provides a brief product description
4. System analyzes images with OpenAI Vision
5. System retrieves health information about ingredients/materials
6. System generates a comprehensive health report with:
   - Overall health score
   - Ingredient analysis
   - Health implications
   - Alternative suggestions
   - Scientific references

## Environment Variables

The component requires an OpenAI API key to be set in the environment:

```
OPENAI_API_KEY=your_openai_api_key
``` 