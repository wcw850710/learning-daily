;(() => {
    const pens = [...document.body.getElementsByClassName('my-important-pen')]
    if (!pens.length) {
        const fragment = document.createDocumentFragment()
        chrome.runtime.sendMessage({ mode: 'toggleLines' }, lines => {
            for (let key in lines) {
                const line = document.createElement(`i`)
                const current = lines[key]
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
                    z-index: 100;
                `
                line.addEventListener(`dblclick`, () => {
                    const { width, left, top } = line.style
                    const lineData = {
                        width: Number(width.split('px')[0]),
                        x: Number(left.split('px')[0]),
                        y: Number(top.split('px')[0]),
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
        const fragment = document.createDocumentFragment()
        pens.forEach(pen => {
            fragment.appendChild(pen)
        })
    }
})()
