<template>
  <div id="app">
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold mb-6">Vue Financial Charts Demo</h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <div class="p-4">
            <h2 class="text-xl font-semibold mb-4">Theme Selector</h2>
            <div class="flex gap-2">
              <Button 
                v-for="theme in Object.keys(themes)" 
                :key="theme"
                @click="currentTheme = theme"
                :variant="currentTheme === theme ? 'default' : 'outline'"
              >
                {{ theme }}
              </Button>
            </div>
          </div>
        </Card>
        
        <Card>
          <div class="p-4">
            <h2 class="text-xl font-semibold mb-4">Chart Controls</h2>
            <div class="flex gap-2 flex-wrap">
              <Button @click="toggleVolume" :variant="showVolume ? 'default' : 'outline'">
                Volume
              </Button>
              <Button @click="toggleGrid" :variant="showGrid ? 'default' : 'outline'">
                Grid
              </Button>
              <Button @click="regenerateData">
                New Data
              </Button>
            </div>
          </div>
        </Card>
        
        <Card>
          <div class="p-4">
            <h2 class="text-xl font-semibold mb-4">Point Renderer</h2>
            <div class="flex gap-2 flex-wrap">
              <Button 
                v-for="renderer in availablePointRenderers" 
                :key="renderer"
                @click="pointRendererType = renderer"
                :variant="pointRendererType === renderer ? 'default' : 'outline'"
                size="sm"
              >
                {{ renderer }}
              </Button>
            </div>
          </div>
        </Card>
        
        <Card>
          <div class="p-4">
            <h2 class="text-xl font-semibold mb-4">Stock Selection</h2>
            <div class="flex gap-2 flex-wrap items-center">
              <Button 
                v-for="stock in availableStocks" 
                :key="stock"
                @click="selectedStock = stock"
                :variant="selectedStock === stock ? 'default' : 'outline'"
                size="sm"
              >
                {{ stock }}
              </Button>
              <div v-if="isLoading" class="ml-4 text-sm text-gray-600">
                Loading {{ selectedStock }} data...
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div class="space-y-8">
        <Card>
          <div class="p-4">
            <h2 class="text-xl font-semibold mb-4">Candlestick Chart</h2>
            <CandlestickChart
              :data="chartData"
              :width="800"
              :height="400"
              :theme="themes[currentTheme]"
              :show-volume="showVolume"
              :show-grid="showGrid"
              :show-tooltip="true"
              @hover="onHover"
              @click="onClick"
            />
          </div>
        </Card>

        <Card>
          <div class="p-4">
            <h2 class="text-xl font-semibold mb-4">Line Chart with Area</h2>
            <LineChart
              :data="chartData"
              :width="800"
              :height="400"
              :theme="themes[currentTheme]"
              :show-volume="showVolume"
              :show-grid="showGrid"
              :show-tooltip="true"
              stroke-color="#2196f3"
              :stroke-width="2"
              :area="true"
              area-color="#2196f3"
              @hover="onHover"
              @click="onClick"
            />
          </div>
        </Card>

        <Card>
          <div class="p-4">
            <h2 class="text-xl font-semibold mb-4">
              {{ getStockName(selectedStock) }} ({{ selectedStock }}) - Trading Chart with Volume Circles
            </h2>
            <TradingChart
              :data="chartData"
              :width="800"
              :height="450"
              :theme="themes[currentTheme]"
              :show-volume="showVolume"
              :show-grid="showGrid"
              :show-tooltip="true"
              :point-renderer="currentPointRenderer"
              @hover="onHover"
              @click="onClick"
            />
          </div>
        </Card>

        <Card>
          <div class="p-4">
            <h2 class="text-xl font-semibold mb-4">Technical Analysis</h2>
            <div class="mb-4">
              <h3 class="text-lg font-medium mb-2">Indicators</h3>
              <div class="flex gap-2">
                <Button 
                  v-for="indicator in availableIndicators" 
                  :key="indicator"
                  @click="toggleIndicator(indicator)"
                  :variant="activeIndicators.includes(indicator) ? 'default' : 'outline'"
                  size="sm"
                >
                  {{ indicator }}
                </Button>
              </div>
            </div>
            <div class="bg-gray-100 p-4 rounded">
              <pre class="text-sm overflow-x-auto">{{ hoveredData || 'Hover over chart to see data' }}</pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { CandlestickChart, LineChart, TradingChart, Button, Card } from '../src';
