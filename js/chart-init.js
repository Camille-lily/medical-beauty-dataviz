document.addEventListener('DOMContentLoaded', function() {
  // 通用图表配置：统一缩小字体、优化刻度
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        bodyFont: { size: 10 },
        titleFont: { size: 11 }
      },
      legend: {
        labels: { font: { size: 10 } }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { font: { size: 10 } },
        grid: { display: false }
      },
      x: {
        ticks: { font: { size: 10 } },
        grid: { display: false }
      }
    }
  };

  // 1. 判决结果柱状图（保留原类型）
  const judgmentData = {
    labels: ["支持全部诉求", "支持部分诉求", "驳回诉求", "调解/撤诉"],
    values: [17, 58, 28, 5],
    colors: ['#E53E3E', '#4299E1', '#A0AEC0', '#48BB78']
  };
  const judgmentCtx = document.getElementById('judgmentChart').getContext('2d');
  new Chart(judgmentCtx, {
    type: 'bar',
    data: { 
      labels: judgmentData.labels, 
      datasets: [{ 
        label: '案件数量（件）', 
        data: judgmentData.values, 
        backgroundColor: judgmentData.colors, 
        borderWidth: 0, 
        borderRadius: 4 
      }] 
    },
    options: {
      ...commonOptions,
      onClick: (e, el) => el.length>0 && (el[0].index===0 ? document.getElementById('caseDetail').classList.remove('hidden') : document.getElementById('caseDetail').classList.add('hidden')),
      scales: {
        ...commonOptions.scales,
        y: { ...commonOptions.scales.y, stepSize: 10 }
      }
    }
  });

  // 2. 金额对比图（保留原类型，优化单位）
  const amountData = { 
    labels: ["平均金额", "中位数", "最大值", "最小值"], 
    claim: [18.6, 15.0, 120.0, 0.5], 
    judgment: [6.2, 5.0, 30.0, 0], 
    colors: { claim: '#ED8936', judgment: '#38B2AC' } 
  };
  const amountCtx = document.getElementById('amountChart').getContext('2d');
  new Chart(amountCtx, {
    type: 'bar',
    data: { 
      labels: amountData.labels, 
      datasets: [
        { label: '诉求金额（万元）', data: amountData.claim, backgroundColor: amountData.colors.claim, borderWidth: 0, borderRadius: 4 },
        { label: '判决金额（万元）', data: amountData.judgment, backgroundColor: amountData.colors.judgment, borderWidth: 0, borderRadius: 4 }
      ] 
    },
    options: {
      ...commonOptions,
      onClick: (e, el) => el.length>0 && (el[0].index===2 ? document.getElementById('amountCaseDetail').classList.remove('hidden') : document.getElementById('amountCaseDetail').classList.add('hidden')),
      scales: {
        ...commonOptions.scales,
        y: { 
          ...commonOptions.scales.y, 
          stepSize: 20,
          ticks: { 
            ...commonOptions.scales.y.ticks,
            callback: value => value + ' 万'
          }
        }
      }
    }
  });

  // 3. 被告身份环形图（修复为圆形：cutout=60%）
  const defendantData = { 
    labels: ["民营医美机构", "其他机构（工作室）", "公立医院", "个人（医师）"], 
    values: [77, 13, 13, 5], 
    colors: ['#E53E3E', '#ED8936', '#4299E1', '#48BB78'], 
    rates: ['18.2%', '25.5%', '3.1%', '8.9%'] 
  };
  const defendantCtx = document.getElementById('defendantChart').getContext('2d');
  new Chart(defendantCtx, {
    type: 'doughnut',
    data: { 
      labels: defendantData.labels, 
      datasets: [{ 
        data: defendantData.values, 
        backgroundColor: defendantData.colors, 
        borderWidth: 2, 
        borderColor: '#ffffff' 
      }] 
    },
    options: {
      ...commonOptions,
      cutout: '60%', // 修复为圆形（cutout越小越圆，60%为标准圆形）
      plugins: {
        ...commonOptions.plugins,
        tooltip: {
          ...commonOptions.plugins.tooltip,
          callbacks: { 
            label: (ctx) => `${ctx.label}：${ctx.raw}件（${((ctx.raw/108)*100).toFixed(1)}%），纠纷率：${defendantData.rates[ctx.dataIndex]}` 
          }
        }
      }
    }
  });

  // 4. 被告资质与支持率→气泡图（替换原条形图+折线图）
  const qualificationData = {
    labels: ["有完整资质", "无医疗机构许可证", "资质不全"],
    cases: [66, 24, 18], // 气泡大小
    rates: [45.5, 83.3, 66.7], // y轴支持率
    colors: ['#4299E1', '#E53E3E', '#ED8936']
  };
  const qualificationCtx = document.getElementById('qualificationChart').getContext('2d');
  new Chart(qualificationCtx, {
    type: 'scatter', // 散点图（气泡图）
    data: {
      datasets: qualificationData.labels.map((label, index) => ({
        label: label,
        data: [{
          x: index, // x轴位置（0,1,2对应三个资质类型）
          y: qualificationData.rates[index], // y轴支持率
          r: qualificationData.cases[index] / 3 // 气泡大小（除以3控制尺寸）
        }],
        backgroundColor: qualificationData.colors[index],
        borderWidth: 0
      }))
    },
    options: {
      ...commonOptions,
      scales: {
        ...commonOptions.scales,
        x: {
          ticks: {
            font: { size: 10 },
            callback: (value) => qualificationData.labels[value] // x轴显示资质类型
          },
          min: -0.5,
          max: 2.5
        },
        y: {
          max: 100,
          ticks: {
            ...commonOptions.scales.y.ticks,
            callback: value => value + ' %'
          }
        }
      },
      plugins: {
        ...commonOptions.plugins,
        tooltip: {
          ...commonOptions.plugins.tooltip,
          callbacks: {
            label: (ctx) => {
              const index = ctx.datasetIndex;
              return `${qualificationData.labels[index]}：案件数${qualificationData.cases[index]}件，支持率${qualificationData.rates[index]}%`;
            }
          }
        }
      }
    }
  });

  // 5. 一级服务类型图（保留原横向柱状图）
  const riskTypeData = { 
    labels: ["手术类", "注射类", "护理类", "其他"], 
    values: [49, 38, 16, 5], 
    avgAmount: [22.8, 15.6, 8.3, 12.1], 
    colors: ['#E53E3E', '#ED8936', '#4299E1', '#A0AEC0'] 
  };
  const riskTypeCtx = document.getElementById('riskTypeChart').getContext('2d');
  new Chart(riskTypeCtx, {
    type: 'bar', 
    indexAxis: 'y',
    data: { 
      labels: riskTypeData.labels, 
      datasets: [{ 
        label: '案件数量（件）', 
        data: riskTypeData.values, 
        backgroundColor: riskTypeData.colors, 
        borderWidth: 0, 
        borderRadius: 4 
      }] 
    },
    options: {
      ...commonOptions,
      plugins: {
        ...commonOptions.plugins,
        tooltip: {
          ...commonOptions.plugins.tooltip,
          callbacks: { 
            label: (ctx) => `案件数：${ctx.raw}件，平均诉求金额：${riskTypeData.avgAmount[ctx.dataIndex]}万元` 
          }
        }
      },
      scales: {
        x: { ...commonOptions.scales.y, stepSize: 10 },
        y: { ticks: { font: { size: 10 } } }
      }
    }
  });

  // 6. 细分项目纠纷原因→热力图（替换原分组条形图）
  const riskProjectData = {
    yLabels: ["双眼皮手术", "玻尿酸注射", "隆鼻手术", "肉毒素注射", "吸脂手术"], // y轴项目
    xLabels: ["效果不符", "感染", "假体问题", "疤痕", "过敏"], // x轴纠纷原因
    values: [
      [9, 3, 0, 3, 0],  // 双眼皮手术
      [5, 6, 0, 0, 1],  // 玻尿酸注射
      [2, 3, 6, 1, 0],  // 隆鼻手术
      [2, 0, 0, 0, 5],  // 肉毒素注射
      [4, 1, 0, 0, 2]   // 吸脂手术
    ]
  };
  const riskProjectCtx = document.getElementById('riskProjectChart').getContext('2d');
  new Chart(riskProjectCtx, {
    type: 'heatmap', // 热力图类型
    data: {
      labels: riskProjectData.xLabels,
      datasets: [{
        label: '案件数',
        data: riskProjectData.values.flatMap((row, yIndex) => 
          row.map((value, xIndex) => ({
            x: xIndex,
            y: yIndex,
            value: value
          }))
        ),
        backgroundColor: (context) => {
          const value = context.raw.value;
          const alpha = value > 0 ? 0.2 + (value / 10) * 0.8 : 0; // 颜色深浅随值变化
          return `rgba(229, 62, 62, ${alpha})`;
        },
        borderWidth: 1,
        borderColor: '#fff'
      }]
    },
    options: {
      ...commonOptions,
      scales: {
        x: {
          ticks: { font: { size: 10 }, labels: riskProjectData.xLabels },
          grid: { display: false }
        },
        y: {
          ticks: { font: { size: 10 }, labels: riskProjectData.yLabels },
          grid: { display: false }
        }
      },
      plugins: {
        ...commonOptions.plugins,
        tooltip: {
          ...commonOptions.plugins.tooltip,
          callbacks: {
            label: (ctx) => {
              const xIndex = ctx.raw.x;
              const yIndex = ctx.raw.y;
              return `${riskProjectData.yLabels[yIndex]} - ${riskProjectData.xLabels[xIndex]}：${ctx.raw.value}件`;
            }
          }
        }
      }
    }
  });

  // 7. 维权成功率影响因素→点状图（替换原条形图）
  const suggestionData = {
    labels: ["有鉴定报告", "无鉴定报告", "有医疗合同", "无医疗合同", "被告无资质", "被告有资质"],
    rates: [72.2, 38.5, 68.3, 42.1, 83.3, 45.5], // y轴支持率
    cases: [36, 72, 63, 45, 24, 66], // 点的大小（对应案件数）
    colors: ['#48BB78', '#A0AEC0', '#4299E1', '#A0AEC0', '#E53E3E', '#A0AEC0']
  };
  const suggestionCtx = document.getElementById('suggestionChart').getContext('2d');
  new Chart(suggestionCtx, {
    type: 'scatter', // 散点图（点状图）
    data: {
      datasets: suggestionData.labels.map((label, index) => ({
        label: label,
        data: [{
          x: index, // x轴位置
          y: suggestionData.rates[index], // y轴支持率
          r: suggestionData.cases[index] / 4 // 点的大小（除以4控制尺寸）
        }],
        backgroundColor: suggestionData.colors[index],
        borderWidth: 0
      }))
    },
    options: {
      ...commonOptions,
      scales: {
        ...commonOptions.scales,
        x: {
          ticks: {
            font: { size: 9 },
            callback: (value) => suggestionData.labels[value]
          },
          min: -0.5,
          max: 5.5
        },
        y: {
          max: 100,
          ticks: {
            ...commonOptions.scales.y.ticks,
            callback: value => value + ' %'
          }
        }
      },
      plugins: {
        ...commonOptions.plugins,
        tooltip: {
          ...commonOptions.plugins.tooltip,
          callbacks: {
            label: (ctx) => {
              const index = ctx.datasetIndex;
              return `${suggestionData.labels[index]}：支持率${suggestionData.rates[index]}%，案件数${suggestionData.cases[index]}件`;
            }
          }
        }
      }
    }
  });
});
