// 等待页面加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 初始化ECharts实例
  const myChart = echarts.init(document.getElementById('areaChart'));

  // 地区案件数据（省份+案件数）
  const areaData = [
    { name: '北京', value: 28 },
    { name: '上海', value: 22 },
    { name: '辽宁', value: 15 },
    { name: '广东', value: 12 },
    { name: '浙江', value: 8 },
    { name: '四川', value: 7 },
    { name: '江苏', value: 5 },
    { name: '山东', value: 4 },
    { name: '湖北', value: 3 },
    { name: '湖南', value: 2 },
    { name: '其他', value: 12 } // 合并案件数<3的省份
  ];

  // 加载中国地图JSON数据（ECharts官方地图）
  fetch('https://cdn.jsdelivr.net/npm/china-echarts-js@1.0.0/china.json')
    .then(response => response.json())
    .then(geoJson => {
      // 注册地图
      echarts.registerMap('china', geoJson);

      // 配置选项
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            const total = 108;
            const percentage = ((params.value / total) * 100).toFixed(1) + '%';
            return `${params.name}：${params.value}件（${percentage}）`;
          }
        },
        visualMap: {
          min: 0,
          max: 30, // 最大值设为北京的28，留一点余量
          left: 'left',
          top: 'bottom',
          text: ['案件数多', '案件数少'],
          calculable: true,
          inRange: {
            color: ['#e0f7fa', '#b2ebf2', '#80deea', '#4dd0e1', '#26c6da', '#00bcd4', '#00acc1', '#0097a7', '#00838f', '#E53E3E'] // 颜色梯度（从浅到红）
          }
        },
        series: [
          {
            name: '医美纠纷案件数',
            type: 'map',
            mapType: 'china',
            roam: false, // 禁止缩放平移
            label: {
              show: true, // 显示省份名称
              fontSize: 10
            },
            data: areaData,
            emphasis: {
              label: {
                color: '#fff'
              },
              itemStyle: {
                areaColor: '#E53E3E'
              }
            }
          }
        ]
      };

      // 渲染图表
      myChart.setOption(option);

      // 响应式适配窗口大小变化
      window.addEventListener('resize', function() {
        myChart.resize();
      });
    })
    .catch(error => {
      console.error('地图加载失败：', error);
      // 失败降级为文字提示
      document.getElementById('areaChart').innerHTML = '<p class="text-center text-gray-500">地图加载失败，请刷新页面重试</p>';
    });
});
