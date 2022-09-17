const css = `
.link-copied-notify {
  display: block;
  top: 5px;
  right: 5px;
  position: fixed;
  padding: 0 5px;
  background: rgb(222, 255, 88);
  transition: 0.6s easy;
  border: 1px solid #444;
  color: black;
  box-shadow: 1px 1px 3px 0px black;
  z-index: 10000
}

.notify-fade-out {
  animation: fadeOut .6s;
}
@keyframes fadeOut {
  100% { opacity: 0; }
  80% { opacity: 1; }
  0% { opacity: 1; }
}
`

const head = document.head || document.querySelector('head'),
  style = document.createElement('style');

head.appendChild(style);

style.type = 'text/css';
if (style.styleSheet){
  // This is required for IE8 and below.
  style.styleSheet.cssText = css;
} else {
  style.appendChild(document.createTextNode(css));
}

function saveLink (linkTag) {
  let href = '',
      title = '',
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
    .then((r)=> {
      if (r.copied === false) {
        return
      }

      const highlightDiv = document.createElement('div')

      if(document.body != null){
        document.body.appendChild(highlightDiv);
      }

      highlightDiv.classList.add('link-copied-notify', 'notify-fade-out')
      highlightDiv.innerText = `Link copied: ${href}`

      setTimeout(() => {
        document.body.removeChild(highlightDiv)

        highlightDiv.remove()
      }, 610)
    })
}

document.addEventListener('click', function (event) {
  let foundLinkTag = null

  if (!event.shiftKey) {
    return
  }

  try {
    foundLinkTag = event.target.closest('a')

    if (!foundLinkTag) {
      return
    }

    event.preventDefault()
    saveLink(foundLinkTag)
  } catch (err) {
    console.error(err.message)
  }
}, false)
