const socket = io()
function $(element) {
    return document.querySelector(element)
}
function $$(element) {
    return document.querySelectorAll(element)
}
// 点击用户进行私聊
let userId = ''
function toUser(nickname, id) {
    if (socket.id === id) { alert('不能和自己聊天'); return; }
    userId = id
    $('.outDiv input').value = `@${nickname}:`
}
/**
 *用户列表
 */
socket.on('userList', data => {
    let str = ''
    data.map(item => {
        str += `<li onclick="toUser('${item.nickname}', '${item.id}')">
        <img src="${item.avatar}" alt="" />
        <span>${item.nickname}</span>
        </li>`
    })
    $('.list').innerHTML = str
})
/** 
*用户离开时
*/
socket.on('leave', data => {
    const div = document.createElement('div')
    div.className = 'info'
    div.innerHTML = `————————————
         &nbsp&nbsp&nbsp${data.obj.nickname}离开了聊天室
        &nbsp&nbsp&nbsp————————————`
    $('.text').append(div)

    let str = ''
    data.user.map(item => {
        str += `<li onclick="toUser('${item.nickname}', '${item.id}')">
            <img src="${item.avatar}" alt="" />
            <span>${item.nickname}</span>
            </li>`
    })
    $('.list').innerHTML = str
})
/**
 *聊天信息
 */
socket.on('return', data => {
    console.log(data)
    const li = document.createElement('li')
    li.innerHTML = `<img src="${data.avatar}" alt="" />
    <div class="item">
      <p class="name">${data.nickname}</p>
      <p class="text">${data.message}</p>
    </div>`
    $('.text').append(li)
})
/**
 *选择头像
 */
let avatar = ''
const url = [...$$('.imgs img')]
for (let i = 0; i < url.length; i++) {
    url[i].onclick = function () {
        url.map(v => {
            v.style.border = 'none'
        })
        this.style.border = "5px solid orange"
        avatar = this
    }
}
/**
 * 加入聊天室
*/
let nickname = ""
$('.select button').onclick = function () {
    nickname = $('.nameSelect input').value
    if (!avatar || !nickname) return console.log('请选择头像和昵称')
    socket.emit('join', { nickname: nickname, avatar: avatar.src })
    socket.on('join', data => {
        console.log(data)
        const div = document.createElement('div')
        div.className = 'info'
        div.innerHTML = `———————————————
             &nbsp&nbsp&nbsp${data}
            &nbsp&nbsp&nbsp———————————————`
        $('.text').append(div)

    })
    $('.select').style.display = 'none'
    $('.masterOut').style.display = 'block'
}
/**
 * 发送消息
*/
document.onkeydown = function (event) {
    if (event.keyCode == 13) {
        sendMessage();
    }
}
function sendMessage() {
    const message = $('.outDiv input').value
    // 发送消息不能为空的判断
    if (!message) return alert('请输入消息')
    // 发送消息
    socket.emit('message', { message, userId })
    $('.outDiv input').value = ''
    const li = document.createElement('li')
    li.className = "right"
    li.innerHTML = `<div class=" item">
        <p class="name">${nickname}</p>
        <p class="text">${message}</p>
      </div>
      <img src="${avatar.src}" alt="" />`
    $('.text').append(li)
    userId = ''
}