import { generateRandomPriceData, calculateSMA, calculateRSI, calculateMACD } from '../src/utils';
import { renderVolumeCircles, renderPriceCircles, renderCombinedCircles } from '../src/utils/pointRenderers';
import { loadStockDataWithVolume, getAvailableStocks, getStockName } from '../src/utils/stockData';
import { themes } from '../src/lib/themes';
interface PriceData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

const currentTheme = ref('default');
const showVolume = ref(true);
const showGrid = ref(true);
const hoveredData = ref<any>(null);
const activeIndicators = ref<string[]>([]);
const pointRendererType = ref('volume-circles');
const selectedStock = ref('AAPL');
const isLoading = ref(false);

const availableIndicators = ['SMA(20)', 'RSI(14)', 'MACD'];
const availablePointRenderers = ['default', 'volume-circles', 'price-circles', 'combined-circles'];
const availableStocks = getAvailableStocks();

const currentPointRenderer = computed(() => {
  switch (pointRendererType.value) {
    case 'volume-circles':
      return renderVolumeCircles;
    case 'price-circles':
      return renderPriceCircles;
    case 'combined-circles':
      return renderCombinedCircles;
    default:
      return undefined;
  }
});

const chartData = ref<PriceData[]>([]);

const loadSelectedStockData = async () => {
  isLoading.value = true;
  try {
    const data = await loadStockDataWithVolume(selectedStock.value);
    // Sort by date and take last 200 data points for better visualization
    chartData.value = data
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-200);
    
    console.log(`Loaded ${data.length} data points for ${selectedStock.value}`);
    const volumeCount = data.filter(d => d.volume && d.volume > 0).length;
    console.log(`Volume data available for ${volumeCount} points`);
    
    if (volumeCount > 0) {
      const volumes = data.filter(d => d.volume).map(d => d.volume!);
      const minVol = Math.min(...volumes);
      const maxVol = Math.max(...volumes);
      console.log(`Volume range: ${minVol.toLocaleString()} - ${maxVol.toLocaleString()}`);
    }
  } catch (error) {
    console.error('Error loading stock data:', error);
    // Fallback to generated data
    chartData.value = generateRandomPriceData(new Date('2023-01-01'), 100, 100);
  } finally {
    isLoading.value = false;
  }
};

const regenerateData = () => {
  // This now reloads the stock data instead of generating random data
  loadSelectedStockData();
};

const toggleVolume = () => {
  showVolume.value = !showVolume.value;
};

const toggleGrid = () => {
  showGrid.value = !showGrid.value;
};

const toggleIndicator = (indicator: string) => {
  const index = activeIndicators.value.indexOf(indicator);
  if (index > -1) {
    activeIndicators.value.splice(index, 1);
  } else {
    activeIndicators.value.push(indicator);
  }
};

const onHover = (data: PriceData | null) => {
  if (data) {
    hoveredData.value = {
      date: data.date.toLocaleDateString(),
      open: data.open.toFixed(2),
      high: data.high.toFixed(2),
      low: data.low.toFixed(2),
      close: data.close.toFixed(2),
      volume: data.volume ? data.volume.toLocaleString() : 'N/A'
    };
  } else {
    hoveredData.value = null;
  }
};

const onClick = (data: PriceData) => {
  console.log('Chart clicked:', data);
};

// Load initial data
loadSelectedStockData();

// Watch for stock selection changes
watch(selectedStock, () => {
  loadSelectedStockData();
});
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  opacity: 0;
  z-index: 1000;
}

.container {
  max-width: 1200px;
}
</style>