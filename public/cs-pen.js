;(() => {
    const body = document.body
    const canvas = document.createElement('div')
    const line = document.createElement('i')
    const followCircle = document.createElement('i')
    let isDown = false
    let downPageXY = { x: 0, y: 0 }
    let cloneLine = null
    let sentData = { translateX: 0 }
    line.className = 'my-important-pen'
    followCircle.style.cssText = `
        width: 6px;
        height: 6px;
        background: red;
        border-radius: 50%;
        position: fixed;
        z-index: 10000;
    `
    canvas.style.cssText = `
                        width: 100%;
                        height: ${document.body.scrollHeight}px;
                        position: absolute;
                        left: 0;
                        top: 0;
                        z-index: 10000;
                        cursor: none;
                    `
    line.className = 'my-important-pen'
    canvas.addEventListener('mousedown', ev => {
        const { pageX: x, pageY: y } = ev
        line.style.cssText = `
                            width: 0;
                            height: 3px;
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
        const { clientX, clientY } = ev
        followCircle.style.left = clientX - 3 + 'px'
        followCircle.style.top = clientY + 'px'
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
            cloneLine = line
        }
    })
    canvas.addEventListener('mouseup', () => {
        isDown = false
        chrome.runtime.sendMessage({
            mode: 'sendLine',
            data: sentData,
        })
        body.removeChild(canvas)
        const pens = [
            ...document.body.getElementsByClassName('my-important-pen'),
        ]
        if (pens.length) {
            cloneLine.style.zIndex = '10000'
            cloneLine.style.cursor = 'pointer'
            line.addEventListener(`dblclick`, () => {
                const { width, x, y } = cloneLine.getClientRects()[0]
                const lineData = {
                    width,
                    x,
                    y,
                }
                chrome.runtime.sendMessage(
                    { mode: 'removeLine', lineData },
                    res => {
                        if (res) {
                            document.body.removeChild(cloneLine)
                        }
                    },
                )
            })
            body.appendChild(cloneLine)
        }
    })
    canvas.appendChild(followCircle)
    body.appendChild(canvas)
})()
