# Vue Financial Charts

A comprehensive Vue 3 + Shadcn UI + D3.js financial chart component library for investment industry.

## Features

- **Candlestick Charts**: Professional OHLC candlestick charts with volume support
- **Line Charts**: Clean line charts with optional area fill
- **Technical Analysis**: Built-in technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands)
- **Vue 3 Composition API**: Modern Vue 3 with composition API
- **Shadcn UI Components**: Beautiful, accessible UI components
- **TypeScript Support**: Full TypeScript support with type definitions
- **Interactive Features**: Hover tooltips, click events, crosshair
- **Customizable Themes**: Light, dark, and professional themes
- **Responsive Design**: Adapts to different screen sizes

## Installation

```bash
npm install vue-financial-charts
# or
yarn add vue-financial-charts
```

## Quick Start

```vue
<template>
  <div>
    <CandlestickChart
      :data="chartData"
      :width="800"
      :height="400"
      :show-volume="true"
      :show-grid="true"
      :show-tooltip="true"
      @hover="onHover"
      @click="onClick"
    />
  </div>
</template>

<script setup>
import { CandlestickChart } from 'vue-financial-charts';
import { generateRandomPriceData } from 'vue-financial-charts/utils';

const chartData = generateRandomPriceData(new Date('2023-01-01'), 100, 100);

const onHover = (data) => {
  console.log('Hover:', data);
};

const onClick = (data) => {
  console.log('Click:', data);
};
</script>
```

## Components

### CandlestickChart

Professional candlestick chart for price visualization.

```vue
<CandlestickChart
  :data="data"
  :width="800"
  :height="400"
  :show-volume="true"
  :show-grid="true"
  :show-tooltip="true"
  :candle-width="6"
  :theme="customTheme"
  @hover="onHover"
  @click="onClick"
/>
```

### LineChart

Clean line chart with optional area fill.

```vue
<LineChart
  :data="data"
  :width="800"
  :height="400"
  :stroke-color="'#2196f3'"
  :stroke-width="2"
  :area="true"
  :area-color="'#2196f3'"
  :show-volume="true"
  :show-grid="true"
  :show-tooltip="true"
  @hover="onHover"
  @click="onClick"
/>
```

### UI Components

#### Button

```vue
<Button variant="default" size="default">
  Click me
</Button>
```

#### Card

```vue
<Card>
  <div class="p-4">
    <h2 class="text-xl font-semibold">Card Title</h2>
    <p>Card content</p>
  </div>
</Card>
```

## Technical Indicators

Built-in technical analysis functions:

```javascript
import { 
  calculateSMA, 
  calculateEMA, 
  calculateRSI, 
  calculateMACD, 
  calculateBollingerBands 
} from 'vue-financial-charts/utils';

const sma = calculateSMA(data, 20);
const ema = calculateEMA(data, 12);
const rsi = calculateRSI(data, 14);
const macd = calculateMACD(data);
const bollinger = calculateBollingerBands(data);
```

## Themes

Three built-in themes available:

```vue
<script setup>
import { defaultTheme, darkTheme, professionalTheme } from 'vue-financial-charts/themes';

// Use built-in theme
<CandlestickChart :theme="darkTheme" />

// Create custom theme
const customTheme = {
  background: '#f8f9fa',
  grid: '#dee2e6',
  axis: '#495057',
  text: '#212529',
  upColor: '#28a745',
  downColor: '#dc3545',
  volumeColor: '#6c757d',
  colors: ['#28a745', '#dc3545', '#007bff', '#ffc107', '#6610f2']
};
</script>
```

## Data Format

Expected data format for charts:

```typescript
interface PriceData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}
```

## Props Reference

### Common Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | PriceData[] | [] | Array of price data |
| width | number | 800 | Chart width |
| height | number | 400 | Chart height |
| theme | Partial<ChartTheme> | defaultTheme | Custom theme configuration |
| showVolume | boolean | false | Show volume bars |
| showGrid | boolean | true | Show grid lines |
| showTooltip | boolean | true | Show hover tooltip |
| onHover | (data: PriceData \| null) => void | undefined | Hover callback |
| onClick | (data: PriceData) => void | undefined | Click callback |

### Button Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link' | 'default' | Button variant |
| size | 'default' \| 'sm' \| 'lg' \| 'icon' | 'default' | Button size |
| disabled | boolean | false | Disabled state |

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build library
npm run build:lib

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Examples

Visit the `/examples` directory to see comprehensive usage examples including:
- Interactive theme switching
- Chart controls (volume, grid toggle)
- Technical indicator selection
- Real-time data hover information

## License

MIT