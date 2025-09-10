import * as d3 from 'd3';

interface PriceData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface ChartContext {
  data: PriceData[];
  width: number;
  height: number;
  xScale: any;
  yScale: any;
  theme: any;
}

export function renderVolumeCircles(selection: any, chartContext: ChartContext) {
  // Filter data that has volume information
  const dataWithVolume = chartContext.data.filter(d => d.volume && d.volume > 0);
  
  console.log(`Volume Circles: Processing ${dataWithVolume.length} data points with volume out of ${chartContext.data.length} total`);
  
  if (dataWithVolume.length === 0) {
    console.log('No volume data available for rendering circles');
    return;
  }

  // Calculate volume statistics
  const volumes = dataWithVolume.map(d => d.volume!);
  const volumeExtent = d3.extent(volumes);
  
  console.log(`Volume range: ${volumeExtent[0]?.toLocaleString()} - ${volumeExtent[1]?.toLocaleString()}`);

  // Calculate max radius based on chart dimensions
  const maxRadius = Math.min(chartContext.width, chartContext.height) * 0.04; // 4% of chart size
  
  // Use square root scale for accurate area representation
  const radiusScale = d3.scaleSqrt()
    .domain([volumeExtent[0] || 0, volumeExtent[1] || 1])
    .range([3, maxRadius]); // Minimum radius of 3px for visibility

  // Color scale based on price movement
  const colorScale = (d: PriceData) => {
    return d.close >= d.open ? chartContext.theme.upColor : chartContext.theme.downColor;
  };

  console.log(`Radius scale: ${volumeExtent[0]?.toLocaleString()} -> 3px, ${volumeExtent[1]?.toLocaleString()} -> ${maxRadius.toFixed(1)}px`);

  selection.each(function(d: PriceData) {
    const g = d3.select(this);
    g.selectAll('*').remove(); // Clear existing content

    if (d.volume && d.volume > 0) {
      const radius = radiusScale(d.volume);
      
      console.log(`Rendering circle for ${d.date.toDateString()}: volume=${d.volume.toLocaleString()}, radius=${radius.toFixed(1)}px`);
      
      // Main circle based on volume
      g.append('circle')
        .attr('r', radius)
        .attr('fill', colorScale(d))
        .attr('fill-opacity', 0.6)
        .attr('stroke', 'white')
        .attr('stroke-width', 1);

      // Inner circle for better definition
      g.append('circle')
        .attr('r', Math.max(1, radius * 0.3))
        .attr('fill', 'white')
        .attr('fill-opacity', 0.9);
    } else {
      // Fallback small circle for data points without volume
      g.append('circle')
        .attr('r', 2)
        .attr('fill', colorScale(d))
        .attr('fill-opacity', 0.8);
    }
  });
}

export function renderPriceCircles(selection: any, chartContext: ChartContext) {
  // Calculate radius based on price range
  const priceRange = d3.extent(chartContext.data, d => d.high - d.low);
  const maxRadius = Math.min(chartContext.width, chartContext.height) * 0.03;
  
  const radiusScale = d3.scaleLinear()
    .domain([0, priceRange[1]])
    .range([2, maxRadius]);

  selection.each(function(d: PriceData) {
    const g = d3.select(this);
    g.selectAll('*').remove();

    const radius = radiusScale(d.high - d.low);
    const isUpDay = d.close >= d.open;
    
    // Create gradient based on price movement
    const gradientId = `gradient-${d.date.getTime()}`;
    const defs = g.append('defs');
    
    const gradient = defs.append('radialGradient')
      .attr('id', gradientId)
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', isUpDay ? chartContext.theme.upColor : chartContext.theme.downColor)
      .attr('stop-opacity', 0.8);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', isUpDay ? chartContext.theme.upColor : chartContext.theme.downColor)
      .attr('stop-opacity', 0.3);

    // Main circle
    g.append('circle')
      .attr('r', radius)
      .attr('fill', `url(#${gradientId})`)
      .attr('stroke', isUpDay ? chartContext.theme.upColor : chartContext.theme.downColor)
      .attr('stroke-width', 1);

    // Center dot
    g.append('circle')
      .attr('r', Math.max(1, radius * 0.2))
      .attr('fill', 'white');
  });
}

export function renderCombinedCircles(selection: any, chartContext: ChartContext) {
  const dataWithVolume = chartContext.data.filter(d => d.volume && d.volume > 0);
  
  if (dataWithVolume.length === 0) return;

  const maxRadius = Math.min(chartContext.width, chartContext.height) * 0.05;
  const volumeExtent = d3.extent(dataWithVolume, d => d.volume!);
  const priceRange = d3.extent(chartContext.data, d => d.high - d.low);
  
  const volumeScale = d3.scaleSqrt()
    .domain([0, volumeExtent[1]])
    .range([0, maxRadius * 0.7]);
    
  const priceScale = d3.scaleLinear()
    .domain([0, priceRange[1]])
    .range([maxRadius * 0.3, maxRadius]);

  selection.each(function(d: PriceData) {
    const g = d3.select(this);
    g.selectAll('*').remove();

    const isUpDay = d.close >= d.open;
    const baseRadius = d.volume ? volumeScale(d.volume) : 3;
    const priceRadius = priceScale(d.high - d.low);
    
    // Outer ring for volume
    if (d.volume && d.volume > 0) {
      g.append('circle')
        .attr('r', baseRadius)
        .attr('fill', 'none')
        .attr('stroke', isUpDay ? chartContext.theme.upColor : chartContext.theme.downColor)
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.6);
    }

    // Inner circle for price movement
    g.append('circle')
      .attr('r', Math.min(baseRadius, priceRadius))
      .attr('fill', isUpDay ? chartContext.theme.upColor : chartContext.theme.downColor)
      .attr('fill-opacity', 0.7)
      .attr('stroke', 'white')
      .attr('stroke-width', 1);

    // Center dot
    g.append('circle')
      .attr('r', Math.max(1, Math.min(baseRadius, priceRadius) * 0.3))
      .attr('fill', 'white');
  });
}