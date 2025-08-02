# PR Analysis Dashboard

An AI-powered pull request analysis dashboard built with React, TypeScript, and Ant Design. This dashboard provides comprehensive risk analysis, complexity metrics, and intelligent test recommendations for pull requests.

## 🚀 Features

### 📊 Dashboard Overview

- Key metrics display (Total PRs, High Risk PRs, Average Risk Score, Test Coverage)
- Quick action cards for navigation
- Real-time statistics

### 🔍 PR Risk Analysis (Complete Workflow)

- **PR URL Input**: Enter GitHub or GitLab pull request URLs with real-time validation
- **Overall Risk Assessment**: Visual risk score (0-10) with color-coded indicators
- **Complexity Metrics**: Cyclomatic complexity, cognitive complexity, and maintainability index
- **Impacted Modules**: Visual representation of affected modules with risk levels
- **🆕 Integrated Test Recommendations**: Complete AI-powered test suggestions with search and filtering
- **Historical Risk Analysis**: Timeline view of past risk assessments

### 🧪 AI-Generated Test Recommendations (Integrated)

- **Intelligent Test Suggestions**: AI-generated unit, integration, and E2E test recommendations
- **Search & Filter**: Find specific test recommendations quickly
- **Test Categories**: Organized by test type (Unit, Integration, E2E) with interactive cards
- **Priority-based Recommendations**: High, medium, and low priority tests
- **Expandable Code Views**: View complete test code examples with syntax highlighting
- **Time Estimates**: Estimated development time for each test

## 🛠️ Technology Stack

- **React 18** with TypeScript
- **Ant Design** (antd) for UI components
- **React Router** for navigation
- **CSS3** with custom styling
- **Modern ES6+** JavaScript features

## 📁 Project Structure

```
dashboard/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx        # Main dashboard overview
│   │   └── PRAnalysis.tsx       # Complete PR analysis with integrated test recommendations
│   ├── data/
│   │   └── mockData.ts          # Hardcoded sample data
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── App.tsx                  # Main application component
│   ├── App.css                  # Custom styles
│   └── index.tsx                # Application entry point
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14.0 or higher)
- npm or yarn package manager

### Installation

1. **Navigate to the dashboard directory:**

   ```bash
   cd dashboard
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm start
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:3000
   ```

## 📱 Navigation

The dashboard includes a collapsible sidebar with the following sections:

- **Dashboard**: Overview with key metrics and quick actions
- **PR Analysis**: Complete workflow including risk analysis and test recommendations
- **Settings**: Configuration options (coming soon)

## 🎨 UI Components

### PR URL Input with Validation

- Real-time URL validation for GitHub and GitLab
- Visual feedback (green checkmark for valid, red error for invalid)
- Button enabled only when valid URL is entered
- Support for GitHub PRs and GitLab Merge Requests

### Risk Assessment Card

- Large risk score display (0-10 scale)
- Color-coded risk levels:
  - 🔴 High Risk (8.0-10.0)
  - 🟡 Medium Risk (6.0-7.9)
  - 🟢 Low Risk (0-5.9)

### Impacted Modules

- Module cards with risk level indicators
- Dependency information
- File change details

### Integrated Test Recommendations

- **Interactive test type cards** (Unit, Integration, E2E) with click filtering
- **Search functionality** across all recommendations
- **Filter tabs** with real-time counts
- **Expandable test code** with professional syntax highlighting
- **Priority and time estimation** for each recommendation

### Historical Timeline

- Chronological risk analysis
- Visual indicators for risk levels
- Contextual information for each entry

## 📊 Sample Data

The dashboard currently uses hardcoded mock data including:

- **3 sample pull requests** with varying risk scores
- **Complexity metrics** for code analysis
- **3 impacted modules** (Billing Core, Payment API, Customer Service)
- **4 comprehensive test recommendations** across different test types
- **Historical risk data** with timeline entries

## 🔮 Future Enhancements

- **API Integration**: Connect to real backend services
- **Real-time Updates**: Live data synchronization
- **Custom Risk Thresholds**: Configurable risk assessment criteria
- **Export Functionality**: Generate reports and export data
- **User Management**: Role-based access control
- **Integration**: GitHub/GitLab webhook integration

## 🎯 Design Features

- **Streamlined Workflow**: Single-page PR analysis with integrated test recommendations
- **Real-time Validation**: Smart URL validation with helpful error messages
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface using Ant Design
- **Interactive Elements**: Hover effects, animations, and transitions
- **Accessibility**: WCAG-compliant color schemes and navigation
- **Performance**: Optimized React components with efficient rendering

## 🧰 Development Commands

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run test suite
npm run eject      # Eject from Create React App (irreversible)
```

## 🔧 Customization

### Adding New Test Types

1. Update the `TestRecommendation` interface in `src/types/index.ts`
2. Add new mock data in `src/data/mockData.ts`
3. Update the filter logic in `PRAnalysis.tsx`

### Modifying Risk Calculation

1. Update the risk assessment logic in `PRAnalysis.tsx`
2. Adjust color thresholds in the `getRiskColor` function
3. Update complexity metrics in `mockData.ts`

### Custom Styling

- Modify `src/App.css` for global styles
- Update Ant Design theme variables
- Add component-specific styles

## 📝 Notes

- This is a demo version with hardcoded data
- Backend integration points are prepared for future development
- All components are fully typed with TypeScript
- The application is built with scalability and maintainability in mind
- Test recommendations are now fully integrated into the PR analysis workflow

## 🚀 Ready for Production

The dashboard is designed to be easily integrated with real APIs. Key integration points include:

- Pull request data fetching with URL validation
- Risk calculation services
- Test recommendation AI services
- Historical data storage
- User authentication systems

## 🎯 Complete User Workflow

1. **Enter PR URL** (with real-time validation)
2. **Click "Analyze PR"** (enabled only for valid URLs)
3. **View comprehensive analysis**:
   - Risk assessment and complexity metrics
   - Impacted modules analysis
   - Complete test recommendations with search/filter
   - Historical risk timeline

---

Built with ❤️ using React, TypeScript, and Ant Design
