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
                    console.log(length)
                    chrome.browserAction.setBadgeText({
                        text: String(length),
                    })
                } else {
                    chrome.browserAction.setBadgeText({
                        text: '0',
                    })
                }
            })
    })
}
