const firebaseConfig = {
    apiKey: 'AIzaSyCtx5J2x18iLlMIDURgMecmaVkfh6_OSeQ',
    authDomain: 'pagemaker-23fec.firebaseapp.com',
    databaseURL: 'https://pagemaker-23fec.firebaseio.com',
    projectId: 'pagemaker-23fec',
    storageBucket: 'pagemaker-23fec.appspot.com',
    messagingSenderId: '693822124792',
    appId: '1:693822124792:web:c5bfb6f13bdd1e9d56410d',
}

const app = firebase.initializeApp(firebaseConfig)
const db = app.database()

function $db() {
    return db
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
                    const data = snapshot.val()
                    let length = 0
                    for (let uuid in data) {
                        if (!data[uuid].isChecked) {
                            length++
                        }
                    }
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
                const data = snapshot.val()
                const pushRefData = uuid =>
                    db.ref(`${username}/webs/${uuid}/lines`).push(lineData)
                if (!data) {
                    db.ref(`${username}/webs`)
                        .push({ url, width })
                        .then(({ key: uuid }) => {
                            pushRefData(uuid)
                        })
                } else {
                    for (let uuid in data) {
                        pushRefData(uuid)
                    }
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
                const data = snapshot.val()
                const key = Object.keys(data)[0]
                db.ref(`${username}/webs/${key}/lines`)
                    .orderByChild('width')
                    .equalTo(lineData.width)
                    .once('value', snapshot => {
                        const data = snapshot.val()
                        for (let uuid in data) {
                            if (
                                data[uuid].x === lineData.x &&
                                data[uuid].y === lineData.y
                            ) {
                                db.ref(`${username}/webs/${key}/lines/${uuid}`)
                                    .remove()
                                    .then(() => sendRes(true))
                            }
                        }
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
                const data = snapshot.val()
                if (data) {
                    sendRes(data[Object.keys(data)[0]])
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
