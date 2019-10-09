// import firebase from 'firebase/app'
// import 'firebase/auth'
// import 'firebase/database'
// import DB_CONFIG from '@/DB_CONFIG'

// const app = firebase.initializeApp({ databaseURL: DB_CONFIG.databaseURL })
// const db = app.database()
;(() => {
    let isDown = false
    let downPageXY = { x: 0, y: 0 }
    const body = document.body
    const line = document.createElement('i')
    const canvas = document.createElement('div')
    canvas.style.cssText = `
                        width: 100%;
                        height: ${document.body.scrollHeight}px;
                        background-color: #ff87873b;
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
                            z-index: 999;
                        `
        canvas.appendChild(line)
        downPageXY.x = x
        downPageXY.y = y
        isDown = true
    })
    canvas.addEventListener('mousemove', ev => {
        if (isDown) {
            const { pageX: x } = ev
            const { x: ox } = downPageXY
            line.style.width = Math.abs(x - ox) + 'px'
            if (x - ox < 0) {
                line.style.transform = `translateX(-${Math.abs(x - ox)}px)`
            }
        }
    })
    canvas.addEventListener('mouseup', () => {
        isDown = false
        body.removeChild(canvas)
    })
    body.appendChild(canvas)
})()
