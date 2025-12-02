# StockSense AI - Design Guidelines

## Design Approach

**Reference-Based: Modern Fintech Aesthetic**
Drawing inspiration from Robinhood's clean interface, Stripe's dashboard clarity, and TradingView's data-dense layouts. The design prioritizes readability, quick data scanning, and professional presentation of financial information.

**Core Principles:**
- Data-first presentation with clear visual hierarchy
- Dark-themed interface optimized for extended viewing sessions
- Card-based modular layout for distinct content sections
- Minimal animation to maintain professional credibility

---

## Typography

**Font Stack:**
- Primary: Inter (via Google Fonts) - clean, modern sans-serif for UI
- Monospace: JetBrains Mono - for numerical data, tickers, prices

**Hierarchy:**
- Page Titles: 2xl (24px), font-semibold (600)
- Section Headers: xl (20px), font-semibold (600)  
- Card Titles: base (16px), font-semibold (600)
- Body Text: sm (14px), font-normal (400)
- Metadata/Labels: xs (12px), font-medium (500)
- Numbers/Metrics: base-lg (16-18px), font-mono, font-semibold (600)

---

## Layout System

**Spacing Units:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Card padding: p-6
- Section spacing: mb-12
- Component gaps: gap-4 to gap-6
- Container max-width: max-w-7xl

**Grid System:**
- Sentiment Heatmap: 5 equal columns (grid-cols-5)
- News Cards: 3 columns on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Metrics Display: 3 columns (grid-cols-3)
- Technical Indicators: 2-3 columns (grid-cols-2 lg:grid-cols-3)

---

## Component Library

### 1. Market Sentiment Cards
Compact square cards displaying index name and percentage change with status indicators (🟢/🔴/🟡). Include subtle shadow and rounded-2xl corners.

### 2. News Cards
Premium card design with:
- Full-width image at top (16:9 aspect ratio)
- Content section with p-6 padding
- Title: 3-4 line clamp
- Badge row with category, sentiment, and timestamp badges
- "Read more →" link at bottom
- Hover: Subtle lift effect (translate-y-1) with enhanced shadow

### 3. Chat Interface
Conversation bubbles alternating alignment:
- User messages: align-right, darker background
- AI messages: align-left, slightly lighter background
- Maximum width: 900px centered
- Suggested prompts: Grid of 3 columns with clickable cards

### 4. Stock Metrics Cards
Clean metric display:
- Label above value
- Large numerical value in monospace font
- Optional change indicator (+/- with appropriate indicator)

### 5. Technical Indicators Panel
Grid layout showcasing:
- SMA 50/200 values
- Volatility percentage
- Momentum (ROC)
- Relative Strength
Use consistent metric card format with subtle borders

### 6. Chart Display
Full-width line chart container with:
- Rounded corners (rounded-xl)
- Padding: p-6
- Background slightly lighter than page background
- Responsive height (h-64 to h-96)

### 7. Badge System
Compact labels with:
- Padding: px-3 py-1
- Rounded-full or rounded-lg
- Font: text-xs font-semibold
- Types: Category (neutral), Sentiment (dynamic), Timestamp (muted)

### 8. Form Elements
- Stock ticker input: Large, prominent with search icon
- Chat input: Multi-line textarea with send button
- All inputs: rounded-lg with focus rings

### 9. Action Buttons
- Primary CTA: Solid with hover brightness change
- Secondary: Outlined or ghost style
- Download PDF: Icon + text combination
- Submit/Send: Prominent in chat interface

---

## Interactions & States

**Hover Effects:**
- News cards: -translate-y-1 + shadow-xl
- Suggested prompts: slight brightness increase
- Buttons: brightness increase, no background blur needed

**Loading States:**
- Skeleton screens for news cards
- Spinner for chat responses
- Shimmer effect for loading metrics

**NO animations for:**
- Chart rendering (instant display)
- Page transitions
- Scrolling effects
- Background movements

---

## Page Layout Structure

### Header
Centered logo/title "StockSense AI" with tagline, subtle gradient underline

### Market Sentiment Heatmap
Full-width section with 5-column grid, each card showing index performance

### Market News Section  
Section header + 3-column responsive grid of premium news cards (2 rows = 6 cards)

### AI Chatbot Section
- Section header "StockSense AI Chatbot"
- Suggested prompts grid (3 columns)
- Chat history container (max-w-3xl centered)
- Input form at bottom

### Quick Stock Lookup
- Ticker input field
- Price chart visualization
- 3-column metrics grid (Price, Market Cap, P/E Ratio)
- Technical indicators sub-section with 2-3 column grid

### PDF Export
Simple section with download button, centered

### Footer
Minimal with legal links, centered text

---

## Images

**No hero image required** - this is a functional dashboard prioritizing data over marketing imagery.

**News Card Images:**
- Source: News API provides urlToImage
- Fallback: Placeholder with gradient background + icon
- Treatment: Full-width at top of card, 16:9 aspect ratio, object-cover

**Chart Visualizations:**
- Use Recharts or Chart.js for line charts
- Clean, minimal styling matching dark theme
- Grid lines subtle, no heavy decorations

---

## Responsive Behavior

**Mobile (< 768px):**
- Sentiment heatmap: Stack to 2 columns
- News cards: Single column
- Metrics: Single column or 2-column
- Chat: Full-width messages

**Tablet (768px - 1024px):**
- Sentiment: 3-2 column split
- News: 2 columns
- Maintain card-based structure

**Desktop (> 1024px):**
- Full multi-column layouts as specified
- Max container width: 1280px (max-w-7xl)