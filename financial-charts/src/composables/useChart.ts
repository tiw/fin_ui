import { ref, onMounted, onUnmounted } from 'vue';
import * as d3 from 'd3';

export function useChart() {
  const chartRef = ref<SVGSVGElement | null>(null);
  const tooltipRef = ref<HTMLDivElement | null>(null);

  const createTooltip = () => {
    if (!tooltipRef.value) return;
    
    return d3.select(tooltipRef.value)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0);
  };

  const showTooltip = (content: string, x: number, y: number) => {
    if (!tooltipRef.value) return;
    
    d3.select(tooltipRef.value)
      .html(content)
      .style('left', `${x + 10}px`)
      .style('top', `${y - 10}px`)
      .style('opacity', 1);
  };

  const hideTooltip = () => {
    if (!tooltipRef.value) return;
    
    d3.select(tooltipRef.value).style('opacity', 0);
  };

  return {
    chartRef,
    tooltipRef,
    createTooltip,
    showTooltip,
    hideTooltip
  };
}

export function useScales(data: any[], dimensions: any) {
  const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([dimensions.margin.left, dimensions.width - dimensions.margin.right]);

  const yScale = d3.scaleLinear()
    .domain([
      d3.min(data, d => d.low) * 0.95,
      d3.max(data, d => d.high) * 1.05
    ])
    .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top]);

  return { xScale, yScale };
}

export function useDimensions(width: number, height: number) {
  const dimensions = {
    width,
    height,
    margin: {
      top: 20,
      right: 20,
      bottom: 40,
      left: 60
    }
  };

  const chartWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
  const chartHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  return { dimensions, chartWidth, chartHeight };
}