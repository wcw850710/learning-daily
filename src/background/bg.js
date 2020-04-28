// ee1950278364
const firebaseConfig = {
    apiKey: 'AIzaSyCtx5J2x18iLlMIDURgMecmaVkfh6_OSeQ',
    authDomain: 'pagemaker-23fec.firebaseapp.com',
    databaseURL: 'https://pagemaker-23fec.firebaseio.com',
    storageBucket: 'pagemaker-23fec.appspot.com',
}

var _DB = firebase.initializeApp(firebaseConfig)
const listsDB = (id, afterRef = '') =>
    _DB.database().ref('USERS/' + id + '/LISTS' + afterRef)

function formatDate(time = new Date(), type = 'YY-MM-DD') {
    const year = time.getFullYear()
    const month = String(time.getMonth() + 1).padStart(2, '0')
    const date = String(time.getDate()).padStart(2, '0')
    switch (type) {
        case 'YY-MM-DD':
            return `${year}-${month}-${date}`
        case 'YY-MM':
            return `${year}-${month}`
        case 'YY-MM-DD hh:mm:ss':
            const hour = String(time.getHours()).padStart(2, '0')
            const minute = String(time.getMinutes()).padStart(2, '0')
            const second = String(time.getSeconds()).padStart(2, '0')
            return `${year}-${month}-${date} ${hour}:${minute}:${second}`
    }
}

function logout(callback) {
    const auth = _DB.auth()
    const user = auth.currentUser
    auth.signOut().then(() => {
        chrome.storage.local.get('id', result => {
            tipNums(result.id)
            chrome.storage.local.remove('id', () => {
                $firstLogin = true
                $width = 0
                chrome.storage.local.remove('width')
                callback()
                user.delete()
            })
        })
    })
}

function tipNums(paramsId) {
    const clearAction = () => {
        chrome.browserAction.setBadgeText({
            text: '',
        })
    }
    const runDb = id =>
        listsDB(id).on('value', () => {
            listsDB(id)
                .orderByChild(formatDate())
                .startAt(0)
                .endAt(1)
                .once('value', snap => {
                    let length = 0
                    snap.forEach(doc => {
                        const data = doc.val()
                        if (data[formatDate()] === 0) {
                            length++
                        }
                    })
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
        })
    if (paramsId) {
        clearAction()
        return listsDB(paramsId).off('value')
    }
    chrome.storage.local.get('id', result => {
        const id = result.id
        runDb(id)
    })
}

function pushLinesFetchData(url, lineData, windowWidth) {
    chrome.storage.local.get('id', result => {
        const id = result.id
        listsDB(id)
            .orderByChild('url')
            .equalTo(url)
            .once('value', snap => {
                snap.forEach(doc => {
                    const { width, lines, color } = doc.val()
                    if (color !== $color) return
                    if (!width) {
                        listsDB(id, `/${doc.key}`).update({
                            width: windowWidth,
                        })
                    }
                    if (lines) {
                        listsDB(id, `/${doc.key}`).update({
                            lines: [...lines, lineData],
                        })
                    } else {
                        listsDB(id, `/${doc.key}/lines`).set([lineData])
                    }
                })
            })
    })
}

function removeLinesFetchData(url, lineData, sendRes) {
    chrome.storage.local.get('id', result => {
        const id = result.id
        const DB = listsDB(id)
        DB.orderByChild('url')
            .equalTo(url)
            .once('value', snap => {
                snap.forEach(doc => {
                    const { lines } = doc.val()
                    if (!lines) return
                    const index = lines.findIndex(
                        line =>
                            Math.ceil(line.x) === Math.ceil(lineData.x) &&
                            Math.ceil(line.y) === Math.ceil(lineData.y),
                    )
                    if (index === -1) return

                    lines.splice(index, 1)
                    const newLines = lines
                    listsDB(id, `/${doc.key}`)
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
        const DB = listsDB(id)
        DB.orderByChild('url')
            .equalTo(url)
            .once('value', snap => {
                if (!snap.exists()) return alert('此連結尚未有重點')
                const linesData = []
                snap.forEach(doc => {
                    const { lines, color } = doc.val()
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
            if (!id) res(false)
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
        listsDB(id)
            .orderByChild('url')
            .equalTo(url)
            .once('value', snap => {
                if (snap.exists()) {
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
