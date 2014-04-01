{assert} = chai
{div} = React.DOM


Thing = React.createClass
  displayName: 'Thing'
  mixins: [ControllablesMixin]
  controllables: ['value']
  getDefaultProps: ->
    defaultValue: 0
  render: ->
    div(null, "VALUE:#{ @getControllableValue 'value' }")
  click: ->
    # Let's pretend this is a click handler or something.
    @setState value: @getControllableValue('value') + 1


assertRenderedIncludes = (component, str) ->
  assert.include React.renderComponentToString(component), "VALUE:#{ str }"


describe 'react-controllables', ->
  describe 'an uncontrolled state', ->
    it 'should use the internal default', ->
      assertRenderedIncludes Thing(), 0
    it 'should use the provided default', ->
      assertRenderedIncludes Thing(defaultValue: 1), 1
  describe 'a controlled state', ->
    it 'should use the provided value', ->
      assertRenderedIncludes Thing(value: 2), 2
    it 'should not change the controllable value itself', ->
      el = document.createElement 'div'
      thing = React.renderComponent Thing(value: 2), el
      thing.click()
      assert.equal thing.getControllableValue('value'), 2
    it 'should invoke onBlahChange callbacks', ->
      App = React.createClass
        getInitialState: -> value: 2
        handleValueChange: (newValue, oldValue) ->
          this.setState value: newValue
        render: ->
          (Thing
            ref: 'thing'
            value: this.state.value
            onValueChange: @handleValueChange
          )
      el = document.createElement 'div'
      app = React.renderComponent App(), el
      app.refs.thing.click()
      assert.equal app.state.value, 3
      assert.equal app.refs.thing.getControllableValue('value'), 3
