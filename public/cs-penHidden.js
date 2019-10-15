;(() => {
    const pens = [...document.body.getElementsByClassName('my-important-pen')]
    if (!pens) return
    const fragment = document.createDocumentFragment()
    pens.forEach(pen => {
        fragment.appendChild(pen)
    })
})()
