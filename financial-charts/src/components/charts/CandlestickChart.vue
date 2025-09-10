<template>
  <div class="relative">
    <svg ref="chartRef" :width="width" :height="height" :style="{ background: mergedTheme.background }" />
    <div ref="tooltipRef" class="tooltip" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import * as d3 from 'd3';
interface PriceData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface CandlestickProps {
  data: PriceData[];
  width?: number;
  height?: number;
  theme?: any;
  showVolume?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  candleWidth?: number;
  onHover?: (data: PriceData | null) => void;
  onClick?: (data: PriceData) => void;
}

interface ChartTheme {
  background: string;
  grid: string;
  axis: string;
  text: string;
  upColor: string;
  downColor: string;
  volumeColor: string;
  colors: string[];
}
import { defaultTheme } from '../../lib/themes';
import { useChart, useDimensions, useScales } from '../../composables/useChart';
import { isUpDay, formatDate, formatNumber, formatVolume } from '../../utils';

interface Props extends CandlestickProps {}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 400,
  showVolume: false,
  showGrid: true,
  showTooltip: true,
  candleWidth: 6
});

const emit = defineEmits<{
  hover: [data: PriceData | null];
  click: [data: PriceData];
}>();

const { chartRef, tooltipRef, createTooltip, showTooltip, hideTooltip } = useChart();
const { dimensions, chartWidth, chartHeight } = useDimensions(props.width, props.height);

const mergedTheme = { ...defaultTheme, ...props.theme };

const renderChart = () => {
  if (!chartRef.value || props.data.length === 0) return;

  const svg = d3.select(chartRef.value);
  svg.selectAll('*').remove();

  const { xScale, yScale } = useScales(props.data, dimensions);
  
  const volumeHeight = props.showVolume ? 100 : 0;
  const mainChartHeight = chartHeight - volumeHeight;

  const mainG = svg.append('g')
    .attr('transform', `translate(${dimensions.margin.left},${dimensions.margin.top})`);

  if (props.showGrid) {
    mainG.append('g')
      .attr('class', 'grid')
      .attr('stroke', mergedTheme.grid)
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '2,2')
      .call(d3.axisBottom(xScale)
        .tickSize(-mainChartHeight)
        .tickFormat('' as any));

    mainG.append('g')
      .attr('class', 'grid')
      .attr('stroke', mergedTheme.grid)
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '2,2')
      .call(d3.axisLeft(yScale)
        .tickSize(-chartWidth)
        .tickFormat('' as any));
  }

  mainG.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${mainChartHeight})`)
    .call(d3.axisBottom(xScale))
    .attr('color', mergedTheme.axis);

  mainG.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale))
    .attr('color', mergedTheme.axis);

  const candleWidthScaled = Math.min(props.candleWidth, chartWidth / props.data.length * 0.8);

  const candles = mainG.selectAll('.candle')
    .data(props.data)
    .enter()
    .append('g')
    .attr('class', 'candle')
    .attr('transform', d => `translate(${xScale(d.date)},0)`);

  candles.append('line')
    .attr('class', 'wick')
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', d => yScale(d.high))
    .attr('y2', d => yScale(d.low))
    .attr('stroke', d => isUpDay(d) ? mergedTheme.upColor : mergedTheme.downColor)
    .attr('stroke-width', 1);

  candles.append('rect')
    .attr('class', 'body')
    .attr('x', -candleWidthScaled / 2)
    .attr('y', d => yScale(Math.max(d.open, d.close)))
    .attr('width', candleWidthScaled)
    .attr('height', d => Math.abs(yScale(d.open) - yScale(d.close)))
    .attr('fill', d => isUpDay(d) ? mergedTheme.upColor : mergedTheme.downColor)
    .attr('stroke', d => isUpDay(d) ? mergedTheme.upColor : mergedTheme.downColor)
    .attr('stroke-width', 1);

  if (props.showVolume && props.data.some(d => d.volume)) {
    const yVolume = d3.scaleLinear()
      .domain([0, d3.max(props.data, d => d.volume || 0)!])
      .range([volumeHeight, 0]);

    const volumeG = svg.append('g')
      .attr('transform', `translate(${dimensions.margin.left},${dimensions.height - dimensions.margin.bottom - volumeHeight})`);

    volumeG.selectAll('.volume-bar')
      .data(props.data)
      .enter()
      .append('rect')
      .attr('class', 'volume-bar')
      .attr('x', d => xScale(d.date) - candleWidthScaled / 2)
      .attr('y', d => yVolume(d.volume || 0))
      .attr('width', candleWidthScaled)
      .attr('height', d => volumeHeight - yVolume(d.volume || 0))
      .attr('fill', d => isUpDay(d) ? mergedTheme.upColor : mergedTheme.downColor)
      .attr('opacity', 0.7);
  }

  if (props.showTooltip) {
    createTooltip();

    candles
      .on('mouseover', (event, d) => {
        const content = `
          <div>Date: ${formatDate(d.date)}</div>
          <div>Open: ${formatNumber(d.open)}</div>
          <div>High: ${formatNumber(d.high)}</div>
          <div>Low: ${formatNumber(d.low)}</div>
          <div>Close: ${formatNumber(d.close)}</div>
          ${d.volume ? `<div>Volume: ${formatVolume(d.volume)}</div>` : ''}
        `;
        showTooltip(content, event.pageX, event.pageY);
        emit('hover', d);
      })
      .on('mouseout', () => {
        hideTooltip();
        emit('hover', null);
      })
      .on('click', (event, d) => {
        emit('click', d);
      });
  }
};

onMounted(() => {
  renderChart();
});

watch(() => [props.data, props.width, props.height, props.theme], () => {
  renderChart();
}, { deep: true });
</script>