import invariant from 'invariant';


const getControllableValue = (name, state, props) => props[name] === undefined ? state[name] : props[name];
const capFirst = (str) => `${ str.slice(0, 1).toUpperCase() }${ str.slice(1) }`;
const callbackName = (prop) => `on${ capFirst(prop) }Change`;

export default {

  getInitialState() {
    invariant(
      !!this.controllables,
      'Components that use ControllablesMixin must define a controllables array'
    );
    let state = {};
    for (let i = 0; i < this.controllables.length; i++) {
      let name = this.controllables[i];
      let defaultValue = this.props[`default${ capFirst(name) }`];
      if (defaultValue != null) state[name] = defaultValue;
    }
    return state;
  },

  getControllableValue(name) {
    return getControllableValue(name, this.state, this.props);
  },

  componentDidUpdate(prevProps, prevState) {
    for (let i = 0; i < this.controllables.length; i++) {
      let name = this.controllables[i];
      let newValue = this.state[name];
      if (newValue === prevState[name]) continue;
      let oldValue = getControllableValue(name, prevState, prevProps);
      let cb = this.props[callbackName(name)];
      if (cb) cb(newValue, oldValue);
    }
  },

}
