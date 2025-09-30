import app from '@adonisjs/core/services/app'
import { Server } from 'socket.io'
import server from '@adonisjs/core/services/server'
import Message from '#models/messages'
import Conversation from '#models/conversation'
import { DateTime } from 'luxon'

app.ready(() => {
  const io = new Server(server.getNodeServer(), {
    path: '/socket.io',
    cors: {
      origin: [
        'https://boulder-problem.chabs.fr',
        'http://localhost:3333', // ton front dev
      ],
    },
  })

  io?.on('connection', (socket) => {
    // le client doit s’authentifier ou envoyer son userId
    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`)
    })

    socket.on('message:send', async (message: any) => {
      try {
        // TODO: sauvegarde en BDD ici
        const messageSave = await Message.create(message)
        // update conv
        let conv = await Conversation.findOrFail(message.conversationId)
        conv.merge({ updatedAt: DateTime.local() }).save()

        // notifier tous les participants (ex: sender + receiver)
        io.to(`user:${messageSave.senderId}`).emit('message:new', messageSave)
        io.to(`user:${messageSave.receiverId}`).emit('message:new', messageSave)
      } catch (err) {
        console.error("Erreur lors de l'envoi du message:", err)
      }
    })
  })
})
