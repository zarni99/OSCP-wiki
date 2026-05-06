# OSCP Wiki

OSCP Wiki is a Next.js web application tailored for storing, searching, and organizing notes for the Offensive Security Certified Professional (OSCP) certification. It serves as a comprehensive personal knowledge base for penetration testing techniques, commands, and study materials, while also providing professional reporting tools.

## Key Features

- **Knowledge Base**: Centralized, searchable repository for penetration testing notes, commands, and methodologies.
- **Professional Report Builder**: Built-in tool to generate industry-standard penetration testing reports (including Executive Summaries, Target Information, and AD Chains).
- **PDF Export**: Seamlessly export your generated reports into clean, professional PDFs for submission or archiving.
- **Modern UI**: Fast, responsive interface built with Next.js and modern web technologies.

## Getting Started

### Prerequisites

Make sure you have Node.js installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/zarni99/OSCP-wiki.git
   cd OSCP-wiki
   ```

2. Install the dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

### Running the App

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- jsPDF & html2canvas (for PDF generation)
