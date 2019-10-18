var _app = null

const listsDB = username =>
    _app
        .firestore()
        .collection('USERS')
        .doc(username)
        .collection('LISTS')

function formatDate(time = new Date()) {
    const year = time.getFullYear()
    const month = String(time.getMonth() + 1).padStart(2, '0')
    const date = String(time.getDate()).padStart(2, '0')
    const formatDate = `${year}-${month}-${date}`
    return formatDate
}

function formatMonth(time = new Date()) {
    const year = time.getFullYear()
    const month = String(time.getMonth() + 1).padStart(2, '0')
    const formatDate = `${year}-${month}`
    return formatDate
}

function tipNums(paramsId) {
    const clearAction = () => {
        chrome.browserAction.setBadgeText({
            text: '',
        })
    }
    const runDb = username =>
        listsDB(username)
            .where('dates', 'array-contains', formatDate())
            .onSnapshot(querySnapshot => {
                let length = 0
                querySnapshot.forEach(doc => {
                    const data = doc.data()
                    if (data[formatDate(new Date())] === 'unchecked') {
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
        return runDb(paramsId)
    }
    chrome.storage.local.get('username', result => {
        const username = result.username
        var user = _app.auth().currentUser
        console.log(user, username)
        runDb(username)
    })
}

function pushLinesFetchData(url, lineData, windowWidth) {
    chrome.storage.local.get('username', result => {
        const username = result.username
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
    chrome.storage.local.get('username', result => {
        const username = result.username
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
    chrome.storage.local.get('username', result => {
        const username = result.username
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
        chrome.storage.local.get('username', result => {
            const username = result.username
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

    chrome.storage.local.get('username', result => {
        const username = result.username
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
