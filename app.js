
// 修正版 app.js
// レーダーチャート崩れ対策済み

function renderChart(tasks) {
  const canvas = document.getElementById("radarChart");
  const ctx = canvas.getContext("2d");

  canvas.height = 420;

  const avg = (key) => {
    return tasks.reduce((sum, t) => {
      return sum + (Number(t[key]) || 0);
    }, 0) / tasks.length;
  };

  const chartData = [
    avg("automation_score"),
    avg("roi_score"),
    avg("difficulty_score"),
    avg("standardization_score")
  ];

  if (window.radarChartInstance) {
    window.radarChartInstance.destroy();
  }

  window.radarChartInstance = new Chart(ctx, {
    type: "radar",
    data: {
      labels: [
        "AI化率",
        "ROI",
        "難易度",
        "定型性"
      ],
      datasets: [
        {
          label: "分析結果",
          data: chartData,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            backdropColor: "transparent"
          }
        }
      }
    }
  });
}
