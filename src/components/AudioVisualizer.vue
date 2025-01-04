<template>
  <div class="flex flex-col h-full p-4 bg-[#f8f9fe] relative">
    <!-- Hi-Fi Logo -->
    <div class="absolute top-4 right-4 w-12 h-12 z-10">
      <img 
        :src="HiFiLogo"
        alt="Hi-Fi Audio" 
        class="w-full h-full object-contain opacity-90 hover:opacity-100 transition-opacity"
      />
    </div>

    <div class="mb-4">
      <h2 class="text-xl mb-4 text-[#666]">音频可视化</h2>
      <div class="flex flex-col gap-4">
        <!-- 播放控制区域 -->
        <div class="flex items-center gap-4">
          <el-button 
            type="primary" 
            @click="togglePlay"
            :loading="loading"
            :icon="isPlaying ? VideoPause : VideoPlay"
            class="clean-button"
          >
            {{ isPlaying ? '暂停' : '播放' }}
          </el-button>
          
          <!-- 音量控制 -->
          <div class="flex items-center gap-2">
            <el-icon class="text-gray-500"><Headset /></el-icon>
            <el-slider 
              v-model="volume" 
              :max="100" 
              :min="0"
              class="!w-[200px] shrink-0"
              @change="handleVolumeChange"
            />
            <span class="text-xs text-gray-500">音量</span>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="flex items-center gap-4">
          <span class="text-xs text-gray-500 w-12">{{ formatTime(currentTime) }}</span>
          <el-slider 
            v-model="currentTime"
            :max="duration"
            :min="0"
            :format-tooltip="formatTime"
            class="flex-1"
            @input="handleTimeChange"
          />
          <span class="text-xs text-gray-500 w-12">{{ formatTime(duration) }}</span>
        </div>

        <!-- 输出模式选择 -->
        <!-- <div class="flex items-center gap-2">
          <el-select 
            v-model="state.outputMode"
            size="small"
            @change="toggleOutputMode"
          >
            <el-option label="标准输出" value="default" />
            <el-option label="独占输出" value="exclusive" />
          </el-select>
        </div> -->
      </div>
    </div>
    
    <div class="mt-4 bg-white rounded-lg p-4 shadow-sm">
      <div class="flex items-center gap-4 mb-4">
        <h3 class="text-sm font-medium text-gray-700">均衡器</h3>
        <el-switch
          v-model="eqEnabled"
          active-text="开启"
          inactive-text="关闭"
          @change="toggleEQ"
        />
        <el-select 
          v-model="selectedPreset"
          size="small"
          @change="applyPreset"
          style="width: 300px"
          :disabled="!eqEnabled"
        >
          <el-option label="默认" value="default" />
          <el-option label="流行" value="pop" />
          <el-option label="摇滚" value="rock" />
          <el-option label="电子" value="electronic" />
          <el-option label="R&B" value="rnb" />
          <el-option label="蓝调" value="blues" />
          <el-option label="重金属" value="metal" />
        </el-select>
      </div>
      <div class="grid grid-cols-10 gap-1 px-8">
        <div 
          v-for="(eq, index) in state.eqGains" 
          :key="index"
          class="flex flex-col items-center"
        >
          <el-slider
            v-model="eq.gain"
            :min="-12"
            :max="12"
            vertical
            height="150px"
            @change="(val) => updateEQGain(index, val)"
            :disabled="!eqEnabled"
            class="eq-slider"
          />
          <span class="text-xs text-gray-500 mt-2">{{ formatFreq(eq.freq) }}</span>
        </div>
      </div>
    </div>
    
    <div class="flex-1 min-h-[300px] bg-white rounded-lg overflow-hidden relative shadow-sm">
      <canvas 
        ref="canvas"
        class="w-full h-full"
      ></canvas>
    </div>
  </div>
</template>

