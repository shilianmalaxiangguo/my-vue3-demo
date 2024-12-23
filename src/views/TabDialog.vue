<template>
  <div>
    <el-button type="primary" @click="dialogVisible = true">打开 Tab Dialog</el-button>

    <el-dialog
      v-model="dialogVisible"
      title="Tab Dialog"
      width="80%"
      style="min-height: 70vh;"
      :destroy-on-close="true"
      class="flex flex-col tab-dialog"
    >
      <el-tabs class="root" v-model="activeTab">
        <el-tab-pane label="数据列表" name="first" style="height: 100%;border: 1px solid red;">
          <div class="flex flex-col h-full">
            <!-- 搜索区域 -->
            <div class="mb-4 shrink-0">
              <el-form :inline="true">
                <el-form-item label="搜索">
                  <el-input v-model="searchText" placeholder="请输入关键词" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleSearch">搜索</el-button>
                </el-form-item>
              </el-form>
            </div>
            
            <!-- <div class="h-0 flex-auto overflow-y-auto"> -->
            <div class="flex-1 overflow-y-auto">
              <el-table
                :data="tableData"
                style="width: 100%; height: 100%"
              >
                <el-table-column prop="date" label="日期" />
                <el-table-column prop="name" label="姓名" />
                <el-table-column prop="address" label="地址" />
              </el-table>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="其他内容" name="second">
          <div>这是第二个 tab 的内容</div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({
  name: 'TabDialog'
})

const dialogVisible = ref(false)
const activeTab = ref('first')
const searchText = ref('')
const tableData = ref([
  {
    date: '2024-03-01',
    name: '张三',
    address: '北京市朝阳区'
  },
  {
    date: '2024-03-02', 
    name: '李四',
    address: '上海市浦东新区'
  },
  {
    date: '2024-03-03',
    name: '王五',
    address: '广州市天河区'
  },
  {
    date: '2024-03-04',
    name: '赵六',
    address: '深圳市南山区'
  },
  {
    date: '2024-03-05',
    name: '孙七',
    address: '成都市武侯区'
  },
  {
    date: '2024-03-06',
    name: '周八',
    address: '杭州市西湖区'
  },
  {
    date: '2024-03-07',
    name: '吴九',
    address: '南京市鼓楼区'
  },
  {
    date: '2024-03-08',
    name: '郑十',
    address: '武汉市江汉区'
  },
  {
    date: '2024-03-09',
    name: '陈一',
    address: '重庆市渝中区'
  },
  {
    date: '2024-03-10',
    name: '林二',
    address: '西安市雁塔区'
  },
  {
    date: '2024-03-11',
    name: '黄三',
    address: '苏州市姑苏区'
  },
  {
    date: '2024-03-12',
    name: '刘四',
    address: '天津市和平区'
  },
  {
    date: '2024-03-13',
    name: '张五',
    address: '青岛市市南区'
  },
  {
    date: '2024-03-14',
    name: '王六',
    address: '大连市中山区'
  },
  {
    date: '2024-03-15',
    name: '李七',
    address: '厦门市思明区'
  },
  {
    date: '2024-03-16',
    name: '赵八',
    address: '济南市历下区'
  },
  {
    date: '2024-03-17',
    name: '钱九',
    address: '长沙市岳麓区'
  },
  {
    date: '2024-03-18',
    name: '孙十',
    address: '福州市鼓楼区'
  },
  {
    date: '2024-03-19',
    name: '周一',
    address: '合肥市蜀山区'
  },
  {
    date: '2024-03-20',
    name: '吴二',
    address: '南昌市东湖区'
  },
  {
    date: '2024-03-21',
    name: '郑三',
    address: '贵阳市南明区'
  },
  {
    date: '2024-03-22',
    name: '王四',
    address: '昆明市五华区'
  },
  {
    date: '2024-03-23',
    name: '冯五',
    address: '哈尔滨市南岗区'
  },
  {
    date: '2024-03-24',
    name: '陈六',
    address: '长春市南关区'
  },
  {
    date: '2024-03-25',
    name: '楚七',
    address: '沈阳市和平区'
  },
  {
    date: '2024-03-26',
    name: '魏八',
    address: '石家庄市长安区'
  },
  {
    date: '2024-03-27',
    name: '蒋九',
    address: '太原市小店区'
  },
  {
    date: '2024-03-28',
    name: '沈十',
    address: '郑州市金水区'
  },
  {
    date: '2024-03-29',
    name: '韩一',
    address: '兰州市城关区'
  },
  {
    date: '2024-03-30',
    name: '杨二',
    address: '银川市兴庆区'
  }
])

const handleSearch = () => {
  console.log('搜索:', searchText.value)
}
</script>

<style lang="scss" >
.root {
    /**
    这里不能用 flex: 1 替换的原因是：
    .root 是 el-tabs 组件的根元素，它需要先将自身高度设置为 0（height: 0），然后通过 flex: auto 来适应内容
    这里的 flex: auto（即 flex: 1 1 auto）会考虑内容的实际大小
    如果改成 flex: 1（即 flex: 1 1 0%），由于 flex-basis: 0%，可能会导致内容被压缩，tabs 的布局会出问题 
    */
    
  flex: auto;
  height: 0;
  display: flex;
  flex-direction: column-reverse;
  border: 1px solid rgb(30, 255, 0);
}
</style>

<style lang="scss">
.tab-dialog {
  .el-dialog__body {
    display: flex !important;
    flex-direction: column !important;
    /**
    这里可以用 flex: 1 替换的原因是：
    .el-dialog__body 是对话框的内容区域，它的作用是填充剩余空间
    在这个场景下，我们不需要考虑内容的初始大小，只需要它填满剩余空间
    因此 flex: 1 的行为（flex-basis: 0%）正好符合需求
    */
    // flex: auto;
    // height: 0;
    flex: 1;
  }
}
/**
当元素需要考虑其内部组件的布局特性时（如 tabs 组件），使用 flex: auto + height: 0 更合适
当元素只需要简单地填充剩余空间时，使用 flex: 1 更合适
这就是为什么在 .root 中使用 flex: auto + height: 0，而在 .tab-dialog 中使用 flex: 1 的原因  
*/
</style>