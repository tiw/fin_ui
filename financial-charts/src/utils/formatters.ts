interface PriceData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

export function formatVolume(volume: number): string {
  if (volume >= 1e9) {
    return (volume / 1e9).toFixed(2) + 'B';
  } else if (volume >= 1e6) {
    return (volume / 1e6).toFixed(2) + 'M';
  } else if (volume >= 1e3) {
    return (volume / 1e3).toFixed(2) + 'K';
  }
  return volume.toString();
}

export function formatPercent(value: number): string {
  return (value * 100).toFixed(2) + '%';
}

export function isUpDay(data: PriceData): boolean {
  return data.close >= data.open;
}

export function calculateChange(data: PriceData[]): number {
  if (data.length < 2) return 0;
  const first = data[0].close;
  const last = data[data.length - 1].close;
  return ((last - first) / first) * 100;
}

export function calculateRange(data: PriceData[]): { min: number; max: number } {
  if (data.length === 0) return { min: 0, max: 0 };
  
  const lows = data.map(d => d.low);
  const highs = data.map(d => d.high);
  
  return {
    min: Math.min(...lows),
    max: Math.max(...highs)
  };
}

export function calculateVolumeRange(data: PriceData[]): { min: number; max: number } {
  const volumes = data.filter(d => d.volume !== undefined).map(d => d.volume!);
  if (volumes.length === 0) return { min: 0, max: 0 };
  
  return {
    min: Math.min(...volumes),
    max: Math.max(...volumes)
  };
}