function saveLink (linkTag) {
    let href = '',
        title = ''
        favIconUrl = ''

    if (!linkTag.hasAttribute('href')) {
        return
    }

    if (linkTag.getAttribute('href').includes('http')) {
        href = linkTag.getAttribute('href')
    } else {
        href = (window.location.origin + '/' + linkTag.getAttribute('href')).replaceAll('//', '/')
    }

    if (linkTag.hasAttribute('title') && linkTag.getAttribute('title') !== '') {
        title = linkTag.getAttribute('title')
    } else if (linkTag.textContent !== '') {
        title = linkTag.textContent
    }

    const foundIconMetaTags = document.querySelectorAll('[rel*="icon"]')

    if (foundIconMetaTags.length > 0) {
        const lastIconTag = [].slice.call(foundIconMetaTags).pop()

        favIconUrl = lastIconTag.getAttribute('href') || ''

        if (!favIconUrl.includes('http')) {
            favIconUrl = (window.location.origin + '/' + favIconUrl).replaceAll('//', '/')
        }
    }

    chrome.runtime.sendMessage({
        type: 'saveUrl',
        url:  href,
        title: title,
        favIconUrl: favIconUrl,
        timestamp: Date.now()
    })
      .then((response)=> {})
}

document.addEventListener('click', function (event) {
    let foundLinkTag = null

    if (!event.shiftKey) {
        return
    }

    try {
        foundLinkTag = event.target.closest('A')

        if (!foundLinkTag) {
            return
        }

        event.preventDefault()
        saveLink(foundLinkTag)
    } catch (err) {
        console.error(err.message)
    }
}, false)
