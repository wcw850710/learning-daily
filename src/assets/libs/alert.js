export default (el, content, type = 'danger') => {
    const div = document.createElement('div')
    div.className = 'my__alert ' + 'my__alert--' + type
    div.innerText = content
    el.appendChild(div)
    setTimeout(() => {
        el.removeChild(div)
    }, 3000)
}
