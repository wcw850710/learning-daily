export default (el, content) => {
    const div = document.createElement('div')
    div.className = 'my__alert'
    div.innerText = content
    el.appendChild(div)
    setTimeout(() => {
        el.removeChild(div)
    }, 3000)
}
