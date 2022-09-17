let lastTab = {}

const getCurrentTab = async function () {
  let queryOptions = { active: true, lastFocusedWindow: true }

  return await chrome.tabs.query(queryOptions).then((tab) => {
    return tab && tab.length > 0 ? tab[0] : null
  })
}

const getHistory = async function () {
  return await chrome.storage.local.get(['history']).then((result) => {
    return result.history
  })
}

function clearMenus () {
  // chrome.contextMenus.remove(
  //   'saveTab'
  //  )
  // chrome.contextMenus.remove(
  //    'deleteTab'
  //   )
}

const updateContextMenu = function (url) {
  return getHistory().then((linksHistory) => {
    if (!linksHistory || linksHistory.filter(x => x.url === url).length === 0) {
      chrome.action.setBadgeText({ text: '' })

      clearMenus()

      chrome.contextMenus.removeAll(function () {
        chrome.contextMenus.create({
          id: 'saveTab',
          title: 'Сохранить в Links Holder',
          type: 'normal',
          contexts: ['page'],
          visible: true
        })
      })
    } else {
      chrome.action.setBadgeText({ text: 'ok' })

      clearMenus()

      chrome.contextMenus.removeAll(function () {
        chrome.contextMenus.create({
          id: 'deleteTab',
          title: 'Сохранено Links Holder',
          type: 'normal',
          contexts: ['page'],
          visible: true
        })
      })
    }
  })
}

const saveUrl = function (request) {
  return getHistory()
    .then(async (linksHistory) => {
      if (!Array.isArray(linksHistory)) {
        linksHistory = []
      }

      if (linksHistory.find(x => x.url === request.url) === undefined) {
        linksHistory.push({
          url: request.url,
          title: request.title,
          favIconUrl: request.favIconUrl,
          timestamp: Date.now()
        })
        chrome.storage.local.set({ 'history': linksHistory })

        return true
      }

      return false
    })
}

const saveTab = async function (tab) {
  return await getHistory().then(async (linksHistory) => {
    if (!Array.isArray(linksHistory)) {
      linksHistory = []
    }

    if (linksHistory.filter(x => x.url === tab.url).length === 0) {
      linksHistory.push({ 'url': tab.url, title: tab.title, 'timestamp': Date.now(), favIconUrl: tab.favIconUrl })
      chrome.storage.local.set({ 'history': linksHistory })
      console.log('saveTab')
    }

    chrome.action.setBadgeText({ text: 'ok' })

    await updateContextMenu(tab.url)
  })
}

const deleteTab = async function (url) {
  return await getHistory().then(async (linksHistory) => {
    if (url) {
      if (!Array.isArray(linksHistory)) {
        linksHistory = []
      }

      linksHistory = linksHistory.filter(x => x.url !== url)
    } else {
      linksHistory = []
    }

    chrome.storage.local.set({ 'history': linksHistory })
    chrome.action.setBadgeText({ text: '' })

    await updateContextMenu(url)
  })
}
const clearHistory = async function () {
  chrome.storage.local.set({ 'history': [] })
  chrome.action.setBadgeText({ text: '' })

  await updateContextMenu(null)
}


chrome.action.onClicked.addListener(function (tab) {
  const linksHistory = []
})

chrome.commands.onCommand.addListener((command) => {
  if (command === 'save-links') {
    getCurrentTab().then(async (tab) => {
      await saveTab(tab)
    })
  }
})

function clickMenuHandler (info, tab) {
  if (info.menuItemId === 'saveTab') {
    saveTab(tab)
      .then(r => {
      })
  }

  if (info.menuItemId === 'deleteTab') {
  }
}

chrome.runtime.onInstalled.addListener(() => {
})

chrome.contextMenus.onClicked.addListener(clickMenuHandler)

chrome.tabs.onActivated.addListener((activeInfo) => {
  getCurrentTab().then((tab) => {
    lastTab = tab
    console.log('check', lastTab)
    updateContextMenu(tab.url)
  })
})

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.type === 'saveUrl') {
      saveUrl(request)
        .then((copied) => {
          sendResponse({ copied: copied })
        })

      return true
    }

    if (request.type === 'deleteTab') {
      deleteTab(request.url)
        .then(() => {
          sendResponse({})
        })

      return true
    }

    if (request.type === 'clearHistory') {
      clearHistory().then(() => {
        sendResponse({})
      })
      return true
    }

    if (request.type === 'saveTab') {
      getCurrentTab().then((tab) => {
        saveTab(tab)
          .then(() => {
            sendResponse({})
          })
      })

      return true
    }
  }
)
