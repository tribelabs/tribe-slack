var Slack = require('slack-node')

module.exports = (config) => {
  var slack = new Slack()
  slack.setWebhook(config.uri)

  var getMessage = function (content) {
    content = [].slice.call(content)
    return content
    .map((item) => {
      if (typeof item !== 'string') {
        if (item && item.message && item.stack) {
          item = {
            message: item.message,
            stack: item.stack
          }
        }

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

    slackWithConfig: function () {
      var args = Array.prototype.slice.call(arguments)
      var opts = args.shift()
      var message = getMessage(args)
      console.log(...['Slack:'].concat(args))

      return new Promise((resolve, reject) => {
        if (config.disabled !== true) {
          var params = Object.assign({}, config.hook, opts, {
            text: message
          })

          slack.webhook(params, (error, response) => {
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
    },

    slack: function () {
      return this.slackWithConfig(config.hook, ...arguments)
    }
  }
}
