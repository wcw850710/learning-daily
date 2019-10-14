const firebaseConfig = {
    apiKey: 'AIzaSyCtx5J2x18iLlMIDURgMecmaVkfh6_OSeQ',
    authDomain: 'pagemaker-23fec.firebaseapp.com',
    projectId: 'pagemaker-23fec',
}

const app = firebase.initializeApp(firebaseConfig)
const db = app.firestore()
const dbRef = username =>
    db
        .collection('USERS')
        .doc(username)
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

function tipNums() {
    chrome.storage.local.get(['username'], result => {
        const username = result.username
        db.ref(`${username}/lists`)
            .orderByChild('date')
            .equalTo(formatDate(new Date()))
            .on('value', snapshot => {
                if (snapshot.exists()) {
                    let length = 0
                    snapshot.forEach(item => {
                        const val = item.val()
                        if (!val.isChecked) {
                            length++
                        }
                    })
                    if (length === 0) {
                        length = ''
                    } else {
                        length = String(length)
                    }
                    chrome.browserAction.setBadgeText({
                        text: length,
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

function pushLinesFetchData(url, lineData, width) {
    chrome.storage.local.get(['username'], result => {
        const username = result.username
        db.ref(`${username}/webs`)
            .orderByChild('url')
            .equalTo(url)
            .once('value', snapshot => {
                const pushRefData = key =>
                    db.ref(`${username}/webs/${key}/lines`).push(lineData)
                if (!snapshot.exists()) {
                    db.ref(`${username}/webs`)
                        .push({ url, width })
                        .then(({ key }) => {
                            pushRefData(key)
                        })
                } else {
                    snapshot.forEach(item => {
                        const key = item.key
                        pushRefData(key)
                    })
                }
            })
    })
}

function removeLinesFetchData(url, lineData, sendRes) {
    chrome.storage.local.get(['username'], result => {
        const username = result.username
        db.ref(`${username}/webs`)
            .orderByChild('url')
            .equalTo(url)
            .once('value', snapshot => {
                snapshot.forEach(item => {
                    const key = item.key
                    db.ref(`${username}/webs/${key}/lines`)
                        .orderByChild('width')
                        .equalTo(lineData.width)
                        .once('value', snapshot => {
                            snapshot.forEach(item => {
                                const val = item.val()
                                const key = item.key
                                if (
                                    val.x === lineData.x &&
                                    val.y === lineData.y
                                ) {
                                    db.ref(
                                        `${username}/webs/${key}/lines/${key}`,
                                    )
                                        .remove()
                                        .then(() => sendRes(true))
                                }
                            })
                        })
                })
            })
    })
}

function toggleLinesFetchData(url, sendRes) {
    chrome.storage.local.get(['username'], result => {
        const username = result.username
        db.ref(`${username}/webs`)
            .orderByChild('url')
            .equalTo(url)
            .once('value', snapshot => {
                if (snapshot.exists()) {
                    snapshot.forEach(item => {
                        const val = item.val()
                        sendRes(val.lines)
                    })
                } else {
                    alert('此連結尚未有筆記')
                }
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
