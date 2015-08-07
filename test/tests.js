/*global React, chai, describe, it, Controllables*/
const {assert} = chai;
const {Simulate, findRenderedDOMComponentWithClass, findRenderedComponentWithType: find} = React.addons.TestUtils;


class DumbThing extends React.Component {
  render() {
    return (
      <div
          className="clickme"
          onClick={this.handleClick.bind(this)}>
        { `VALUE:${ this.props.value }` }
      </div>
    );
  }
  handleClick() {
    if (this.props.onChange) this.props.onChange(this.props.value + 1);
  }
}

DumbThing.defaultProps = {value: 0};

const Thing = Controllables.controllable(DumbThing, ['value']);


function click(tree) {
  Simulate.click(findRenderedDOMComponentWithClass(tree, 'clickme'));
}


function assertRenderedIncludes(component, str) {
  assert.include(React.renderToString(component), `VALUE:${ str }`);
}


describe('higher-order component', () => {

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
      assert.equal(thing.props.value, 2);
    });

    it('should invoke change callbacks', () => {
      const App = React.createClass({
        getInitialState() { return {value: 2}; },
        handleValueChange(newValue, oldValue) {
          this.setState({value: newValue});
        },
        render() {
          return (
            <Thing
              value={this.state.value}
              onChange={this.handleValueChange} />
          );
        },
      });
      const el = document.createElement('div');
      const app = React.render(<App />, el);
      click(app);
      assert.equal(app.state.value, 3);
      assert.equal(find(app, DumbThing).props.value, 3);
    });

    it('should invoke change callbacks even when controlled', () => {
      const App = React.createClass({
        getInitialState() { return {value: 2}; },
        handleValueChange(newValue, oldValue) {
          this.setState({value: newValue});
        },
        render() {
          return (
            <Thing
              value={this.state.value}
              onChange={this.handleValueChange} />
          );
        },
      });
      const el = document.createElement('div');
      const app = React.render(<App />, el);
      click(app);
      assert.equal(app.state.value, 3);
      assert.equal(find(app, DumbThing).props.value, 3);
    });

  });

});