<script setup>
import { reactive, toRefs, onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
import { VideoPlay, VideoPause, Headset } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import  HiFiLogo  from '@/assets/hifi.jpg'

const state = reactive({
  canvas: null,
  audioContext: null,
  analyser: null,
  source: null,
  audio: null,
  isPlaying: false,
  volume: 80,
  loading: false,
  animationId: null,
  currentTime: 0,
  duration: 0,
  timeUpdateInterval: null,
  eqNodes: [], // 存储均衡器滤波器节点
  eqGains: [   // 默认的 EQ 增益值
    { freq: 31, gain: 0 },     // Sub Bass
    { freq: 63, gain: 0 },     // Bass
    { freq: 125, gain: 0 },    // Low Mid
    { freq: 250, gain: 0 },    // Mid
    { freq: 500, gain: 0 },    // High Mid
    { freq: 1000, gain: 0 },   // Presence (1kHz)
    { freq: 2000, gain: 0 },   // High (2kHz)
    { freq: 4000, gain: 0 },   // Brilliance (4kHz)
    { freq: 8000, gain: 0 },   // High Top (8kHz)
    { freq: 16000, gain: 0 },  // Air (16kHz)
  ],
  outputMode: 'default', // 'default' | 'exclusive'
  eqEnabled: true,
  selectedPreset: 'default', // 当前选择的 EQ 预设
  eqPresets: {
    default: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    pop: [0, 2, 4, 4, 0, -2, -2, 0, 2, 4],
    rock: [4, 2, 0, -2, -2, 0, 2, 4, 4, 2],
    electronic: [4, 4, 0, -2, -4, 0, 4, 4, 2, 0],
    rnb: [0, 2, 4, 0, -2, -2, 0, 2, 4, 0],
    blues: [2, 0, -2, 0, 2, 4, 2, 0, -2, -4],
    metal: [4, 4, 0, -4, -4, 0, 4, 4, 2, 0]
  }
})

const { canvas, isPlaying, volume, loading, currentTime, duration, eqEnabled, selectedPreset } = toRefs(state)

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 处理时间更新
const handleTimeChange = (value) => {
  if (state.audio) {
    state.audio.currentTime = value
  }
}

// 更新音频时间
const updateTime = () => {
  if (state.audio) {
    state.currentTime = state.audio.currentTime
    state.duration = state.audio.duration || 0
  }
}

const initAudio = async () => {
  try {
    const audioUrl = '/audio/grapes.mp3'
    
    // 创建音频上下文
    state.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    state.analyser = state.audioContext.createAnalyser()
    state.analyser.fftSize = 1024
    
    // 创建音频元素
    state.audio = new Audio(audioUrl)
    state.audio.loop = true
    
    // 设置初始音量 (转换为 0-1 范围)
    state.audio.volume = state.volume / 100
    
    // 等待音频加载
    await new Promise((resolve, reject) => {
      state.audio.oncanplaythrough = resolve
      state.audio.onerror = reject
    })
    
    // 创建源节点
    state.source = state.audioContext.createMediaElementSource(state.audio)
    
    // 连接节点
    if (state.eqEnabled) {
      initEQ()
    } else {
      state.source.connect(state.analyser)
      state.analyser.connect(state.audioContext.destination)
    }
    
    // 添加时间更新监听
    state.audio.addEventListener('timeupdate', updateTime)
    
    // 开始绘制
    draw()
    
  } catch (error) {
    console.error('初始化音频失败:', error)
    ElMessage.error('初始化音频失败: ' + error.message)
  }
}

const draw = () => {
  if (!canvas.value || !state.analyser) return
  
  const ctx = canvas.value.getContext('2d')
  const width = canvas.value.width
  const height = canvas.value.height
  
  // 获取频率数据
  const bufferLength = state.analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  state.analyser.getByteFrequencyData(dataArray)
  
  // 清空画布
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  
  // 创建主体渐变
  const gradient = ctx.createLinearGradient(0, height, 0, 0)
  gradient.addColorStop(0, '#8B5CF6')   // 底部紫色
  gradient.addColorStop(0.8, '#3B82F6')  // 上部蓝色
  gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)')  // 顶部透明
  
  // 数据处理和平滑
  const groupSize = 4
  const smoothedData = []
  const groups = Math.floor(bufferLength / groupSize)
  
  // 对数据进行分组和平均，并应用音量系数
  const volumeScale = Math.max(0.1, state.volume / 100) // 确保音量系数不为0
  for (let i = 0; i < groups; i++) {
    let sum = 0
    for (let j = 0; j < groupSize; j++) {
      sum += dataArray[i * groupSize + j]
    }
    // 即使在静音时也保持一定的可视化效果
    const baseValue = sum / groupSize
    smoothedData[i] = baseValue * volumeScale + (baseValue > 0 ? 10 : 0)
  }
  
  // 应用平滑算法，使顶部更加平滑
  for (let i = 1; i < smoothedData.length - 1; i++) {
    smoothedData[i] = (smoothedData[i - 1] + smoothedData[i] * 2 + smoothedData[i + 1]) / 4
  }
  
  // 计算柱状图参数
  const centerX = width / 2
  const barCount = Math.floor(groups / 2)
  const barWidth = (width * 0.4) / barCount
  const barGap = barWidth * 0.2
  
  // 绘制中心对称的柱状图
  for (let i = 0; i < barCount; i++) {
    // 使用对数计算使频谱更加均匀，并确保有最小高度
    const value = Math.log10(smoothedData[i] + 1) / Math.log10(256)
    const minHeight = height * 0.05 // 最小高度为画布高度的 5%
    const barHeight = Math.max(minHeight, value * height * 0.7)
    
    // 计算左右两边的x坐标
    const leftX = centerX - (i + 1) * (barWidth + barGap)
    const rightX = centerX + i * (barWidth + barGap)
    
    // 绘制左右两边的柱子
    drawBar(ctx, leftX, height, barWidth, barHeight, gradient)
    drawBar(ctx, rightX, height, barWidth, barHeight, gradient)
  }
  
  state.animationId = requestAnimationFrame(draw)
}

