// Express是HTTP服务器的请求处理程序
const { Socket } = require('dgram');
const express = require('express'); // 引入express模块
const app = express(); // 创建一个express实例
// 创建一个服务并且关联express模块
const server = require('http').createServer(app); //传入express实例可以使用express一些资源比如静态文件等
const io = require('socket.io')(server) // 引入socket.io模块,和http服务器关联

const user = []

// 配置静态资源
app.use(express.static(__dirname + '/public'));

// 监听(在客户端与服务端建立连接时自动触发)
io.on('connection', (stream) => {
    // stream代表客户端与服务端的链接
    // stream.id 每个客户端有唯一的stream.id 每次建立连接的时候生成
    // on和emit可以实现服务端与客户端之间的双向通信
    // Socket.io的核心就是on和emit
    // 使用emit触发客户端监听的事件

    // io.emit是像所有的客户端广播
    // stream.emit是向建立该链接的客户端广播
    // stream.broadcast.emit向除去我以外的所有客户端广播(不给自己广播) 比如我进入了聊天室我进入了聊天室这句话 别人能看到我看不到 
    // io.emit('hello', '你好我是服务端的')
    // io.sockets.sockets存储了所有的已连接的对象
    // io.to(userId).emit 给指定的客户端发送消息


    // stream.on('client', (data) => {
    //     console.log('客户端发送了一个消息' + data)
    // })
    stream.on('join', data => {
        console.log(data)
        user.push({ ...data, id: stream.id })
        // 给所有建立连接的客户端广播
        io.emit('join', data.nickname + '加入了聊天室')
        // 给所有连接的客户端返回当前在线用户
        io.emit('userList', user)
    })
    // 当发送一条消息的时候触发
    stream.on('message', data => {
        console.log(data)
        // 一个是消息一个是id
        const { message, userId } = data
        let obj = {}
        // 把消息和id和用户捆绑在一起
        user.map(item => {
            if (item.id === stream.id) {
                obj = {
                    ...item,
                    message
                }
            }
        })
        // 如果是私聊
        if (userId !== "") {
            console.log('id')
            // 给指定的客户端发送消息
            io.to(userId).emit('return', obj)
        } else {
            console.log(1111)
            // 给除了我之外的发送消息
            stream.broadcast.emit('return', obj)
        }
    })
    // 当用户离开时触发
    stream.on('disconnect', () => {
        const obj = user.find(v => v.id === stream.id)
        console.log(obj)
        user.splice(user.findIndex(v => v.id === stream.id), 1)
        if (obj) {
            io.emit('leave', { obj, user })
        }
    })
})

server.listen(8080, () => {
    console.log("http://127.0.0.1:8080")
})