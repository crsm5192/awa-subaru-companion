import { app, BrowserWindow } from 'electron'
import { createMainWindow, getMainWindow } from './window'
import { createTray } from './tray'
import { registerIpc } from './ipc'
import { getConfig } from './config'

// 单实例锁：桌面宠物只需要一个进程
const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const win = getMainWindow()
    if (win) {
      win.show()
      win.focus()
    }
  })

  app.whenReady().then(() => {
    // 先加载配置，后面 IPC 处理器都依赖它
    getConfig()
    registerIpc()

    const win = createMainWindow()
    createTray()

    // 根据配置应用点击穿透
    if (getConfig().pet.clickThrough) {
      win.setIgnoreMouseEvents(true, { forward: true })
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
  })
}

// 桌面宠物常驻：关闭窗口默认隐藏而非退出，从托盘「退出」才真正退出
app.on('window-all-closed', () => {
  // 故意留空 —— 不调用 app.quit()
})
