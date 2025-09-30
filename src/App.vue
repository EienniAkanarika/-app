<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
    
    // 应用启动时同步删除记录
    this.syncDeletedClothes()
  },
  onShow: function () {
    console.log('App Show')
    
    // 应用前台显示时同步删除记录
    this.syncDeletedClothes()
  },
  onHide: function () {
    console.log('App Hide')
  },
  methods: {
    // 同步删除记录
    syncDeletedClothes() {
      // 确保uni.$syncDeletedClothes已注册
      if (uni.$syncDeletedClothes) {
        console.log('开始同步删除记录...')
        uni.$syncDeletedClothes().then(result => {
          if (result.success) {
            console.log('删除记录同步成功, 共有', result.deletedIds.length, '条记录')
          } else {
            console.error('删除记录同步失败:', result.error)
          }
        })
      }
    }
  }
}
</script>

<style>
/*每个页面公共css */
</style>
