import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'
import { isBodyEmpty } from './utils/is-body-empty.js'

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select('tasks', search ? {
        title: search,
        description: search
      } : null)

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      console.log(req.body)
      if (isBodyEmpty(req.body)) {
        return res.writeHead(400).end(JSON.stringify({ error: 'Invalid request' }))
      }

      const { title, description } = req.body

      if (typeof title === 'string' && typeof description === 'string') {
        const date = new Date()
        const task = {
          id: randomUUID(),
          title,
          description,
          completed_at: null,
          created_at: date,
          update_at: date
        }

        database.insert('tasks', task)

        return res.writeHead(201).end()
      }

      return res.writeHead(400).end(JSON.stringify({ error: 'Title and description must be provided' }))

    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {

      const { id } = req.params

      const taskExists = database.exist('tasks', id)

      if (taskExists) {
        database.delete('tasks', id)

        return res.writeHead(204).end()
      }

      return res.writeHead(404).end(JSON.stringify({ error: 'The reported task does not exist' }))
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {

      const { id } = req.params

      if (isBodyEmpty(req.body)) {
        return res.writeHead(400).end(JSON.stringify({ error: 'Invalid request' }))
      }

      const { title, description } = req.body

      if (typeof title !== 'string' && typeof description !== 'string') {
        return res.writeHead(400).end(JSON.stringify({ error: 'Invalid request' }))
      }

      const date = new Date()

      const taskExists = database.exist('tasks', id)

      if (taskExists) {

        const taskArray = database.select('tasks', {
          id: id
        })

        const { id: taskId, title: oldTitle, description: oldDescription, ...taskInDb } = taskArray[0]

        const updateTask = {
          ...taskInDb,
          title: title ?? oldTitle,
          description: description ?? oldDescription,
          update_at: date
        }

        database.update('tasks', id, updateTask)

        return res.writeHead(204).end()
      }

      return res.writeHead(404).end(JSON.stringify({ error: 'The reported task does not exist' }))
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const table = 'tasks'

      const { id } = req.params

      const date = new Date()

      const taskExists = database.exist(table, id)

      if (taskExists) {
        const taskArray = database.select(table, {
          id: id
        })

        const { id: taskId, ...taskInDb } = taskArray[0]

        const switchCompleteTask = taskInDb.completed_at ? null : date

        const currentTask = { ...taskInDb, completed_at: switchCompleteTask, update_at: date }

        database.update('tasks', id, currentTask)

        return res.writeHead(204).end()
      }

      return res.writeHead(404).end(JSON.stringify({ error: 'The reported task does not exist' }))
    }
  }
]