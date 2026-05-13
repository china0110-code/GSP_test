// Evaluation Axes Definition
const AXES = [
    "1.繰り返し性", "2.データ整備度", "3.判断の複雑さ", "4.対人依存度", "5.ミスのリカバリコスト",
    "6.年間作業頻度", "7.1回作業ボリューム", "8.属人性の高さ", "9.出力検証しやすさ", "10.法的リスク"
];

// Mock Knowledge Base for Departments
const DEPT_TEMPLATES = {
    "人事": [
        { name: "勤怠データの照合・給与計算", scores: [10, 9, 2, 1, 8, 10, 8, 2, 9, 9] },
        { name: "採用候補者の書類選考", scores: [6, 8, 7, 3, 3, 7, 6, 5, 8, 6] },
        { name: "社員からの福利厚生問い合わせ対応", scores: [8, 5, 4, 7, 2, 9, 4, 4, 7, 5] },
        { name: "人事評価面談・フィードバック", scores: [2, 3, 9, 10, 7, 2, 8, 9, 4, 5] }
    ],
    "経理": [
        { name: "領収書の仕訳入力・経費精算", scores: [10, 9, 2, 1, 4, 10, 7, 2, 9, 8] },
        { name: "月次決算報告書の作成", scores: [7, 8, 6, 2, 7, 3, 9, 6, 8, 9] },
        { name: "売掛金の入金消込・督促管理", scores: [8, 8, 4, 6, 6, 10, 5, 3, 8, 7] },
        { name: "税務申告書類の作成", scores: [5, 9, 8, 2, 9, 2, 10, 8, 7, 10] }
    ],
    "営業": [
        { name: "SFA/CRMへの活動履歴入力", scores: [9, 6, 2, 1, 2, 10, 3, 2, 9, 3] },
        { name: "標準的な見積書の作成", scores: [9, 8, 3, 2, 5, 9, 4, 3, 9, 6] },
        { name: "顧客への製品プレゼン・提案", scores: [3, 4, 8, 10, 6, 6, 7, 9, 5, 4] },
        { name: "新規販路開拓の戦略立案", scores: [2, 5, 9, 8, 7, 3, 9, 9, 4, 5] }
    ],
    "法務": [
        { name: "定型契約書のドラフト作成", scores: [8, 7, 5, 2, 6, 8, 6, 4, 8, 9] },
        { name: "契約リーガルチェック", scores: [6, 7, 8, 3, 8, 8, 7, 7, 7, 10] },
        { name: "コンプライアンス研修資料作成", scores: [5, 6, 5, 4, 3, 3, 8, 5, 7, 8] }
    ]
};

let currentChart = null;

document.getElementById('analyzeBtn').addEventListener('click', () => {
    const company = document.getElementById('companyName').value || "貴社";
    const dept = document.getElementById('deptName').value;

    if (!dept) {
        alert("分析対象の部署名を入力してください。");
        return;
    }

    performAnalysis(company, dept);
});

function performAnalysis(company, dept) {
    const section = document.getElementById('resultSection');
    const grid = document.getElementById('taskGrid');
    const title = document.getElementById('displayTitle');

    section.classList.remove('hidden');
    grid.innerHTML = "";
    title.innerText = `${company} ${dept} の業務AI導入適性マップ`;

    // Get tasks from template or generate generic ones
    let tasks = [];
    const key = Object.keys(DEPT_TEMPLATES).find(k => dept.includes(k));
    
    if (key) {
        tasks = DEPT_TEMPLATES[key];
    } else {
        // Fallback generic tasks
        tasks = [
            { name: `${dept}の定型レポート作成`, scores: [8, 7, 4, 2, 4, 9, 6, 5, 8, 6] },
            { name: `${dept}の外部問い合わせ対応`, scores: [7, 5, 6, 8, 4, 10, 4, 6, 7, 5] },
            { name: `${dept}のデータ整理・管理`, scores: [9, 9, 3, 1, 5, 10, 7, 3, 9, 7] },
            { name: `${dept}の改善施策の立案`, scores: [3, 4, 9, 7, 6, 3, 8, 8, 5, 5] }
        ];
    }

    tasks.forEach(task => {
        const avg = task.scores.reduce((a, b) => a + b) / 10;
        const totalScore = Math.round(avg * 10);
        const colorClass = totalScore >= 70 ? 'high' : (totalScore >= 40 ? 'mid' : 'low');

        const card = document.createElement('div');
        card.className = 'task-card';
        card.innerHTML = `
            <div class="task-info">
                <h4>${task.name}</h4>
                <p>クリックして詳細な10軸評価を確認</p>
            </div>
            <div class="score-circle ${colorClass}">
                <span style="font-size:0.6rem">効果度</span>
                ${totalScore}
            </div>
        `;
        card.onclick = () => showDetail(task, totalScore);
        grid.appendChild(card);
    });

    // Scroll to results
    section.scrollIntoView({ behavior: 'smooth' });
}

function showDetail(task, totalScore) {
    const modal = document.getElementById('detailModal');
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    modal.classList.remove('hidden');
    document.getElementById('modalTaskName').innerText = task.name;
    document.getElementById('modalTotalScore').innerText = totalScore;

    // Render Axis List
    const axisList = document.getElementById('axisDetails');
    axisList.innerHTML = "";
    AXES.forEach((label, i) => {
        const item = document.createElement('div');
        item.className = 'axis-item';
        item.innerHTML = `<span>${label}</span> <strong>${task.scores[i]}/10</strong>`;
        axisList.appendChild(item);
    });

    // Chart.js Radar
    if (currentChart) currentChart.destroy();
    
    currentChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: AXES.map(a => a.split('.')[1]),
            datasets: [{
                label: 'AI導入効果度スコア',
                data: task.scores,
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(37, 99, 235, 1)',
                pointRadius: 4
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    max: 10,
                    ticks: { stepSize: 2 }
                }
            },
            plugins: {
                legend: { display: false }
            },
            maintainAspectRatio: false
        }
    });
}

// Close Modal logic
document.querySelector('.close-btn').onclick = () => {
    document.getElementById('detailModal').classList.add('hidden');
};

window.onclick = (event) => {
    const modal = document.getElementById('detailModal');
    if (event.target == modal) {
        modal.classList.add('hidden');
    }
};
