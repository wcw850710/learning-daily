;(function draw() {
    const voiceTubeBody = document.getElementById(`caption_detail`)
    const canvasDom = document.getElementById('my-important-pen-canvas')
    if (canvasDom) {
        if (canvasDom.parentNode === voiceTubeBody) {
            return voiceTubeBody.removeChild(canvasDom)
        }
        return document.body.removeChild(canvasDom)
    }
    chrome.runtime.sendMessage(
        {
            mode: 'getColor',
        },
        color => {
            const body = document.body
            const canvas = document.createElement('div')
            const line = document.createElement('i')
            const followCircle = document.createElement('i')
            let isDown = false
            let downPageXY = { x: 0, y: 0 }
            let cloneLine = null
            let sentData = { translateX: 0 }
            canvas.id = 'my-important-pen-canvas'
            line.className = 'my-important-pen'
            followCircle.style.cssText = `
                width: 6px;
                height: 6px;
                background: ${color};
                border-radius: 50%;
                position: absolute;
                z-index: 100;
            `
            canvas.style.cssText = `
                            width: 100%;
                            height: ${
                                voiceTubeBody
                                    ? voiceTubeBody.scrollHeight
                                    : document.body.scrollHeight
                            }px;
                            position: absolute;
                            left: 0;
                            top: 0;
                            z-index: 100;
                            cursor: none;
                            background-color: rgba(0, 0, 0, .05);
                        `
            line.className = 'my-important-pen'
            canvas.addEventListener('mousedown', ev => {
                let x = ev.pageX
                let y = ev.pageY
                if (voiceTubeBody) {
                    x = ev.clientX - canvas.getBoundingClientRect().left
                    y = ev.pageY - canvas.getBoundingClientRect().top
                }
                line.style.cssText = `
                                width: 0;
                                height: 3px;
                                background-color: ${color};
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
                let x = ev.pageX
                let y = ev.pageY
                if (voiceTubeBody) {
                    x = ev.clientX - canvas.getBoundingClientRect().left

                    y = ev.pageY - canvas.getBoundingClientRect().top
                }
                followCircle.style.left = x - 3 + 'px'
                followCircle.style.top = y + 'px'
                if (isDown) {
                    let x = ev.pageX
                    let ox = downPageXY.x
                    if (voiceTubeBody) {
                        x = ev.clientX - canvas.getBoundingClientRect().left
                    }
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
            canvas.addEventListener('mouseup', ev => {
                isDown = false
                if (sentData.width < 3) sentData.width = 3
                if (voiceTubeBody) {
                    voiceTubeBody.removeChild(canvas)
                } else {
                    body.removeChild(canvas)
                }
                chrome.runtime.sendMessage({
                    mode: 'sendLine',
                    data: sentData,
                    windowWidth: window.innerWidth,
                })
                const pens = [
                    ...document.body.getElementsByClassName('my-important-pen'),
                ]
                if (pens.length) {
                    cloneLine.style.zIndex = '100'
                    cloneLine.style.cursor = 'pointer'
                    line.addEventListener(`dblclick`, () => {
                        const { width, left, top } = cloneLine.style
                        const lineData = {
                            width: Number(width.split('px')[0]),
                            x: Number(left.split('px')[0]),
                            y: Number(top.split('px')[0]),
                        }
                        chrome.runtime.sendMessage(
                            {
                                mode: 'removeLine',
                                lineData,
                            },
                            res => {
                                if (res) {
                                    document.body.removeChild(cloneLine)
                                }
                            },
                        )
                    })
                    if (voiceTubeBody) {
                        voiceTubeBody.appendChild(cloneLine)
                    } else {
                        body.appendChild(cloneLine)
                    }
                }
            })
            function windowKeydownEvent(ev) {
                const { key } = ev
                if (key === 'Escape') {
                    draw()
                    window.removeEventListener('keydown', windowKeydownEvent)
                }
            }
            window.addEventListener('keydown', windowKeydownEvent)
            canvas.appendChild(followCircle)
            if (
                new RegExp('https://tw.voicetube.com/videos/').test(
                    window.location.href,
                )
            ) {
                voiceTubeBody.appendChild(canvas)
            } else {
                body.appendChild(canvas)
            }
        },
    )
})()
