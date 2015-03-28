/*global React, chai, describe, it, Controllables*/
const {assert} = chai;
const {Simulate, findRenderedDOMComponentWithClass, findRenderedComponentWithType: find} = React.addons.TestUtils;


const Thing = React.createClass({
  displayName: 'Thing',
  mixins: [Controllables.Mixin],
  controllables: ['value'],
  getDefaultProps() {
    return {defaultValue: 0};
  },
  render() {
    return (
      <div
          className="clickme"
          onClick={this.handleClick}>
        { `VALUE:${ this.getControllableValue('value') }` }
      </div>
    );
  },
  handleClick() {
    this.setState({value: this.getControllableValue('value') + 1});
  },
});


function click(tree) {
  Simulate.click(findRenderedDOMComponentWithClass(tree, 'clickme'));
}


function assertRenderedIncludes(component, str) {
  assert.include(React.renderToString(component), `VALUE:${ str }`);
}


describe('mixin', () => {

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
      click(thing);
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
              value={this.state.value}
              onValueChange={this.handleValueChange} />
          );
        },
      });
      const el = document.createElement('div');
      const app = React.render(<App />, el);
      click(app);
      assert.equal(app.state.value, 3);
      assert.equal(find(app, Thing).getControllableValue('value'), 3);
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
              value={this.state.value}
              onValueChange={this.handleValueChange} />
          );
        },
      });
      const el = document.createElement('div');
      const app = React.render(<App />, el);
      click(app);
      assert.equal(app.state.value, 3);
      assert.equal(find(app, Thing).getControllableValue('value'), 3);
    });

  });

});
