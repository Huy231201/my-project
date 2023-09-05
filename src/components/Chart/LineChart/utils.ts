import { ScriptableTooltipContext } from 'chart.js';

interface ChartInfo {
  title?: string;
  description?: string;
}

export const externalTooltipHandler =
  (idTooltip: string, chartInfo: ChartInfo) => (context: ScriptableTooltipContext<'line'>) => {
    const { title: chartTitle = '', description = '' } = chartInfo;

    const { tooltip, chart } = context;
    const { datasets } = chart.data;
    const dataPoints = tooltip.dataPoints || [];
    const dataIndex = dataPoints[0]?.dataIndex;
    const title = dataPoints[0]?.label;

    const total = datasets.reduce((acc, item) => acc + Number(item.data[dataIndex] || 0), 0);

    const modal = document.getElementById(idTooltip);
    if (modal && tooltip.body) {
      while (modal?.firstChild) {
        modal.firstChild.remove();
      }

      const container = document.createElement('div');
      container.style.minWidth = '200px';
      container.style.position = 'fixed';
      container.style.right = '0';
      container.style.bottom = '0';
      container.style.color = 'white';
      container.style.background = 'rgba(0, 0, 0, 0.7)';
      container.style.borderTopLeftRadius = '8px';
      container.style.padding = '6px 12px';

      const table = document.createElement('table');
      const tableBody = document.createElement('tbody');

      if (chartTitle) {
        const tableHeadTitle = document.createElement('thead');
        const tableHeadTitleRow = document.createElement('tr');
        const tableHeadDataTitle = document.createElement('th');
        tableHeadDataTitle.style.textAlign = 'left';
        tableHeadDataTitle.colSpan = 4;
        tableHeadDataTitle.innerText = chartTitle;
        tableHeadTitleRow.appendChild(tableHeadDataTitle);
        tableHeadTitle.appendChild(tableHeadTitleRow);
        table.appendChild(tableHeadTitle);
      }

      if (description) {
        const tableDescriptionRow = document.createElement('tr');
        const tableDescriptionData = document.createElement('td');
        tableDescriptionData.style.textAlign = 'left';
        tableDescriptionData.colSpan = 4;
        tableDescriptionData.innerText = description;
        tableDescriptionRow.appendChild(tableDescriptionData);
        tableBody.appendChild(tableDescriptionRow);
      }

      const tableDateRow = document.createElement('tr');
      const tableDateData = document.createElement('td');
      tableDateData.style.textAlign = 'left';
      tableDateData.colSpan = 4;
      tableDateData.style.paddingBottom = '8px';
      tableDateData.innerText = title;
      tableDateRow.appendChild(tableDateData);

      tableBody.appendChild(tableDateRow);

      datasets.forEach((point: any) => {
        const tr = document.createElement('tr');
        tr.style.backgroundColor = 'inherit';

        const td1 = document.createElement('td');
        const span1 = document.createElement('span');
        span1.style.background = point.borderColor;
        span1.style.height = '12px';
        span1.style.width = '12px';
        span1.style.display = 'inline-block';
        td1.appendChild(span1);

        const td2 = document.createElement('td');
        const span2 = document.createElement('span');
        span2.style.minWidth = '30px';
        span2.style.textAlign = 'center';
        span2.style.fontWeight = '500';
        span2.innerText = `${point.data[dataIndex]}`;
        td2.appendChild(span2);

        const td3 = document.createElement('td');
        const span3 = document.createElement('span');
        span3.style.minWidth = '40px';
        span3.style.textAlign = 'center';
        span3.style.fontWeight = '500';
        span3.innerText = `(${((point.data[dataIndex] / total) * 100).toFixed(2)}%)`;
        td3.appendChild(span3);

        const td4 = document.createElement('td');
        const span4 = document.createElement('span');
        span4.innerText = point.label;
        span4.style.fontWeight = '500';
        td4.appendChild(span4);

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tableBody.appendChild(tr);
      });

      const tableFooter = document.createElement('tfoot');
      const tableFooterRow = document.createElement('tr');
      const tableFooterData = document.createElement('td');
      tableFooterData.style.textAlign = 'left';
      tableFooterData.style.paddingTop = '8px';
      tableFooterData.style.fontWeight = '700';
      tableFooterData.colSpan = 4;
      tableFooterData.innerText = `Total: ${total}`;
      tableFooterRow.appendChild(tableFooterData);
      tableFooter.appendChild(tableFooterRow);

      table.appendChild(tableBody);
      table.appendChild(tableFooter);
      container.appendChild(table);
      modal.appendChild(container);
    }
  };
