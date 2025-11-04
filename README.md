# Med Hub

**A comprehensive medication inventory management system designed for health clinics and pharmacies.**

Med Hub is a modern web application that helps healthcare facilities efficiently track medication stock, monitor consumption patterns, and generate insightful reports. Built with React and TypeScript, it features AI-powered analytics to help optimize inventory management and transform your data into actionable insights.

---

## ✨ Features

### 📦 Inventory Management
- **Stock Tracking**: Record stock-in and stock-out transactions with detailed history
- **Source Tracking**: Track medication sources (DOH, MHO, PHILOS, etc.)
- **Low Stock Alerts**: Automatic flagging of medications below threshold levels
- **Real-time Updates**: Instant stock level updates with transaction history

### 📊 Analytics & Visualization
- **Consumption Trends**: Interactive 6-month weekly consumption charts
- **Depletion Forecasting**: Calculate days until stock depletion based on consumption patterns
- **30-Day Consumption Analysis**: View daily dispensing trends over the past month
- **Reorder Suggestions**: Intelligent recommendations for restocking based on consumption velocity

### 🤖 AI-Powered Insights
- **Pattern Analysis**: Google Gemini AI analyzes consumption patterns and identifies trends
- **Executive Reports**: Generate comprehensive period summaries with actionable recommendations
- **Forecasting**: Predict future consumption needs based on historical data
- **Risk Assessment**: Identify potential stockouts and operational risks

### 🔍 Search & Filter
- **Smart Search**: Quick search by medication name
- **Status Filtering**: Filter by all, low stock, or out of stock medications
- **Flexible Sorting**: Sort by name, stock level, or depletion date
- **Custom Order Tracking**: Mark medications as ordered for better workflow management

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.2.0
- **Language**: TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS
- **Charts**: Recharts 3.3.0
- **AI Integration**: Google Gemini AI (@google/genai 1.28.0)

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager
- **Google Gemini API Key** (for AI features)

---

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:mfranco1/med-hub.git
   cd med-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   > **Note**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000` to view the application.

---

## 📖 Usage

### Managing Stock

1. **View Dashboard**: The main dashboard displays all medications with their current stock levels
2. **Update Stock**: Click on a medication card and use the "Update Stock" button to record stock-in or stock-out transactions
3. **Set Low Stock Threshold**: Configure low stock thresholds for each medication to receive alerts

### Analyzing Trends

1. **View Consumption Trends**: Click "View Trends" on any medication card
2. **Review Charts**: Examine the 6-month weekly consumption chart and 30-day daily chart
3. **Read Analysis**: View AI-powered insights about consumption patterns and forecasts

### Generating Reports

1. **Open Reports**: Click "Generate Report" in the header
2. **Select Date Range**: Choose the period for your inventory summary
3. **Generate Report**: Click "Generate Report" for an executive report with recommendations
4. **Export**: Download reports in CSV format for record-keeping

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | Yes (for AI features) |

### Customization

- **Initial Medications**: Modify `constants.ts` to change default medication data
- **Low Stock Threshold**: Adjust per-medication thresholds in the stock update modal
- **Theme**: Customize colors in `index.html` CSS variables

---

## 🎯 Key Features in Detail

### Stock Management

Med Hub tracks every stock movement with detailed transaction records including:
- Transaction type (IN/OUT)
- Quantity
- Source (DOH, MHO, PHILOS, etc.)
- Timestamp

### Consumption Analytics

The analytics engine calculates:
- Average weekly consumption
- Projected depletion date
- Days until stockout
- Reorder recommendations based on consumption velocity

### AI Analysis

Powered by Google Gemini AI, the system provides:
- **Trend Analysis**: Identifies consumption patterns (steady, increasing, seasonal)
- **Forecasting**: Predicts future consumption needs
- **Risk Assessment**: Highlights potential stockout risks
- **Actionable Recommendations**: Suggests specific actions for inventory optimization

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

The production build will be created in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is private and not licensed for public use.

---

<div align="center">
Made with ❤️ for healthcare professionals
</div>
