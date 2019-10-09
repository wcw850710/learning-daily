;(() => {
    const pens = [...document.body.getElementsByClassName('my-important-pen')]
    if (!pens.length) {
        const fragment = document.createDocumentFragment()
        chrome.runtime.sendMessage({ mode: 'toggleLines' }, res => {
            const data = res.lines
            for (let uuid in data) {
                const line = document.createElement(`i`)
                const current = data[uuid]
                line.className = 'my-important-pen'
                line.style.cssText = `
                    width: ${current.width}px;
                    height: 3px;
                    background-color: red;
                    border-radius: 10px;
                    position: absolute;
                    left: ${current.x}px;
                    top: ${current.y}px;
                    transform: translateX(${current.translateX}px);
                    cursor: pointer;
                    z-index: 10000;
                `
                line.addEventListener(`dblclick`, () => {
                    const { width, x, y } = line.getClientRects()[0]
                    const lineData = {
                        width,
                        x,
                        y,
                    }
                    chrome.runtime.sendMessage(
                        { mode: 'removeLine', lineData },
                        res => {
                            if (res) {
                                document.body.removeChild(line)
                            }
                        },
                    )
                })
                fragment.appendChild(line)
            }
            document.body.appendChild(fragment)
        })
    } else {
        pens.forEach(pen => {
            document.body.removeChild(pen)
        })
    }
})()
