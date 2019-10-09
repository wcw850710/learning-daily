;(() => {
    let isDown = false
    let downPageXY = { x: 0, y: 0 }
    const body = document.body
    const line = document.createElement('i')
    const canvas = document.createElement('div')
    let sentData = { translateX: 0 }
    canvas.style.cssText = `
                        width: 100%;
                        height: ${document.body.scrollHeight}px;
                        position: absolute;
                        left: 0;
                        top: 0;
                        z-index: 10000;
                    `
    canvas.addEventListener('mousedown', ev => {
        const { pageX: x, pageY: y } = ev
        line.style.cssText = `
                            width: 0;
                            height: 2px;
                            background-color: red;
                            border-radius: 10px;
                            position: absolute;
                            left: ${x}px;
                            top: ${y}px;
                        `
        canvas.appendChild(line)
        downPageXY.x = x
        downPageXY.y = y
        sentData.x = x
        sentData.y = y
        isDown = true
    })
    canvas.addEventListener('mousemove', ev => {
        if (isDown) {
            const { pageX: x } = ev
            const { x: ox } = downPageXY
            const width = Math.abs(x - ox)
            line.style.width = width + 'px'
            sentData.width = width
            if (x - ox < 0) {
                sentData.translateX = -width
                line.style.transform = `translateX(-${width}px)`
            }
        }
    })
    canvas.addEventListener('mouseup', () => {
        isDown = false
        chrome.runtime.sendMessage({
            mode: 'sendLine',
            data: sentData,
        })
        body.removeChild(canvas)
    })
    body.appendChild(canvas)
})()
