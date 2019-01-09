/**
 * Created by Administrator on 2018/12/29.
 */
var passiveEvents = false
try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function () {
      passiveEvents = { passive: true }
    }
  })
  window.addEventListener('test', null, opts)
} catch (e) {}

const resize = {
  onelresize (el, handler) {
    if (!(el instanceof HTMLElement)) {
      throw new TypeError("Parameter 1 is not instance of 'HTMLElement'.")
    }
    // https://www.w3.org/TR/html/syntax.html#writing-html-documents-elements
    if (/^(area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr|script|style|textarea|title)$/i.test(el.tagName)) {
      throw new TypeError('Unsupported tag type. Change the tag or wrap it in a supported tag(e.g. div).')
    }
    if (typeof handler !== 'function') { throw new TypeError("Parameter 2 is not of type 'function'.") }

    var lastWidth = el.offsetWidth || 1
    var lastHeight = el.offsetHeight || 1
    var maxWidth = 10000 * (lastWidth)
    var maxHeight = 10000 * (lastHeight)

    var expand = document.createElement('div')
    expand.style.cssText = 'position:absolute;top:0;bottom:0;left:0;right:0;z-index=-10000;overflow:hidden;visibility:hidden;'
    var shrink = expand.cloneNode(false)

    var expandChild = document.createElement('div')
    expandChild.style.cssText = 'transition:0s;animation:none;'
    var shrinkChild = expandChild.cloneNode(false)

    expandChild.style.width = maxWidth + 'px'
    expandChild.style.height = maxHeight + 'px'
    shrinkChild.style.width = '250%'
    shrinkChild.style.height = '250%'

    expand.appendChild(expandChild)
    shrink.appendChild(shrinkChild)
    el.appendChild(expand)
    el.appendChild(shrink)

    if (expand.offsetParent !== el) {
      el.style.position = 'relative'
    }

    expand.scrollTop = shrink.scrollTop = maxHeight
    expand.scrollLeft = shrink.scrollLeft = maxWidth

    var newWidth = 0
    var newHeight = 0
    function onResize () {
      if (newWidth !== lastWidth || newHeight !== lastHeight) {
        lastWidth = newWidth
        lastHeight = newHeight
        handler()
      }
    }

    function onScroll () {
      newWidth = el.offsetWidth || 1
      newHeight = el.offsetHeight || 1
      if (newWidth !== lastWidth || newHeight !== lastHeight) {
        requestAnimationFrame(onResize)
      }
      expand.scrollTop = shrink.scrollTop = maxHeight
      expand.scrollLeft = shrink.scrollLeft = maxWidth
    }

    expand.addEventListener('scroll', onScroll, passiveEvents)
    shrink.addEventListener('scroll', onScroll, passiveEvents)
  }
}
export {resize}