// 绘制单个柱子的函数
const drawBar = (ctx, x, height, barWidth, barHeight, gradient) => {
  // 绘制主体柱子（长方形，不带圆角）
  ctx.fillStyle = gradient
  ctx.fillRect(x, height - barHeight, barWidth, barHeight)
  
  // 添加顶部渐变效果
  const topGradient = ctx.createLinearGradient(0, height - barHeight - 15, 0, height - barHeight)
  topGradient.addColorStop(0, 'rgba(139, 92, 246, 0)')  // 完全透明
  topGradient.addColorStop(1, 'rgba(139, 92, 246, 0.2)')  // 半透明紫色
  
  ctx.fillStyle = topGradient
  ctx.fillRect(x, height - barHeight - 15, barWidth, 15)
  
  // 添加顶部边缘线
  ctx.beginPath()
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)'
  ctx.lineWidth = 1
  ctx.moveTo(x, height - barHeight)
  ctx.lineTo(x + barWidth, height - barHeight)
  ctx.stroke()
}

const togglePlay = async () => {
  try {
    state.loading = true
    if (!state.audioContext) {
      await initAudio()
    }
    
    if (state.isPlaying) {
      state.audio.pause()
      state.isPlaying = false
    } else {
      await state.audio.play()
      state.isPlaying = true
    }
  } catch (error) {
    console.error('播放失败:', error)
    ElMessage.error('播放失败: ' + error.message)
  } finally {
    state.loading = false
  }
}

const handleVolumeChange = (value) => {
  if (state.audio) {
    // 将百分比值转换为 0-1 范围
    const normalizedVolume = value / 100
    state.audio.volume = normalizedVolume
    state.volume = value // 保存当前音量值
  }
}

const resizeCanvas = () => {
  if (canvas.value) {
    canvas.value.width = canvas.value.offsetWidth
    canvas.value.height = canvas.value.offsetHeight
  }
}

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
})

onBeforeUnmount(() => {
  if (state.animationId) {
    cancelAnimationFrame(state.animationId)
  }
  if (state.audioContext) {
    state.audioContext.close()
  }
  if (aplayer.value) {
    aplayer.value.pause()
  }
  window.removeEventListener('resize', resizeCanvas)
})

// Initialize EQ nodes
const initEQ = () => {
  if (!state.audioContext || !state.source) return
  
  // 清除现有的 EQ 节点
  disconnectEQ()
  state.eqNodes = []
  
  // 断开现有连接
  state.source.disconnect()
  
  // 创建新的 EQ 节点链
  let lastNode = state.source
  
  state.eqGains.forEach(({ freq, gain }) => {
    const filter = state.audioContext.createBiquadFilter()
    filter.type = 'peaking'
    filter.frequency.value = freq
    filter.gain.value = gain
    filter.Q.value = 1
    
    lastNode.connect(filter)
    state.eqNodes.push(filter)
    lastNode = filter
  })
  
  // 连接最后一个节点到分析器
  lastNode.connect(state.analyser)
  state.analyser.connect(state.audioContext.destination)
}

// Update EQ gain values
const updateEQGain = (index, value) => {
  if (!state.eqEnabled) return
  
  state.eqGains[index].gain = value
  if (state.eqNodes[index]) {
    state.eqNodes[index].gain.value = value
  }
}

// Toggle EQ
const toggleEQ = () => {
  if (!state.source || !state.analyser) return;
  
  if (!state.eqEnabled) {
    // 启用 EQ
    initEQ();
    applyPreset();
  } else {
    // 禁用 EQ
    disconnectEQ();
    // 重新建立基本连接
    state.source.connect(state.analyser);
    state.analyser.connect(state.audioContext.destination);
  }
}

// 修改 disconnectEQ 函数
const disconnectEQ = () => {
  if (state.eqNodes.length > 0) {
    // 断开所有节点的连接
    state.source.disconnect();
    state.eqNodes.forEach(node => {
      node.disconnect();
    });
    state.eqNodes = []; // 清空 EQ 节点数组
  }
}

