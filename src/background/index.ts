chrome.commands.onCommand.addListener((command) => {
  if (command !== 'open_panel') {
    return
  }

  chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
    if (!activeTab?.id) {
      return
    }

    chrome.tabs.sendMessage(
      activeTab.id,
      { action: 'open_panel' },
      () => {
        if (chrome.runtime.lastError) {
          console.warn('[FastTools] sendMessage failed:', chrome.runtime.lastError.message)
        }
      },
    )
  })
})
