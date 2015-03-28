/*global React, chai, describe, it, ControllablesMixin*/
const {assert} = chai;


const Thing = React.createClass({
  displayName: 'Thing',
  mixins: [ControllablesMixin],
  controllables: ['value'],
  getDefaultProps() {
    return {defaultValue: 0};
  },
  render() {
    console.log(this.getControllableValue('value'));
    return (
      <div>{ `VALUE:${ this.getControllableValue('value') }` }</div>
    );
  },
  click() {
    // Let's pretend this is a click handler or something.
    this.setState({value: this.getControllableValue('value') + 1});
  },
});


function assertRenderedIncludes(component, str) {
  assert.include(React.renderToString(component), `VALUE:${ str }`);
}


describe('react-controllables', () => {

  describe('an uncontrolled state', () => {

    it('should use the internal default', () => {
      assertRenderedIncludes(<Thing />, 0);
    });

    it('should use the provided default', () => {
      assertRenderedIncludes(<Thing defaultValue={1} />, 1);
    });

  });

  describe('a controlled state', () => {

    it('should use the provided value', () => {
      assertRenderedIncludes(<Thing value={2} />, 2);
    });

    it('should not change the controllable value itself', () => {
      const el = document.createElement('div');
      const thing = React.render(<Thing value={2} />, el);
      thing.click();
      assert.equal(thing.getControllableValue('value'), 2);
    });

    it('should invoke onBlahChange callbacks', () => {
      const App = React.createClass({
        getInitialState() { return {value: 2}; },
        handleValueChange(newValue, oldValue) {
          this.setState({value: newValue});
        },
        render() {
          return (
            <Thing
              ref="thing"
              value={this.state.value}
              onValueChange={this.handleValueChange} />
          );
        },
      });
      const el = document.createElement('div');
      const app = React.render(<App />, el);
      app.refs.thing.click();
      assert.equal(app.state.value, 3);
      assert.equal(app.refs.thing.getControllableValue('value'), 3);
    });

    it('should invoke onBlahChange callbacks even when controlled', () => {
      const App = React.createClass({
        getInitialState() { return {value: 2}; },
        handleValueChange(newValue, oldValue) {
          this.setState({value: newValue});
        },
        render() {
          return (
            <Thing
              ref="thing"
              value={this.state.value}
              onValueChange={this.handleValueChange} />
          );
        },
      });
      const el = document.createElement('div');
      const app = React.render(<App />, el);
      app.refs.thing.click();
      assert.equal(app.state.value, 3);
      assert.equal(app.refs.thing.getControllableValue('value'), 3);
    });

  });

});
