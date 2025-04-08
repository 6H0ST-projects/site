This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Ghost Projects

A showcase of experimental projects.

## Features

- **Dynamic Project Pages**: Each project has its own customized page with unique styling.
- **Smooth Animations**: Various UI animations including meteors, transitions, and hover effects.
- **Responsive Design**: Fully responsive layout that adapts to different screen sizes.
- **Product Health Analyzer**: AI-powered tool that evaluates products for health implications using computer vision and research capabilities.

## Product Health Analyzer

The Product Health Analyzer is a dedicated tool that allows users to:

1. Upload a product image
2. Upload a nutrition/ingredients label (optional)
3. Describe the product
4. Receive a comprehensive health analysis including:
   - Overall health score (1-10)
   - Detailed ingredients analysis
   - Health implications
   - Healthier alternatives
   - Scientific references

The analyzer uses OpenAI's Vision and GPT models to process images and generate detailed health assessments.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and add your OpenAI API key
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file in the root directory with the following:

```
OPENAI_API_KEY=your_openai_api_key_here
```

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- OpenAI API

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
