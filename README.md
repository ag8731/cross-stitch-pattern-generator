# Cross Stitch Pattern Generator

A modern web application for creating cross stitch patterns from images, similar to flosscross and stitchfiddle. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Image Upload**: Upload JPG, PNG, GIF, or WebP images to convert to cross stitch patterns
- **Pattern Generation**: Advanced color reduction with DMC color matching
- **Interactive Editor**: Draw, erase, fill, and color picker tools
- **Customizable Settings**: 
  - Pattern dimensions (width/height in stitches)
  - Cloth count (11-32 threads per inch)
  - Maximum colors (10-100)
  - Optional dithering for better gradients
- **Color Management**: Full DMC color palette with thread count calculator
- **Export Options**:
  - PNG image with grid and symbols
  - PDF with pattern and legend for printing
  - JSON format for saving and loading patterns
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cross-stitch-pattern-generator
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload an Image**: Drag and drop or click to browse for an image file
2. **Adjust Settings**: Configure pattern size, cloth count, and color limits
3. **Generate Pattern**: The app automatically converts your image to a cross stitch pattern
4. **Edit (Optional)**: Use drawing tools to modify the pattern
5. **Export**: Download your pattern as PDF, image, or save as JSON

## Project Structure

```
src/
├── app/
│   └── page.tsx              # Main application page
├── components/
│   ├── ImageUploader.tsx     # File upload component
│   ├── PatternGrid.tsx       # Interactive pattern display
│   ├── ToolPalette.tsx       # Drawing tools and color selection
│   ├── PatternSettings.tsx   # Pattern configuration
│   ├── ColorLegend.tsx       # DMC color legend with thread counts
│   └── ExportOptions.tsx     # Export functionality
├── types/
│   └── pattern.ts            # TypeScript type definitions
├── data/
│   └── dmc-colors.ts         # DMC color palette
└── utils/
    ├── imageProcessor.ts     # Image processing and pattern generation
    └── exportUtils.ts        # PDF, image, and JSON export
```

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Image Processing**: HTML5 Canvas API
- **PDF Generation**: jsPDF
- **Icons**: Lucide React

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy automatically with zero configuration

### Other Platforms

The app can be deployed to any platform that supports Node.js:

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- DMC color palette data for accurate thread matching
- Inspired by flosscross and stitchfiddle
- Built with modern web technologies for the best user experience
