import Box from '@mui/material/Box';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ScriptableContext,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { externalTooltipHandler } from './utils';
import { useMemo, useRef } from 'react';
import { LineChartProps } from '../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface Chart extends ChartJS {
  corsair: {
    x: number;
    y: number;
    draw?: boolean;
  };
}

function LineChart(props: LineChartProps) {
  const { idTooltip = '', labels, datasets } = props;
  const chartRef = useRef();
  const options = useMemo(
    () =>
      ({
        maintainAspectRatio: false,
        responsive: true,
        events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
        plugins: {
          legend: {
            display: false,
          },
          filler: {
            propagate: false,
          },
          title: {
            display: false,
            text: '',
          },
          tooltip: {
            mode: 'nearest',
            axis: 'xy',
            intersect: false,
            position: 'nearest',
            enabled: true,
            yAlign: 'bottom',
            displayColors: false,
            callbacks: {
              label: (tooltipItem: ScriptableContext<'line'>) => {
                const { dataIndex, dataset } = tooltipItem;
                const total = datasets.reduce((acc, item) => acc + item.data[dataIndex], 0);
                return `${dataset?.label}: ${((Number(dataset.data[dataIndex]) / total) * 100).toFixed(2)}%`;
              },
              footer: (tooltipItems: ScriptableContext<'line'>[]) => {
                const { dataIndex } = tooltipItems[0];
                const total = datasets.reduce((acc, item) => acc + item.data[dataIndex], 0);
                return `Total: ${total}`;
              },
            },
            external: externalTooltipHandler(idTooltip),
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              display: true,
            },
            border: {
              display: false,
            },
          },
          y: {
            grid: {
              drawTicks: false,
            },
            min: 0,
            ticks: {
              stepSize: 500,
            },
            border: {
              display: false,
            },
          },
        },
        elements: {
          arc: {
            borderWidth: 0,
          },
          point: {
            radius: 0,
            borderRadius: 0,
            hoverRadius: 6,
            hoverBorderWidth: 3,
          },
        },
        hover: {
          mode: 'nearest',
          intersect: false,
        },
      }) as any,
    [],
  );

  const plugin = useMemo(
    () => ({
      id: 'corsair',
      defaults: {
        width: 1,
        color: '#A1A9B5',
        dash: [4, 4],
      },
      afterInit: (chart: Chart) => {
        // eslint-disable-next-line no-param-reassign
        chart.corsair = {
          x: 0,
          y: 0,
        };
      },
      afterEvent: (chart: Chart, args: any) => {
        const { inChartArea, event } = args;
        const { x, y } = args.event;
        // eslint-disable-next-line no-param-reassign
        chart.corsair = { x, y, draw: inChartArea };
        chart.draw();

        if (event.type === 'mouseout') {
          const modal = document.getElementById(idTooltip);
          if (modal && !modal.matches(':hover') && modal?.firstElementChild) {
            modal.firstElementChild.remove();
          }
        }
      },
      beforeDatasetsDraw: (chart: Chart, args: any, opts: any) => {
        const { ctx } = chart;
        const { top, bottom, left, right } = chart.chartArea;
        const { x, y, draw } = chart.corsair;
        if (!draw) return;

        ctx.save();

        ctx.beginPath();
        ctx.lineWidth = opts.width;
        ctx.strokeStyle = opts.color;
        ctx.setLineDash(opts.dash);
        ctx.moveTo(x, bottom);
        ctx.lineTo(x, top);
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
        ctx.stroke();

        ctx.restore();
      },
    }),
    [],
  );

  return (
    <Box
      sx={{
        minHeight: 360,
        width: '100%',
      }}
    >
      <Line
        ref={chartRef}
        options={options}
        data={{
          labels: labels,
          datasets: datasets,
        }}
        plugins={[plugin]}
      />
    </Box>
  );
}

export default LineChart;
