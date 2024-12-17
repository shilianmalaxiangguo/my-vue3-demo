<template>
    <el-tabs v-model="activeTab" @tab-change="handleTabClick">
      <el-tab-pane label="标签1" name="tab1">
        标签1的内容
      </el-tab-pane>
      <el-tab-pane label="标签2" name="tab2">
        <el-tree
          ref="treeRef"
          :data="treeData"
          show-checkbox
          :default-checked-keys="checkedKeys"
          node-key="id"
        />
      </el-tab-pane>
    </el-tabs>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  defineOptions({
    name: 'Tab'
  })
  const activeTab = ref('tab1') // 默认显示第一个标签
  const checkedKeys = ref([])
  const treeRef = ref(null)
  const treeData = ref([]) // 将 treeData 变为 ref
  
  // 模拟请求获取随机的 treeData
  const fetchTreeData = async () => {
    // 模拟异步请求
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 随机生成 treeData
    const generateRandomTree = (depth = 0, parentId = 0) => {
      if (depth >= 3) return null; // 最大深度为3
      
      const numNodes = Math.floor(Math.random() * 3) + 1; // 1-3个节点
      const nodes = [];
      
      for (let i = 0; i < numNodes; i++) {
        const id = parentId * 100 + i + 1;
        const node = {
          id,
          label: `节点 ${id}`,
        };
        
        if (depth < 2) { // 只在前两层生成子节点
          const children = generateRandomTree(depth + 1, id);
          if (children) {
            node.children = children;
          }
        }
        
        nodes.push(node);
      }
      
      return nodes;
    };
    
    treeData.value = generateRandomTree();
  }
  
  // 修改 getRandomCheckedKeys 函数
  const getRandomCheckedKeys = async () => {
    // 使用 Tree 组件的方法清空选中状态
    treeRef.value?.setCheckedKeys([])
    console.log('清空所有勾选项')
    
    // 模拟异步请求
    await new Promise(resolve => setTimeout(resolve, 2000))
    await fetchTreeData()
    // 获取所有可能的id
    const allIds = getAllIds(treeData.value)
    console.log(allIds)
    // 随机选择2-3个id
    const count = Math.floor(Math.random() * 2) + 2 // 随机生成2或3
    const selectedIds = []
    
    while (selectedIds.length < count) {
      const randomId = allIds[Math.floor(Math.random() * allIds.length)]
      if (!selectedIds.includes(randomId)) {
        selectedIds.push(randomId)
      }
    }
    
    checkedKeys.value = selectedIds
  }
  
  // 辅助方法：获取树中所有节点的id
  const getAllIds = (data) => {
    let ids = []
    data.forEach(item => {
      ids.push(item.id)
      if (item.children) {
        ids = ids.concat(getAllIds(item.children))
      }
    })
    return ids
  }
  
  // 处理标签点击事件
  const handleTabClick = (tab) => {
    console.log('handleTabClick',tab)
    if (tab === 'tab2') {
      getRandomCheckedKeys()
    }
  }
  
  // 组件挂载时初始化
  onMounted(async () => {
    await fetchTreeData() // 获取随机的 treeData
    if (activeTab.value === 'tab2') {
      getRandomCheckedKeys()
    }
  })
  </script> 