const firebaseConfig = {
    apiKey: 'AIzaSyCtx5J2x18iLlMIDURgMecmaVkfh6_OSeQ',
    authDomain: 'pagemaker-23fec.firebaseapp.com',
    projectId: 'pagemaker-23fec',
}

const app = firebase.initializeApp(firebaseConfig)
const db = app.firestore()
const listsDb = userId =>
    db
        .collection('USERS')
        .doc(userId)
        .collection('LISTS')

function dbConfig() {
    return firebaseConfig
}

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

function tipNums() {
    chrome.storage.local.get(['id'], result => {
        const id = result.id
        listsDb(id)
            .where('dates', 'array-contains', formatDate())
            .onSnapshot(querySnapshot => {
                let length = 0
                querySnapshot.forEach(doc => {
                    const data = doc.data()
                    if (data[formatDate(new Date())] === 'unchecked') {
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
                    chrome.browserAction.setBadgeText({
                        text: '',
                    })
                }
            })
    })
}

function pushLinesFetchData(url, lineData, windowWidth) {
    chrome.storage.local.get(['id'], result => {
        const id = result.id
        const db = listsDb(id)
        db.where('url', '==', url)
            .where('color', '==', $color)
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    const { width, lines } = doc.data()
                    const id = doc.id
                    if (!width) {
                        db.doc(id).update({ width: windowWidth })
                    }
                    if (lines) {
                        db.doc(id).update({ lines: [...lines, lineData] })
                    } else {
                        db.doc(id).update({ lines: [lineData] })
                    }
                })
            })
    })
}

function removeLinesFetchData(url, lineData, sendRes) {
    chrome.storage.local.get(['id'], result => {
        const id = result.id
        const db = listsDb(id)
        db.where('url', '==', url)
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
                    db.doc(id)
                        .update({
                            lines: newLines,
                        })
                        .then(() => sendRes(true))
                })
            })
    })
}

function toggleLinesFetchData(url, sendRes) {
    chrome.storage.local.get(['id'], result => {
        const id = result.id
        const db = listsDb(id)
        db.where('url', '==', url)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.empty) return alert('此連結尚未有重點')
                const linesData = []
                querySnapshot.forEach(doc => {
                    const { lines, color } = doc.data()
                    if (lines)
                        lines.forEach(line =>
                            linesData.push({ ...line, color }),
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
        chrome.storage.local.get(['id'], result => {
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
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
            const url = tabs[0].url
            if (url) res(url)
            else rej(false)
        }),
    )

    if (!url) return alert('沒有連結')

    chrome.storage.local.get(['id'], result => {
        const id = result.id
        listsDb(id)
            .where('url', '==', url)
            .get()
            .then(querySnapshot => {
                if (!querySnapshot.empty) {
                    switch (command) {
                        case 'pen':
                            chrome.tabs.executeScript(null, {
                                file: './cs-pen.js',
                            })
                            break
                        case 'penToggle':
                            chrome.tabs.executeScript(null, {
                                file: './cs-penToggle.js',
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
var $width = null