// Add output mode switch function
const toggleOutputMode = async () => {
  try {
    if (state.audioContext) {
      await state.audioContext.close()
    }
    
    // Create new audio context, try using low latency mode
    const contextOptions = {
      latencyHint: state.outputMode === 'exclusive' ? 'interactive' : 'playback',
      sampleRate: 48000
    }
    
    state.audioContext = new (window.AudioContext || window.webkitAudioContext)(contextOptions)
    
    // Reinitialize audio processing chain
    await initAudio()
  } catch (error) {
    console.error('切换输出模式失败:', error)
    ElMessage.error('切换输出模式失败: ' + error.message)
  }
}

// 添加一个格式化频率显示的函数
const formatFreq = (freq) => {
  if (freq >= 1000) {
    return `${freq/1000}k`
  }
  return freq
}

// 应用选定的 EQ 预设
const applyPreset = () => {
  if (!state.eqEnabled) return
  
  const presetGains = state.eqPresets[state.selectedPreset]
  state.eqGains.forEach((eq, index) => {
    eq.gain = presetGains[index]
  })
  
  // 更新 EQ 节点的增益值
  state.eqNodes.forEach((node, index) => {
    if (node) {
      node.gain.value = presetGains[index]
    }
  })
}

// 添加新的事件处理函数
const handlePlay = async () => {
  try {
    if (!state.audioContext) {
      // 等待 DOM 更新
      await nextTick()
      await initAudio()
    }

    // 确保音频上下文状态正确
    if (state.audioContext?.state === 'suspended') {
      await state.audioContext.resume()
    }

    if (aplayer.value) {
      try {
        // 直接使用 aplayer 的播放方法
        await aplayer.value.play()
        state.isPlaying = true
      } catch (error) {
        console.error('APlayer 播放失败:', error)
        // 尝试直接控制音频元素
        const audio = aplayer.value.$el.querySelector('audio')
        if (audio) {
          await audio.play()
          state.isPlaying = true
        }
      }
    }
  } catch (error) {
    console.error('播放失败:', error)
    ElMessage.error('播放失败，请检查音频文件是否存在')
  }
}

const handlePause = () => {
  try {
    if (aplayer.value) {
      aplayer.value.pause()
    }
    state.isPlaying = false
  } catch (error) {
    console.error('暂停失败:', error)
  }
}

const handleTimeUpdate = (currentTime) => {
  state.currentTime = currentTime
  // 如果需要，可以在这里更新其他状态
}
</script>

<style scoped>
.clean-button {
  background: linear-gradient(135deg, #8B5CF6, #3B82F6) !important;
  border: none !important;
  box-shadow: 0 2px 12px rgba(139, 92, 246, 0.15) !important;
  transition: all 0.3s ease !important;
}

.clean-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3) !important;
}

:deep(.el-slider__runway) {
  background-color: #e2e8f0 !important;
}

:deep(.el-slider__bar) {
  background: linear-gradient(90deg, #8B5CF6, #3B82F6) !important;
}

:deep(.el-slider__button) {
  border: 2px solid #8B5CF6 !important;
  background: white !important;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
}

/* 进度条样式优化 */
:deep(.el-slider) {
  --el-slider-button-size: 12px;
}

/* 音量滑块样式优化 */
.volume-slider :deep(.el-slider__button) {
  --el-slider-button-size: 10px;
}

/* EQ 滑块样式 */
:deep(.eq-slider .el-slider__runway) {
  width: 8px !important;
  background-color: #f0f0f0 !important;
}

:deep(.eq-slider .el-slider__bar) {
  width: 8px !important;
  background: linear-gradient(0deg, #8B5CF6, #3B82F6) !important;
}

:deep(.eq-slider .el-slider__button-wrapper) {
  width: 24px !important;
  height: 24px !important;
  left: -8px !important;
}

:deep(.eq-slider .el-slider__button) {
  width: 16px !important;
  height: 16px !important;
  border: 2px solid #8B5CF6 !important;
  background: white !important;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
}

/* 调整滑块容器样式 */
.grid {
  //margin: 0 auto;
  max-width: 800px;
}

.eq-container {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

/* 添加 APlayer 自定义样式 */
:deep(.aplayer) {
  background: transparent;
}

:deep(.aplayer .aplayer-pic) {
  background-color: #8B5CF6;
}

:deep(.aplayer .aplayer-info .aplayer-controller .aplayer-bar-wrap .aplayer-bar .aplayer-played) {
  background: #8B5CF6 !important;
}

:deep(.aplayer .aplayer-info .aplayer-controller .aplayer-bar-wrap .aplayer-bar .aplayer-played .aplayer-thumb) {
  background: #8B5CF6 !important;
}
</style> 