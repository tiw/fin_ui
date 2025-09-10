interface PriceData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export function parseCSVData(csvContent: string): PriceData[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      date: new Date(values[0]),
      open: parseFloat(values[1]),
      high: parseFloat(values[2]),
      low: parseFloat(values[3]),
      close: parseFloat(values[4]),
      volume: parseFloat(values[5])
    };
  }).filter(data => !isNaN(data.open) && !isNaN(data.close));
}

export async function loadStockData(symbol: string): Promise<PriceData[]> {
  try {
    const response = await fetch(`/stock_data/${symbol}_daily_data.csv`);
    if (!response.ok) {
      throw new Error(`Failed to load ${symbol} data`);
    }
    const csvContent = await response.text();
    return parseCSVData(csvContent);
  } catch (error) {
    console.error(`Error loading ${symbol} data:`, error);
    return [];
  }
}

export function getAvailableStocks(): string[] {
  return ['AAPL', 'AMZN', 'GOOGL', 'META', 'MSFT', 'NVDA', 'TSLA'];
}

export function getStockName(symbol: string): string {
  const names: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'AMZN': 'Amazon.com Inc.',
    'GOOGL': 'Alphabet Inc.',
    'META': 'Meta Platforms Inc.',
    'MSFT': 'Microsoft Corporation',
    'NVDA': 'NVIDIA Corporation',
    'TSLA': 'Tesla Inc.'
  };
  return names[symbol] || symbol;
}