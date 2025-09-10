export interface PriceData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface TechnicalIndicator {
  name: string;
  data: number[];
  color: string;
}

export interface ChartDimensions {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ChartTheme {
  background: string;
  grid: string;
  axis: string;
  text: string;
  upColor: string;
  downColor: string;
  volumeColor: string;
  colors: string[];
}

export interface ChartConfig {
  dimensions: ChartDimensions;
  theme: ChartTheme;
  data: PriceData[];
  indicators?: TechnicalIndicator[];
  showVolume?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
}

export interface ChartProps {
  data: PriceData[];
  width?: number;
  height?: number;
  theme?: Partial<ChartTheme>;
  showVolume?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  onHover?: (data: PriceData | null) => void;
  onClick?: (data: PriceData) => void;
}

export interface CandlestickProps extends ChartProps {
  candleWidth?: number;
}

export interface LineChartProps extends ChartProps {
  strokeColor?: string;
  strokeWidth?: number;
  area?: boolean;
  areaColor?: string;
}