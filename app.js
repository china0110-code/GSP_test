
const generatePromptBtn = document.getElementById("generatePromptBtn");
const copyPromptBtn = document.getElementById("copyPromptBtn");
const loadJsonBtn = document.getElementById("loadJsonBtn");
const promptOutput = document.getElementById("promptOutput");

let radarChart;

generatePromptBtn.addEventListener("click", () => {
  const company = document.getElementById("company").value;
  const department = document.getElementById("department").value;
  const industry = document.getElementById("industry").value;
  const size = document.getElementById("size").value;

  const prompt = `
あなたは一流の業務改革コンサルタントです。

以下の企業部署について、想定される業務一覧を作成し、各業務をタスクレベルまで分解してください。

さらに各タスクについて以下を0〜100で評価してください。

- automation_score
- roi_score
- difficulty_score
- standardization_score

JSONのみで出力してください。

# 企業情報
企業名: ${company}
部署名: ${department}
業界: ${industry}
企業規模: ${size}

# JSON Schema
{
  "company": "",
  "department": "",
  "summary": {
    "overall_ai_score": 0
  },
  "tasks": [
    {
      "task_name": "",
      "description": "",
      "automation_score": 0,
      "roi_score": 0,
      "difficulty_score": 0,
      "standardization_score": 0,
      "recommended_ai_tools": []
    }
  ]
}
`;

  promptOutput.value = prompt.trim();
});

copyPromptBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(promptOutput.value);
  alert("コピーしました");
});

loadJsonBtn.addEventListener("click", () => {
  try {
    const data = JSON.parse(document.getElementById("jsonInput").value);

    document.getElementById("resultSection").classList.remove("hidden");

    document.getElementById("totalScore").textContent =
      data.summary.overall_ai_score;

    renderTasks(data.tasks);
    renderChart(data.tasks);

  } catch (e) {
    alert("JSON形式が不正です");
  }
});

function renderTasks(tasks) {
  const taskList = document.getElementById("taskList");

  taskList.innerHTML = "";

  tasks.forEach(task => {
    const el = document.createElement("div");

    el.className = "task-card";

    el.innerHTML = `
      <h3>${task.task_name}</h3>
      <p>${task.description}</p>

      <div class="task-grid">
        <div class="metric">
          <strong>AI化率</strong>
          <div>${task.automation_score}</div>
        </div>

        <div class="metric">
          <strong>ROI</strong>
          <div>${task.roi_score}</div>
        </div>

        <div class="metric">
          <strong>難易度</strong>
          <div>${task.difficulty_score}</div>
        </div>

        <div class="metric">
          <strong>定型性</strong>
          <div>${task.standardization_score}</div>
        </div>
      </div>

      <p>
        <strong>推奨AI:</strong>
        ${task.recommended_ai_tools.join(", ")}
      </p>
    `;

    taskList.appendChild(el);
  });
}

function renderChart(tasks) {
  const ctx = document.getElementById("radarChart");

  const avg = (key) =>
    tasks.reduce((sum, t) => sum + t[key], 0) / tasks.length;

  const data = {
    labels: [
      "AI化率",
      "ROI",
      "難易度",
      "定型性"
    ],
    datasets: [{
      label: "分析結果",
      data: [
        avg("automation_score"),
        avg("roi_score"),
        avg("difficulty_score"),
        avg("standardization_score")
      ]
    }]
  };

  if (radarChart) {
    radarChart.destroy();
  }

  radarChart = new Chart(ctx, {
    type: "radar",
    data
  });
}

document.getElementById("downloadBtn").addEventListener("click", () => {
  const blob = new Blob(
    [document.getElementById("jsonInput").value],
    { type: "application/json" }
  );

  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "analysis.json";

  a.click();
});
