export { default as CandlestickChart } from './components/charts/CandlestickChart.vue';
export { default as LineChart } from './components/charts/LineChart.vue';
export { default as TradingChart } from './components/charts/TradingChart.vue';
export { default as Button } from './components/ui/Button.vue';
export { default as Card } from './components/ui/Card.vue';

export * from './types';
export * from './utils';
export * from './utils/pointRenderers';
export * from './utils/stockData';
export * from './lib/themes';
export * from './lib/utils';

export type {
  PriceData,
  TechnicalIndicator,
  ChartDimensions,
  ChartTheme,
  ChartConfig,
  ChartProps,
  CandlestickProps,
  LineChartProps
} from './types';