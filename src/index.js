import React from 'react';
import keys from 'object-keys';
import omit from 'lodash.omit';
import pick from 'lodash.pick';
import mapValues from 'lodash.mapvalues';
import isArray from 'isarray';


const mkFirstFunc = method => str => str.slice(0, 1)[method]() + str.slice(1);
const lowerFirst = mkFirstFunc('toLowerCase');
const capFirst = mkFirstFunc('toUpperCase');
const toCallbackName = prop => `on${ prop === 'value' ? '' : capFirst(prop) }Change`;
const fromDefaultName = prop => lowerFirst(prop.slice(7));
const mapKeys = (obj, mapper) => {
  let newObj = {};
  for (let k in obj) {
    if (obj.hasOwnProperty(k)) {
      newObj[mapper(k)] = obj[k];
    }
  }
  return newObj;
};
const merge = (...sources) => {
  let target = {};
  sources.forEach(source => {
    for (let k in source) {
      if (!source.hasOwnProperty(k)) continue;
      let val = source[k];

      // Treat `undefined` the same as a missing key. React also does this for
      // `null`, but that only works because their controlled components can use
      // an empty string to represent "no value." In the general case, we need
      // some way to control a component but give it "no value." We use `null`
      // for that. See GH-1
      if (val === undefined) continue;

      target[k] = val;
    }
  });
  return target;
};

const isDefault = (value, key) => /^default/.test(key);
const omitDefaults = props => omit(props, isDefault);
const pickDefaults = props => pick(props, isDefault);
const noOpInitialize = () => {};


export default function controllable(...args) {
  // Support [Python-style decorators](https://github.com/wycats/javascript-decorators)
  if (args.length === 1) return Component => controllable(Component, ...args);

  const [Component, propsOrStateManager] = args;
  let {reducers, initialize = noOpInitialize} = createStateManager(propsOrStateManager);

  // Create action creators from the reducers.
  const actionCreators = mapValues(reducers, reducer => {
    return function(...args) {
      // Calculate the new state.
      const currentProps = merge(this.state, omitDefaults(this.props), this.boundActionCreators);
      const newState = reducer(currentProps, ...args);

      // Update the state.
      this.setState(newState);

      // If there are callbacks for the changed values, invoke them.
      keys(newState).forEach(prop => {
        const newValue = newState[prop];
        const callbackName = toCallbackName(prop);
        const cb = this.props[callbackName];
        if (cb) cb(newValue);
      });
    };
  });

  return class ControllableWrapper extends React.Component {
    constructor(...args) {
      super(...args);

      // Get the initial state from the `default*` props.
      const instanceInitialState = mapKeys(pickDefaults(this.props), fromDefaultName);
      const childProps = merge(instanceInitialState, omitDefaults(this.props));
      this.state = merge(instanceInitialState, initialize(childProps));

      // Create bound versions of the action creators.
      this.boundActionCreators = mapValues(actionCreators, fn => fn.bind(this));
    }

    render() {
      const props = merge(this.state, omitDefaults(this.props), this.boundActionCreators);
      return <Component {...props} />;
    }
  };
}

function createStateManager(propsOrStateManager) {
  // We've already got them!
  if (!isArray(propsOrStateManager)) return propsOrStateManager;

  // Build them from an array of controllable props.
  return {
    reducers: propsOrStateManager.reduce((reducers, prop) => {
      const callbackName = toCallbackName(prop);
      reducers[callbackName] = (currentState, value) => ({[prop]: value});
      return reducers;
    }, {}),
  };
}
