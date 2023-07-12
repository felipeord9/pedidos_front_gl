const url = `http://localhost:3001/api/v1/mail/send`

function sendMail(body) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  })
  .then(res => res.json())
  .then(res => res.data)
}

export {
  sendMail
}