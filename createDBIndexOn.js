function formatDate(time = new Date()) {
    const year = time.getFullYear()
    const month = String(time.getMonth() + 1).padStart(2, '0')
    const date = String(time.getDate()).padStart(2, '0')

    return `${year}-${month}-${date}`
}

function recentSevenDays() {
    let days = []
    const day = 86400000
    for (let i = 0; i < 7 + 7; i++) {
        days.push(formatDate(new Date(new Date().getTime() + day * (i - 3))))
    }
    return JSON.stringify(days).replace(/[\[\]]/g, '')
}

// function hash(val = this.password) {
//     const hash = require('crypto')
//         .createHash('md5')
//         .update(val)
//         .digest('hex')
//     return hash
// }

// console.log(recentSevenDays())
