var Slack = require('slack-node')

module.exports = (config) => {
  var slack = new Slack()
  slack.setWebhook(config.uri)

  var getMessage = function (content) {
    content = [].slice.call(content)
    return content
    .map((item) => {
      if (typeof item !== 'string') {
        item = JSON.stringify(item)
      }

      return item
    })
    .join(' ')
  }

  return {
    slackForUser: function () {
      var content = [].slice.call(arguments)
      var userId = content.shift()
      if (content && ~config.users.indexOf(String(userId))) {
        this.slack.apply(this, content)
      } else {
        console.log.apply(console, content)
      }
    },

    slack: function () {
      var message = getMessage(arguments)
      console.log.apply(console, ['Slack:'].concat([].slice.call(arguments)))

      return new Promise((resolve, reject) => {
        if (config.disabled !== true) {
          slack.webhook(Object.assign({
            channel: '#server_alert',
            username: 'PNS Server'
            // icon_emoji: ':ghost:',
          }, config.hook || {}, {
            text: message
          }), (error, response) => {
            if (error) {
              console.warn('Sending to slack failed', error)
              reject(error)
            } else {
              resolve(response)
            }
          })
        } else {
          resolve(null)
        }
      })
    }
  }
}
