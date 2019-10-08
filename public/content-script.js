let isDown = false
const body = document.body
const canvas = document.createElement('div')
canvas.style.cssText = `
                        width: 100%;
                        height: 100%;
                        background-color: red;
                        position: fixed;
                        left: 0;
                        top: 0;
                        z-index: 10000;
                    `
canvas.addEventListener('mousedown', () => {
    isDown = true
    const line = document.createElement('i')
    line.style.cssText = `
                            width: 0;
                            height: 2px;
                            background-color: red;
                            border-radius: 10px;
                            position: fixed;
                            left: 0;
                            top: 0;
                        `
    canvas.appendChild(line)
})
canvas.addEventListener('mousemove', ev => {
    if (isDown) {
        console.log(ev)
    }
})
canvas.addEventListener('mouseup', () => {
    isDown = false
    console.log(this)
    body.removeChild(canvas)
})
body.appendChild(canvas)
