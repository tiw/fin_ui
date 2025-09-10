interface PriceData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export function generateRandomPriceData(
  startDate: Date,
  days: number,
  startPrice: number = 100
): PriceData[] {
  const data: PriceData[] = [];
  let currentPrice = startPrice;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const change = (Math.random() - 0.5) * 4;
    const volatility = 0.02;
    
    const open = currentPrice;
    const close = open * (1 + change * volatility);
    const high = Math.max(open, close) * (1 + Math.random() * volatility);
    const low = Math.min(open, close) * (1 - Math.random() * volatility);
    const volume = Math.floor(Math.random() * 1000000) + 100000;
    
    data.push({
      date,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume
    });
    
    currentPrice = close;
  }
  
  return data;
}

export function sortPriceData(data: PriceData[]): PriceData[] {
  return [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function filterPriceDataByDateRange(
  data: PriceData[],
  startDate: Date,
  endDate: Date
): PriceData[] {
  return data.filter(d => d.date >= startDate && d.date <= endDate);
}

export function aggregatePriceData(
  data: PriceData[],
  period: 'day' | 'week' | 'month' = 'day'
): PriceData[] {
  if (period === 'day') return data;
  
  const aggregated: PriceData[] = [];
  const grouped = new Map<string, PriceData[]>();
  
  data.forEach(item => {
    const key = getPeriodKey(item.date, period);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(item);
  });
  
  grouped.forEach(group => {
    if (group.length === 0) return;
    
    const first = group[0];
    const last = group[group.length - 1];
    
    const open = first.open;
    const close = last.close;
    const high = Math.max(...group.map(d => d.high));
    const low = Math.min(...group.map(d => d.low));
    const volume = group.reduce((sum, d) => sum + (d.volume || 0), 0);
    const date = last.date;
    
    aggregated.push({
      date,
      open,
      high,
      low,
      close,
      volume
    });
  });
  
  return aggregated.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function getPeriodKey(date: Date, period: 'week' | 'month'): string {
  const year = date.getFullYear();
  if (period === 'week') {
    const week = getWeekNumber(date);
    return `${year}-W${week}`;
  } else {
    const month = date.getMonth() + 1;
    return `${year}-M${month}`;
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}