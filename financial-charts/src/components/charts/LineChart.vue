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

interface LineChartProps {
  data: PriceData[];
  width?: number;
  height?: number;
  theme?: any;
  showVolume?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  area?: boolean;
  areaColor?: string;
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
import { formatDate, formatNumber, formatVolume } from '../../utils';

interface Props extends LineChartProps {}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 400,
  showVolume: false,
  showGrid: true,
  showTooltip: true,
  strokeColor: '#2196f3',
  strokeWidth: 2,
  area: false,
  areaColor: '#2196f3'
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

  const line = d3.line<PriceData>()
    .x(d => xScale(d.date))
    .y(d => yScale(d.close))
    .curve(d3.curveMonotoneX);

  const areaGenerator = d3.area<PriceData>()
    .x(d => xScale(d.date))
    .y0(mainChartHeight)
    .y1(d => yScale(d.close))
    .curve(d3.curveMonotoneX);

  if (props.area) {
    mainG.append('path')
      .datum(props.data)
      .attr('class', 'area')
      .attr('fill', props.areaColor)
      .attr('fill-opacity', 0.3)
      .attr('d', areaGenerator);
  }

  mainG.append('path')
    .datum(props.data)
    .attr('class', 'line')
    .attr('fill', 'none')
    .attr('stroke', props.strokeColor)
    .attr('stroke-width', props.strokeWidth)
    .attr('d', line);

  mainG.selectAll('.dot')
    .data(props.data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', d => xScale(d.date))
    .attr('cy', d => yScale(d.close))
    .attr('r', 3)
    .attr('fill', props.strokeColor)
    .style('opacity', 0)
    .on('mouseover', function() {
      d3.select(this).style('opacity', 1);
    })
    .on('mouseout', function() {
      d3.select(this).style('opacity', 0);
    });

  if (props.showVolume && props.data.some(d => d.volume)) {
    const yVolume = d3.scaleLinear()
      .domain([0, d3.max(props.data, d => d.volume || 0)!])
      .range([volumeHeight, 0]);

    const volumeG = svg.append('g')
      .attr('transform', `translate(${dimensions.margin.left},${dimensions.height - dimensions.margin.bottom - volumeHeight})`);

    const volumeLine = d3.line<PriceData>()
      .x(d => xScale(d.date))
      .y(d => yVolume(d.volume || 0))
      .curve(d3.curveMonotoneX);

    volumeG.append('path')
      .datum(props.data)
      .attr('class', 'volume-line')
      .attr('fill', 'none')
      .attr('stroke', mergedTheme.volumeColor)
      .attr('stroke-width', 1)
      .attr('d', volumeLine);
  }

  if (props.showTooltip) {
    createTooltip();

    const focus = mainG.append('g')
      .attr('class', 'focus')
      .style('display', 'none');

    focus.append('line')
      .attr('class', 'focus-line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', mainChartHeight)
      .attr('stroke', mergedTheme.axis)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    focus.append('circle')
      .attr('class', 'focus-circle')
      .attr('r', 4)
      .attr('fill', props.strokeColor)
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', chartWidth)
      .attr('height', mainChartHeight)
      .attr('transform', `translate(${dimensions.margin.left},${dimensions.margin.top})`)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => {
        focus.style('display', 'none');
        hideTooltip();
        emit('hover', null);
      })
      .on('mousemove', (event) => {
        const [mouseX] = d3.pointer(event, svg.node());
        const x0 = xScale.invert(mouseX - dimensions.margin.left);
        const bisect = d3.bisector((d: PriceData) => d.date).left;
        const index = bisect(props.data, x0, 1);
        const d0 = props.data[index - 1];
        const d1 = props.data[index];
        const d = x0 - d0.date > d1.date - x0 ? d1 : d0;

        focus.attr('transform', `translate(${xScale(d.date)},0)`);
        focus.select('.focus-circle').attr('cy', yScale(d.close));

        const content = `
          <div>Date: ${formatDate(d.date)}</div>
          <div>Price: ${formatNumber(d.close)}</div>
          ${d.volume ? `<div>Volume: ${formatVolume(d.volume)}</div>` : ''}
        `;
        showTooltip(content, event.pageX, event.pageY);
        emit('hover', d);
      })
      .on('click', (event) => {
        const [mouseX] = d3.pointer(event, svg.node());
        const x0 = xScale.invert(mouseX - dimensions.margin.left);
        const bisect = d3.bisector((d: PriceData) => d.date).left;
        const index = bisect(props.data, x0, 1);
        const d0 = props.data[index - 1];
        const d1 = props.data[index];
        const d = x0 - d0.date > d1.date - x0 ? d1 : d0;

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