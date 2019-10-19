const listsDB = id => _app.database().ref('USERS/' + id + '/LISTS')

function formatDate(time = new Date(), type = 'YY-MM-DD') {
    const year = time.getFullYear()
    const month = String(time.getMonth() + 1).padStart(2, '0')
    const date = String(time.getDate()).padStart(2, '0')
    const hour = new Date().getHours()
    const minute = new Date().getMinutes()
    const second = new Date().getSeconds()
    switch (type) {
        case 'YY-MM-DD':
            return `${year}-${month}-${date}`
        case 'YY-MM':
            return `${year}-${month}`
        case 'YY-MM-DD hh:mm:ss':
            return `${year}-${month}-${date} ${hour}:${minute}:${second}`
    }
}

function tipNums(paramsId) {
    const clearAction = () => {
        chrome.browserAction.setBadgeText({
            text: '',
        })
    }
    const runDb = id =>
        listsDB(id)
            .orderByChild(formatDate())
            .on('value', snap => {
                let length = 0
                snap.forEach(doc => {
                    const data = doc.val()
                    console.log('bg1', data)
                    if (data[formatDate()] === 'unchecked') {
                        length++
                    }
                })
                if (paramsId) return clearAction()
                if (length) {
                    chrome.browserAction.setBadgeText({
                        text: String(length),
                    })
                    chrome.browserAction.setBadgeBackgroundColor({
                        color: '#FF663E',
                    })
                } else {
                    clearAction()
                }
            })
    if (paramsId) {
        return listsDB(id).off('value')
    }
    chrome.storage.local.get('id', result => {
        const id = result.id
        runDb(id)
    })
}

function pushLinesFetchData(url, lineData, windowWidth) {
    chrome.storage.local.get('id', result => {
        const id = result.id
        const DB = listsDB(username)
        DB.where('url', '==', url)
            .where('color', '==', $color)
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    const { width, lines } = doc.data()
                    const id = doc.id
                    if (!width) {
                        DB.doc(id).update({
                            width: windowWidth,
                        })
                    }
                    if (lines) {
                        DB.doc(id).update({
                            lines: [...lines, lineData],
                        })
                    } else {
                        DB.doc(id).update({
                            lines: [lineData],
                        })
                    }
                })
            })
    })
}

function removeLinesFetchData(url, lineData, sendRes) {
    chrome.storage.local.get('id', result => {
        const id = result.id
        const DB = listsDB(username)
        DB.where('url', '==', url)
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    const { lines } = doc.data()
                    const index = lines.findIndex(
                        line => line.x === lineData.x && line.y === lineData.y,
                    )
                    if (index === -1) return

                    lines.splice(index, 1)
                    const id = doc.id
                    const newLines = lines
                    DB.doc(id)
                        .update({
                            lines: newLines,
                        })
                        .then(() => sendRes(true))
                })
            })
    })
}

function toggleLinesFetchData(url, sendRes) {
    chrome.storage.local.get('id', result => {
        const id = result.id
        const DB = listsDB(username)
        DB.where('url', '==', url)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.empty) return alert('此連結尚未有重點')
                const linesData = []
                querySnapshot.forEach(doc => {
                    const { lines, color } = doc.data()
                    if (lines)
                        lines.forEach(line =>
                            linesData.push({
                                ...line,
                                color,
                            }),
                        )
                })
                sendRes(linesData)
            })
    })
}

chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
    const { mode, data, lineData, windowWidth } = req
    const url = sender.url
    switch (mode) {
        case 'getColor':
            sendRes($color)
            break
        case 'changeWindowWidth':
            sendRes($width)
            break
        case 'sendLine':
            pushLinesFetchData(url, data, windowWidth)
            break
        case 'removeLine':
            removeLinesFetchData(url, lineData, sendRes)
            break
        case 'toggleLines':
            toggleLinesFetchData(url, sendRes)
            break
    }
    return true
})

chrome.commands.onCommand.addListener(async command => {
    const isLogin = await new Promise((res, rej) =>
        chrome.storage.local.get('id', result => {
            const id = result.id
            if (!username) res(false)
            else res(true)
        }),
    )
    if (!isLogin) return alert('請先登入')

    if (command === 'changeWindowWidth') {
        return chrome.windows.getCurrent({}, window => {
            const { id } = window
            const settingObj = {}
            if (screen.width === $width) {
                settingObj.state = 'maximized'
            } else {
                settingObj.width = Number($width) + 16
            }
            chrome.windows.update(id, settingObj)
        })
    }

    const url = await new Promise((res, rej) =>
        chrome.tabs.query(
            {
                active: true,
                lastFocusedWindow: true,
            },
            tabs => {
                const url = tabs[0].url
                if (url) res(url)
                else rej(false)
            },
        ),
    )

    if (!url) return alert('沒有連結')

    chrome.storage.local.get('id', result => {
        const id = result.id
        listsDB(username)
            .where('url', '==', url)
            .get()
            .then(querySnapshot => {
                if (!querySnapshot.empty) {
                    switch (command) {
                        case 'pen':
                            chrome.tabs.executeScript(null, {
                                file: './content-script/pen.min.js',
                            })
                            break
                        case 'penToggle':
                            chrome.tabs.executeScript(null, {
                                file: './content-script/penToggle.min.js',
                            })
                            break
                    }
                } else {
                    return alert('此連結尚未新增')
                }
            })
    })
})

var $color = '#ff2828'
var $firstLogin = true
var $width = 0
