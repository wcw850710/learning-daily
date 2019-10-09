;(() => {
    const canvas = document.getElementById('my-pen-canvas')

    if (!canvas) {
        const fragment = document.createDocumentFragment()
        const newCanvas = document.createElement(`div`)
        newCanvas.id = 'my-pen-canvas'
        newCanvas.style.cssText = `
            width: 100%;
            height: ${document.body.scrollHeight}px;
            position: absolute;
            left: 0;
            top: 0;
            z-index: 10000;
            pointer-events: none;
        `
        chrome.runtime.sendMessage({ send: false }, res => {
            const data = res.lines
            console.log(res)
            for (let uuid in data) {
                const line = document.createElement(`i`)
                const current = data[uuid]
                line.style.cssText = `
                    width: ${current.width}px;
                    height: 2px;
                    background-color: red;
                    border-radius: 10px;
                    position: absolute;
                    left: ${current.x}px;
                    top: ${current.y}px;
                    transform: translateX(${current.translateX}px);
                    z-index: 999;
                `
                newCanvas.appendChild(line)
            }
            fragment.appendChild(newCanvas)
            document.body.appendChild(fragment)
        })
    } else {
        document.body.removeChild(canvas)
    }
})()
