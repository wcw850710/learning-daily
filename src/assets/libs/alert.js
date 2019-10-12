const div = document.createElement('div')
div.className = 'my__alert'

export default (el, content) => {
    div.innerText = content
    el.appendChild(div)
    setTimeout(() => {
        el.removeChild(div)
    }, 3000)
}
