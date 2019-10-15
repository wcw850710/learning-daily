const firebaseConfig = {
    apiKey: 'AIzaSyCtx5J2x18iLlMIDURgMecmaVkfh6_OSeQ',
    authDomain: 'pagemaker-23fec.firebaseapp.com',
    projectId: 'pagemaker-23fec',
}

const app = firebase.initializeApp(firebaseConfig)
const db = app.firestore()
const dbRef = userId =>
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
        dbRef(id)
            .where('dates', 'array-contains', formatDate())
            .onSnapshot(querySnapshot => {
                let length = 0
                querySnapshot.forEach(doc => {
                    const { isChecked } = doc.data()
                    if (!isChecked) {
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
        const db = dbRef(id)
        db.where('url', '==', url)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.empty) {
                    return db.add({
                        width: windowWidth,
                        lines: [lineData],
                        url,
                    })
                }
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
        const db = dbRef(id)
        db.where('url', '==', url)
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    const { lines } = doc.data()
                    const id = doc.id
                    const index = lines.findIndex(
                        line => line.x === lineData.x && line.y === lineData.y,
                    )
                    lines.splice(index, 1)
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
        const db = dbRef(id)
        db.where('url', '==', url)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.empty) return alert('此連結尚未有重點')
                querySnapshot.forEach(doc => {
                    const { lines } = doc.data()
                    sendRes(lines)
                })
            })
    })
}

chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
    const { mode, data, lineData, windowWidth } = req
    const url = sender.url
    switch (mode) {
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
