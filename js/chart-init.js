document.addEventListener('DOMContentLoaded', function() {
  // 1. 判决结果柱状图（图1）
  const judgmentData = {
    labels: ["支持全部诉求", "支持部分诉求", "驳回诉求", "调解/撤诉"],
    values: [17, 58, 28, 5],
    colors: ['#E53E3E', '#4299E1', '#A0AEC0', '#48BB78']
  };
  const judgmentCtx = document.getElementById('judgmentChart').getContext('2d');
  new Chart(judgmentCtx, {
    type: 'bar',
    data: { labels: judgmentData.labels, datasets: [{ label: '案件数量（件）', data: judgmentData.values, backgroundColor: judgmentData.colors, borderWidth: 0, borderRadius: 4 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { tooltip: { callbacks: { label: ctx => `案件数：${ctx.raw}件（${((ctx.raw/108)*100).toFixed(1)}%）` } }, legend: { display: false } },
      onClick: (e, el) => el.length>0 && (el[0].index===0 ? document.getElementById('caseDetail').classList.remove('hidden') : document.getElementById('caseDetail').classList.add('hidden')),
      scales: { y: { beginAtZero: true, ticks: { font: { size: 12 } } }, x: { ticks: { font: { size: 12 } } } }
    }
  });

  // 2. 金额对比图（图2）
  const amountData = { labels: ["平均金额", "中位数", "最大值", "最小值"], claim: [18.6, 15.0, 120.0, 0.5], judgment: [6.2, 5.0, 30.0, 0], colors: { claim: '#ED8936', judgment: '#38B2AC' } };
  const amountCtx = document.getElementById('amountChart').getContext('2d');
  new Chart(amountCtx, {
    type: 'bar',
    data: { labels: amountData.labels, datasets: [
      { label: '诉求金额（万元）', data: amountData.claim, backgroundColor: amountData.colors.claim, borderWidth: 0, borderRadius: 4 },
      { label: '判决金额（万元）', data: amountData.judgment, backgroundColor: amountData.colors.judgment, borderWidth: 0, borderRadius: 4 }
    ] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}：${ctx.raw}万元` } }, legend: { position: 'top' } },
      onClick: (e, el) => el.length>0 && (el[0].index===2 ? document.getElementById('amountCaseDetail').classList.remove('hidden') : document.getElementById('amountCaseDetail').classList.add('hidden')),
      scales: { y: { beginAtZero: true, ticks: { font: { size: 12 } } }, x: { ticks: { font: { size: 12 } } } }
    }
  });

  // 3. 被告身份环形图（图3）
  const defendantData = { labels: ["民营医美机构", "其他机构（工作室）", "公立医院", "个人（医师）"], values: [77, 13, 13, 5], colors: ['#E53E3E', '#ED8936', '#4299E1', '#48BB78'], rates: ['18.2%', '25.5%', '3.1%', '8.9%'] };
  const defendantCtx = document.getElementById('defendantChart').getContext('2d');
  new Chart(defendantCtx, {
    type: 'doughnut',
    data: { labels: defendantData.labels, datasets: [{ data: defendantData.values, backgroundColor: defendantData.colors, borderWidth: 2, borderColor: '#ffffff' }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '60%',
      plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.label}：${ctx.raw}件（${((ctx.raw/108)*100).toFixed(1)}%），纠纷率：${defendantData.rates[ctx.dataIndex]}` } }, legend: { position: 'bottom' } }
    }
  });

  // 4. 被告资质与支持率图（图4）
  const qualificationData = { labels: ["有完整资质", "无医疗机构许可证", "资质不全"], cases: [66, 24, 18], rates: [45.5, 83.3, 66.7], colors: ['#4299E1', '#E53E3E', '#ED8936'] };
  const qualificationCtx = document.getElementById('qualificationChart').getContext('2d');
  new Chart(qualificationCtx, {
    type: 'bar',
    data: { labels: qualificationData.labels, datasets: [
      { label: '案件数量（件）', data: qualificationData.cases, backgroundColor: qualificationData.colors, borderWidth: 0, borderRadius: 4, yAxisID: 'y' },
      { label: '消费者支持率（%）', data: qualificationData.rates, type: 'line', borderColor: '#9F7AEA', backgroundColor: 'rgba(159, 122, 234, 0.2)', tension: 0.3, fill: true, yAxisID: 'y1' }
    ] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { tooltip: { mode: 'index', intersect: false }, legend: { position: 'top' } },
      scales: {
        y: { type: 'linear', display: true, position: 'left', title: { text: '案件数（件）', display: true }, beginAtZero: true, ticks: { font: { size: 12 } } },
        y1: { type: 'linear', display: true, position: 'right', title: { text: '支持率（%）', display: true }, beginAtZero: true, max: 100, ticks: { font: { size: 12 } }, grid: { drawOnChartArea: false } },
        x: { ticks: { font: { size: 12 } } }
      }
    }
  });

  // 5. 一级服务类型图（图5）
  const riskTypeData = { labels: ["手术类", "注射类", "护理类", "其他"], values: [49, 38, 16, 5], avgAmount: [22.8, 15.6, 8.3, 12.1], colors: ['#E53E3E', '#ED8936', '#4299E1', '#A0AEC0'] };
  const riskTypeCtx = document.getElementById('riskTypeChart').getContext('2d');
  new Chart(riskTypeCtx, {
    type: 'bar', indexAxis: 'y',
    data: { labels: riskTypeData.labels, datasets: [{ label: '案件数量（件）', data: riskTypeData.values, backgroundColor: riskTypeData.colors, borderWidth: 0, borderRadius: 4 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { tooltip: { callbacks: { label: (ctx) => `案件数：${ctx.raw}件，平均诉求金额：${riskTypeData.avgAmount[ctx.dataIndex]}万元` } }, legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { font: { size: 12 } } }, y: { ticks: { font: { size: 12 } } } }
    }
  });

  // 6. 二级项目热力图（图6）
  const riskProjectData = { labels: ["双眼皮手术", "玻尿酸注射", "隆鼻手术", "肉毒素注射", "吸脂手术"], reasons: ["效果不符", "感染", "假体问题", "疤痕", "过敏"], values: [[9, 3, 0, 3, 0], [5, 6, 0, 0, 1], [2, 3, 6, 1, 0], [2, 0, 0, 0, 5], [4, 1, 0, 0, 2]], colors: ['rgba(229, 62, 62, 0.2)', 'rgba(229, 62, 62, 0.4)', 'rgba(229, 62, 62, 0.6)', 'rgba(229, 62, 62, 0.8)', 'rgba(229, 62, 62, 1.0)'] };
  const riskProjectCtx = document.getElementById('riskProjectChart').getContext('2d');
  new Chart(riskProjectCtx, {
    type: 'bar',
    data: { labels: riskProjectData.labels, datasets: riskProjectData.reasons.map((reason, i) => ({ label: reason, data: riskProjectData.values.map(row => row[i]), backgroundColor: riskProjectData.colors[i], borderWidth: 0, borderRadius: 2 })) },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}：${ctx.raw}件` } }, legend: { position: 'bottom' } },
      scales: { x: { ticks: { font: { size: 11 } } }, y: { beginAtZero: true, ticks: { font: { size: 12 } } } }
    }
  });

  // 7. 维权建议对比图（图7）
  const suggestionData = { labels: ["有鉴定报告", "无鉴定报告", "有医疗合同", "无医疗合同", "被告无资质", "被告有资质"], rates: [72.2, 38.5, 68.3, 42.1, 83.3, 45.5], colors: ['#48BB78', '#A0AEC0', '#4299E1', '#A0AEC0', '#E53E3E', '#A0AEC0'] };
  const suggestionCtx = document.getElementById('suggestionChart').getContext('2d');
  new Chart(suggestionCtx, {
    type: 'bar',
    data: { labels: suggestionData.labels, datasets: [{ label: '消费者支持率（%）', data: suggestionData.rates, backgroundColor: suggestionData.colors, borderWidth: 0, borderRadius: 4 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { tooltip: { callbacks: { label: ctx => `支持率：${ctx.raw}%` } }, legend: { display: false } },
      scales: { y: { beginAtZero: true, max: 100, ticks: { font: { size: 12 } } }, x: { ticks: { font: { size: 11 } } } }
    }
  });
});
