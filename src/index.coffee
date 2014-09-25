# react-controllables
# ===================

invariant = require 'react/lib/invariant'


getControllableValue = (name, state, props) -> props[name] ? state[name]
capFirst = (str) -> "#{ str[...1].toUpperCase() }#{ str[1...] }"
callbackName = (prop) -> "on#{ capFirst prop }Change"


ControllablesMixin =
  getInitialState: ->
    invariant(
      !!@controllables,
      'Components that use ControllablesMixin must define a controllables array'
    )
    state = {}
    for name in @controllables
      defaultValue = @props["default#{ capFirst name }"]
      if defaultValue? then state[name] = defaultValue
    state
  getControllableValue: (name) -> getControllableValue name, @state, @props
  componentDidUpdate: (prevProps, prevState) ->
    for name in @controllables
      newValue = @state[name]
      continue if newValue is prevState[name]
      oldValue = getControllableValue name, prevState, prevProps
      @props[callbackName name]? newValue, oldValue
    return


module.exports = ControllablesMixin
