document.addEventListener('DOMContentLoaded', function() {
  // 初始化ECharts实例
  const mapChart = echarts.init(document.getElementById('areaChart'));
  let mapLoaded = false;

  // ---------------------- 步骤1：从cases.json获取事发地数据并统计 ----------------------
  fetch('data/cases.json')
    .then(response => {
      if (!response.ok) throw new Error('案件数据加载失败');
      return response.json();
    })
    .then(casesData => {
      // 统计每个省份的案件数
      const provinceCaseCount = {};
      casesData.forEach(caseItem => {
        // 提取“事发地（省）”字段，处理特殊情况（如“北京市”→“北京”）
        let province = caseItem['事发地（省）']?.trim() || '其他';
        province = province.replace('市', '').replace('省', '').replace('自治区', '').replace('壮族', '').replace('维吾尔', '').replace('回族', '');
        
        if (province) {
          provinceCaseCount[province] = (provinceCaseCount[province] || 0) + 1;
        }
      });

      // 过滤案件数为0的省份（仅保留有案件的）
      const areaData = Object.entries(provinceCaseCount)
        .filter(([province, count]) => count > 0)
        .map(([name, value]) => ({ name, value }));

      if (areaData.length === 0) {
        throw new Error('无有效地域数据，请检查cases.json的“事发地（省）”字段');
      }

      // ---------------------- 步骤2：加载中国地图JSON数据 ----------------------
      return fetch('https://cdn.jsdelivr.net/npm/china-echarts-js@1.0.0/china.json')
        .then(mapResponse => {
          if (!mapResponse.ok) throw new Error('地图数据加载失败');
          return mapResponse.json();
        })
        .then(mapJson => {
          // 注册中国地图
          echarts.registerMap('china', mapJson);
          mapLoaded = true;

          // ---------------------- 步骤3：配置并渲染地图 ----------------------
          const option = {
            tooltip: {
              trigger: 'item',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderColor: '#E53E3E',
              borderWidth: 1,
              textStyle: { color: '#1f2937', fontSize: 10 },
              padding: 8,
              formatter: (params) => {
                const totalCases = areaData.reduce((sum, item) => sum + item.value, 0);
                const percentage = ((params.value / totalCases) * 100).toFixed(1) + '%';
                return `<div><strong>${params.name}</strong></div>
                        <div>案件数：${params.value}件</div>
                        <div>占比：${percentage}</div>`;
              }
            },
            visualMap: {
              min: 0,
              max: Math.max(...areaData.map(item => item.value)), // 最大值为实际最大案件数
              left: 'left',
              top: 'bottom',
              text: ['案件数多', '案件数少'],
              textStyle: { fontSize: 10, color: '#6b7280' },
              calculable: true,
              inRange: {
                // 颜色梯度（从浅蓝到红色，匹配主题）
                color: ['#e0f7fa', '#b2ebf2', '#80deea', '#4dd0e1', '#26c6da', '#00bcd4', '#E53E3E']
              },
              borderColor: '#e5e7eb'
            },
            series: [{
              name: '医美纠纷案件数',
              type: 'map',
              mapType: 'china',
              roam: false, // 禁止缩放和平移
              label: {
                show: true,
                color: '#1f2937',
                fontSize: 10,
                fontWeight: 'normal'
              },
              data: areaData, // 仅传入有案件的省份数据（无案件省份自动隐藏）
              emphasis: {
                // hover时高亮样式
                label: { color: '#ffffff', fontSize: 11 },
                itemStyle: {
                  areaColor: '#E53E3E',
                  borderColor: '#ffffff',
                  borderWidth: 1
                }
              },
              // 确保无数据省份不显示
              select: {
                itemStyle: { areaColor: 'transparent', borderColor: 'transparent' }
              }
            }]
          };

          // 渲染图表
          mapChart.setOption(option);
          return true;
        });
    })
    .catch(error => {
      console.error('地域热力图初始化失败：', error);
      // 加载失败降级显示
      const errorHtml = `<div class="flex items-center justify-center h-full text-gray-500 text-sm">
                          地图加载失败：${error.message}<br>
                          请检查网络或cases.json字段
                        </div>`;
      document.getElementById('areaChart').innerHTML = errorHtml;
    });

  // ---------------------- 窗口大小变化时自适应 ----------------------
  window.addEventListener('resize', function() {
    if (mapLoaded) {
      mapChart.resize();
    }
  });

  // ---------------------- 销毁图表（防止内存泄漏） ----------------------
  window.addEventListener('beforeunload', function() {
    if (mapLoaded) {
      mapChart.dispose();
    }
  });
});
