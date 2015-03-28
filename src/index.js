import React from 'react';
import keys from 'object-keys';
import assign from 'object-assign';
import omit from 'lodash.omit';
import pick from 'lodash.pick';
import mapValues from 'lodash.mapValues';


const mkFirstFunc = (method) => (str) => str.slice(0, 1)[method]() + str.slice(1);
const lowerFirst = mkFirstFunc('toLowerCase');
const capFirst = mkFirstFunc('toUpperCase');
const toCallbackName = (prop) => `on${ capFirst(prop) }Change`;
const toDefaultName = (prop) => `default${ capFirst(prop) }`;
const fromDefaultName = (prop) => lowerFirst(prop.slice(7));
const mapKeys = (obj, mapper) => {
  let newObj = {};
  for (let k in obj) {
    if (obj.hasOwnProperty(k)) {
      newObj[mapper(k)] = obj[k];
    }
  }
  return newObj;
};

export default function(Component, controllableProps = []) {
  const defaultsProps = controllableProps.map(toDefaultName);

  let callbacks = {};
  controllableProps.forEach((prop) => {
    const callbackName = toCallbackName(prop);
    callbacks[callbackName] = function(value) {
      let originalCb = this.props[callbackName];
      this.setState({[prop]: value});
      if (originalCb) originalCb(value);
    };
  });

  return class ControllableWrapper extends React.Component {
    constructor(...args) {
      super(...args);

      // Get the initial state from the `default*` props.
      this.state = mapKeys(pick(this.props, defaultsProps), fromDefaultName);

      // Create bound versions of the handlers.
      this.callbacks = mapValues(callbacks, (fn) => fn.bind(this));
    }

    render() {
      const props = assign(omit(this.props, defaultsProps), this.callbacks);
      return <Component {...this.state} {...props} />;
    }
  };
}
