import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World, How are you all?')
})

app.get('/shaheen', (req, res) => {
  res.send('I am doing greate, Thank you!')
})

app.get('/idli', (req, res) => {
    var custmized_idli = {
        name: 'rave idli', 
        size: 'small',
        is_sambhar: true,
        is_chutney: false
    }
  res.send(custmized_idli)
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})