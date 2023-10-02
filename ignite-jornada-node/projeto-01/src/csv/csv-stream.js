import fs from 'node:fs/promises'
import { parse } from 'csv-parse'

const csvFilePath = new URL('./tasks.csv', import.meta.url)
const tasks = []

fs.readFile(csvFilePath, 'utf-8')
  .then(data => {
    parse(data, {
      skip_empty_lines: true,
      from_line: 2
    })
      .on('readable', function () {
        let record
        while ((record = this.read()) !== null) {
          const task = {
            title: record[0],
            description: record[1]
          }
          tasks.push(task)
        }

      })
      .on('end', async function () {
        for await (const task of tasks) {
          fetch('http://localhost:3333/tasks', {
            method: 'POST',
            body: JSON.stringify(task)
          })
          .then(res => console.log(res.statusText))
          .catch(err => console.log(err))
        }
      })
  })