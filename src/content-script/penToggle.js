var _voiceContentObserver
if (document.getElementById(`caption_detail`) && !_voiceContentObserver) {
    _voiceContentObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.style.overflow === 'hidden') {
                mutation.target.style.marginRight = '17px'
            } else {
                mutation.target.style.marginRight = '0'
            }
        })
    })
    _voiceContentObserver.observe(document.getElementById(`caption_detail`), {
        attributes: true,
    })
}
;(() => {
    const voiceTubeBody = document.getElementById(`caption_detail`)
    if (voiceTubeBody) {
        if (voiceTubeBody.style.overflow === 'hidden') {
            voiceTubeBody.style.marginRight = '17px'
        }
    }
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
                    background-color: ${current.color};
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
                                voiceTubeBody
                                    ? voiceTubeBody.removeChild(line)
                                    : document.body.removeChild(line)
                            }
                        },
                    )
                })
                fragment.appendChild(line)
            }
            if (voiceTubeBody) {
                voiceTubeBody.appendChild(fragment)
            } else {
                document.body.appendChild(fragment)
            }
        })
    } else {
        const fragment = document.createDocumentFragment()
        pens.forEach(pen => {
            fragment.appendChild(pen)
        })
    }
})()
