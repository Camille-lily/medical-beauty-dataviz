document.addEventListener('DOMContentLoaded', function() {
  // 通用图表配置（统一字体、交互）
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        bodyFont: { size: 10 },
        titleFont: { size: 11 },
        padding: 8
      },
      legend: {
        labels: {
          font: { size: 10 },
          padding: 10
        }
      }
    }
  };

  // ---------------------- 加载cases.json数据（供新增图表使用） ----------------------
  fetch('data/cases.json')
    .then(response => {
      if (!response.ok) throw new Error('数据加载失败');
      return response.json();
    })
    .then(casesData => {
      // 1. 词频统计（纠纷关键词、关键证据）
      const keywordFreq = countWordFrequency(casesData, '纠纷关键词', '；');
      const evidenceFreq = countWordFrequency(casesData, '关键证据', '；');
      // 2. 箱线图数据（诉求金额、判决金额）
      const [claimBoxData, judgmentBoxData] = getBoxplotData(casesData);
      // 3. 案件类型饼图数据
      const caseTypeData = countCaseType(casesData);

      // ---------------------- 初始化1：纠纷关键词词云图 ----------------------
      initWordcloud('keywordCloud', keywordFreq);
      // ---------------------- 初始化2：关键证据词云图 ----------------------
      initWordcloud('evidenceCloud', evidenceFreq);
      // ---------------------- 初始化3：金额对比箱线图 ----------------------
      initBoxplot('amountBoxplot', claimBoxData, judgmentBoxData);
      // ---------------------- 初始化4：案件类型饼图 ----------------------
      initCaseTypePie('caseTypePie', caseTypeData);

      // ---------------------- 保留原有图表：判决结果柱状图 ----------------------
      const judgmentCtx = document.getElementById('judgmentChart').getContext('2d');
      new Chart(judgmentCtx, {
        type: 'bar',
        data: {
          labels: ["支持全部诉求", "支持部分诉求", "驳回诉求", "调解/撤诉"],
          datasets: [{
            label: '案件数量（件）',
            data: [17, 58, 28, 5],
            backgroundColor: ['#E53E3E', '#4299E1', '#A0AEC0', '#48BB78'],
            borderWidth: 0,
            borderRadius: 4
          }]
        },
        options: {
          ...commonOptions,
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
          },
          onClick: (e, elements) => {
            if (elements.length > 0 && elements[0].index === 0) {
              document.getElementById('caseDetail').classList.remove('hidden');
            } else {
              document.getElementById('caseDetail').classList.add('hidden');
            }
          }
        }
      });

      // ---------------------- 保留原有图表：被告身份环形图 ----------------------
      const defendantCtx = document.getElementById('defendantChart').getContext('2d');
      new Chart(defendantCtx, {
        type: 'doughnut',
        data: {
          labels: ["民营医美机构", "其他机构（工作室）", "公立医院", "个人（医师）"],
          datasets: [{
            data: [77, 13, 13, 5],
            backgroundColor: ['#E53E3E', '#ED8936', '#4299E1', '#48BB78'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          ...commonOptions,
          cutout: '60%', // 圆形效果
          plugins: {
            ...commonOptions.plugins,
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const total = 108;
                  const percentage = ((ctx.raw / total) * 100).toFixed(1) + '%';
                  return `${ctx.label}：${ctx.raw}件（${percentage}）`;
                }
              }
            }
          }
        }
      });

      // ---------------------- 保留原有图表：被告资质气泡图 ----------------------
      const qualificationCtx = document.getElementById('qualificationChart').getContext('2d');
      new Chart(qualificationCtx, {
        type: 'scatter',
        data: {
          datasets: [
            {
              label: '有完整资质',
              data: [{ x: 0, y: 45.5, r: 66 / 3 }], // r=案件数/3（控制气泡大小）
              backgroundColor: '#4299E1'
            },
            {
              label: '无医疗机构许可证',
              data: [{ x: 1, y: 83.3, r: 24 / 3 }],
              backgroundColor: '#E53E3E'
            },
            {
              label: '资质不全',
              data: [{ x: 2, y: 66.7, r: 18 / 3 }],
              backgroundColor: '#ED8936'
            }
          ]
        },
        options: {
          ...commonOptions,
          scales: {
            x: {
              ticks: {
                font: { size: 10 },
                callback: (value) => ['有完整资质', '无许可证', '资质不全'][value]
              },
              min: -0.5,
              max: 2.5,
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                font: { size: 10 },
                callback: (value) => value + '%'
              },
              grid: { display: false }
            }
          },
          plugins: {
            ...commonOptions.plugins,
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const label = ctx.dataset.label;
                  const cases = [66, 24, 18][ctx.datasetIndex];
                  const rate = [45.5, 83.3, 66.7][ctx.datasetIndex];
                  return `${label}：${cases}件，支持率${rate}%`;
                }
              }
            }
          }
        }
      });

      // ---------------------- 保留原有图表：一级服务类型横向柱状图 ----------------------
      const riskTypeCtx = document.getElementById('riskTypeChart').getContext('2d');
      new Chart(riskTypeCtx, {
        type: 'bar',
        indexAxis: 'y', // 横向柱状图
        data: {
          labels: ["手术类", "注射类", "护理类", "其他"],
          datasets: [{
            label: '案件数量（件）',
            data: [49, 38, 16, 5],
            backgroundColor: ['#E53E3E', '#ED8936', '#4299E1', '#A0AEC0'],
            borderWidth: 0,
            borderRadius: 4
          }]
        },
        options: {
          ...commonOptions,
          scales: {
            x: {
              beginAtZero: true,
              ticks: { font: { size: 10 } },
              grid: { display: false }
            },
            y: {
              ticks: { font: { size: 10 } },
              grid: { display: false }
            }
          },
          plugins: {
            ...commonOptions.plugins,
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const avgAmount = [22.8, 15.6, 8.3, 12.1][ctx.dataIndex];
                  return `案件数：${ctx.raw}件，平均诉求金额：${avgAmount}万元`;
                }
              }
            }
          }
        }
      });

      // ---------------------- 保留原有图表：细分项目热力图 ----------------------
      const riskProjectCtx = document.getElementById('riskProjectChart').getContext('2d');
      new Chart(riskProjectCtx, {
        type: 'heatmap',
        data: {
          labels: ["效果不符", "感染", "假体问题", "疤痕", "过敏"], // x轴：纠纷原因
          datasets: [{
            label: '案件数',
            data: [
              { x: 0, y: 0, value: 9 }, { x: 1, y: 0, value: 3 }, { x: 2, y: 0, value: 0 }, { x: 3, y: 0, value: 3 }, { x: 4, y: 0, value: 0 },
              { x: 0, y: 1, value: 5 }, { x: 1, y: 1, value: 6 }, { x: 2, y: 1, value: 0 }, { x: 3, y: 1, value: 0 }, { x: 4, y: 1, value: 1 },
              { x: 0, y: 2, value: 2 }, { x: 1, y: 2, value: 3 }, { x: 2, y: 2, value: 6 }, { x: 3, y: 2, value: 1 }, { x: 4, y: 2, value: 0 },
              { x: 0, y: 3, value: 2 }, { x: 1, y: 3, value: 0 }, { x: 2, y: 3, value: 0 }, { x: 3, y: 3, value: 0 }, { x: 4, y: 3, value: 5 },
              { x: 0, y: 4, value: 4 }, { x: 1, y: 4, value: 1 }, { x: 2, y: 4, value: 0 }, { x: 3, y: 4, value: 0 }, { x: 4, y: 4, value: 2 }
            ],
            backgroundColor: (context) => {
              const value = context.raw.value;
              const alpha = value > 0 ? 0.2 + (value / 10) * 0.8 : 0; // 颜色深浅随值变化
              return `rgba(229, 62, 62, ${alpha})`;
            },
            borderWidth: 1,
            borderColor: '#ffffff'
          }]
        },
        options: {
          ...commonOptions,
          scales: {
            x: {
              ticks: { font: { size: 10 } },
              grid: { display: false }
            },
            y: {
              ticks: {
                font: { size: 10 },
                callback: (value) => ["双眼皮手术", "玻尿酸注射", "隆鼻手术", "肉毒素注射", "吸脂手术"][value]
              },
              grid: { display: false }
            }
          },
          plugins: {
            ...commonOptions.plugins,
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const project = ["双眼皮手术", "玻尿酸注射", "隆鼻手术", "肉毒素注射", "吸脂手术"][ctx.raw.y];
                  const reason = ["效果不符", "感染", "假体问题", "疤痕", "过敏"][ctx.raw.x];
                  return `${project} - ${reason}：${ctx.raw.value}件`;
                }
              }
            }
          }
        }
      });

      // ---------------------- 保留原有图表：维权建议点状图 ----------------------
      const suggestionCtx = document.getElementById('suggestionChart').getContext('2d');
      new Chart(suggestionCtx, {
        type: 'scatter',
        data: {
          datasets: [
            {
              label: '有鉴定报告',
              data: [{ x: 0, y: 72.2, r: 36 / 4 }], // r=案件数/4
              backgroundColor: '#48BB78'
            },
            {
              label: '无鉴定报告',
              data: [{ x: 1, y: 38.5, r: 72 / 4 }],
              backgroundColor: '#A0AEC0'
            },
            {
              label: '有医疗合同',
              data: [{ x: 2, y: 68.3, r: 63 / 4 }],
              backgroundColor: '#4299E1'
            },
            {
              label: '无医疗合同',
              data: [{ x: 3, y: 42.1, r: 45 / 4 }],
              backgroundColor: '#A0AEC0'
            },
            {
              label: '被告无资质',
              data: [{ x: 4, y: 83.3, r: 24 / 4 }],
              backgroundColor: '#E53E3E'
            },
            {
              label: '被告有资质',
              data: [{ x: 5, y: 45.5, r: 66 / 4 }],
              backgroundColor: '#A0AEC0'
            }
          ]
        },
        options: {
          ...commonOptions,
          scales: {
            x: {
              ticks: {
                font: { size: 9 },
                callback: (value) => ["有鉴定", "无鉴定", "有合同", "无合同", "被告无资质", "被告有资质"][value]
              },
              min: -0.5,
              max: 5.5,
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                font: { size: 10 },
                callback: (value) => value + '%'
              },
              grid: { display: false }
            }
          },
          plugins: {
            ...commonOptions.plugins,
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const label = ctx.dataset.label;
                  const rate = ctx.raw.y;
                  const cases = [36, 72, 63, 45, 24, 66][ctx.datasetIndex];
                  return `${label}：支持率${rate}%，案件数${cases}件`;
                }
              }
            }
          }
        }
      });

    })
    .catch(error => {
      console.error('图表初始化失败：', error);
      alert('数据加载失败，请检查cases.json文件是否存在且格式正确');
    });

  // ---------------------- 工具函数1：词频统计（支持多关键词分割，过滤低频词） ----------------------
  function countWordFrequency(cases, fieldName, separator) {
    const frequency = {};
    // 遍历所有案件，分割关键词并计数
    cases.forEach(caseItem => {
      const rawValue = caseItem[fieldName]?.trim() || '';
      if (!rawValue) return;
      const words = rawValue.split(separator).map(word => word.trim());
      words.forEach(word => {
        if (word) frequency[word] = (frequency[word] || 0) + 1;
      });
    });
    // 过滤低频词（出现次数<2的词不显示）
    Object.keys(frequency).forEach(word => {
      if (frequency[word] < 2) delete frequency[word];
    });
    return frequency;
  }

  // ---------------------- 工具函数2：箱线图数据计算（min, q1, median, q3, max） ----------------------
  function getBoxplotData(cases) {
    // 提取金额（转换为万元，过滤无效值）
    const claimAmounts = cases
      .map(caseItem => Number(caseItem['诉求金额（元）']) / 10000)
      .filter(amount => !isNaN(amount) && amount > 0);
    const judgmentAmounts = cases
      .map(caseItem => Number(caseItem['判决金额（元）']) / 10000)
      .filter(amount => !isNaN(amount) && amount >= 0);

    // 计算单组数据的统计值
    const calculateStats = (data) => {
      const sorted = [...data].sort((a, b) => a - b);
      const length = sorted.length;
      const min = sorted[0];
      const max = sorted[length - 1];
      const median = sorted[Math.floor(length / 2)];
      const q1 = sorted[Math.floor(length / 4)];
      const q3 = sorted[Math.floor(length * 3 / 4)];
      return [min, q1, median, q3, max]; // 箱线图需要的5个值
    };

    return [calculateStats(claimAmounts), calculateStats(judgmentAmounts)];
  }

  // ---------------------- 工具函数3：案件类型统计 ----------------------
  function countCaseType(cases) {
    const typeCount = {};
    cases.forEach(caseItem => {
      const type = caseItem['案件类型']?.trim() || '其他';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    return typeCount;
  }

  // ---------------------- 工具函数4：初始化词云图 ----------------------
  function initWordcloud(domId, frequencyData) {
    const domElement = document.getElementById(domId);
    if (!domElement) return;

    // 转换为wordcloud2需要的格式：[{text: '关键词', weight: 频次}, ...]
    const wordList = Object.entries(frequencyData).map(([text, weight]) => ({
      text,
      weight
    }));

    // 配置词云样式
    WordCloud(domElement, {
      list: wordList,
      sizeRange: [12, 60], // 字体大小范围（最小12px，最大60px）
      color: '#E53E3E', // 字体颜色（红色系，匹配主题）
      backgroundColor: '#f9fafb', // 背景色（浅灰，与页面协调）
      rotateRatio: 0.3, // 30%的词旋转（避免单调）
      shape: 'circle', // 圆形布局
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif', // 兼容中英文
      fontWeight: 'normal',
      padding: 5
    });
  }

  // ---------------------- 工具函数5：初始化箱线图 ----------------------
  function initBoxplot(domId, claimData, judgmentData) {
    const ctx = document.getElementById(domId).getContext('2d');
    new Chart(ctx, {
      type: 'boxplot',
      data: {
        labels: ['诉求金额（万元）', '判决金额（万元）'],
        datasets: [{
          label: '金额分布',
          data: [claimData, judgmentData],
          backgroundColor: 'rgba(237, 137, 54, 0.2)', // 填充色
          borderColor: 'rgba(237, 137, 54, 1)', // 边框色
          borderWidth: 1,
          outlierColor: '#E53E3E', // 异常值颜色
          outlierRadius: 4
        }]
      },
      options: {
        ...commonOptions,
        scales: {
          y: {
            title: {
              display: true,
              text: '金额（万元）',
              font: { size: 10 }
            },
            ticks: {
              font: { size: 10 },
              callback: (value) => value + ' 万' // 显示单位
            },
            grid: { display: false }
          },
          x: {
            ticks: { font: { size: 11 } },
            grid: { display: false }
          }
        },
        plugins: {
          ...commonOptions.plugins,
          tooltip: {
            callbacks: {
              label: (context) => {
                const [min, q1, median, q3, max] = context.raw;
                return [
                  `最小值：${min.toFixed(1)} 万`,
                  `第一四分位：${q1.toFixed(1)} 万`,
                  `中位数：${median.toFixed(1)} 万`,
                  `第三四分位：${q3.toFixed(1)} 万`,
                  `最大值：${max.toFixed(1)} 万`
                ];
              }
            }
          }
        },
        onClick: () => {
          document.getElementById('amountCaseDetail').classList.remove('hidden');
        }
      }
    });
  }

  // ---------------------- 工具函数6：初始化案件类型饼图 ----------------------
  function initCaseTypePie(domId, typeData) {
    const ctx = document.getElementById(domId).getContext('2d');
    const labels = Object.keys(typeData);
    const data = Object.values(typeData);
    const total = data.reduce((a, b) => a + b, 0);

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#E53E3E', '#4299E1', '#ED8936', '#48BB78'], // 颜色匹配主题
          borderWidth: 1,
          borderColor: '#ffffff',
          hoverOffset: 4 // hover时偏移，增强交互感
        }]
      },
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const value = ctx.raw;
                const percentage = ((value / total) * 100).toFixed(1) + '%';
                return `${ctx.label}：${value}件（${percentage}）`;
              }
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 10 }
            }
          }
        }
      }
    });
  }
});
